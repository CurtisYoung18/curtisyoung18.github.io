# 从 Tool Calling 机制聊 Agent 的工程实现

2025-07-22 AI, Agent, LLM

## 1. 引言：Agent 是怎么"动手"的？

最近在研究各种 Agent 框架的实现，一个核心问题浮现出来：**LLM 是怎么可靠地调用外部工具的？**

这听起来简单——不就是让模型输出个 JSON 吗？但深入下去会发现，这里面藏着从"学术 Demo"到"生产系统"的鸿沟。

## 2. 两种 Tool Calling 范式

### 2.1 文本解析式（经典 ReAct）

2022 年 ReAct 论文[^1]提出的原始方案是**纯文本解析**：

```
Thought: 我需要查询用户的订单状态
Action: query_order[user_id=12345]
Observation: 订单已发货，预计明天送达
Thought: 信息足够了，可以回复用户
Action: finish[您的订单已发货，预计明天送达]
```

系统用正则表达式解析 `Action: tool_name[params]`，提取工具名和参数。

**问题在于**：LLM 不总是乖乖按格式输出。它可能输出：
- `Action: query_order(user_id=12345)` —— 括号错了
- `Action: QueryOrder[user_id=12345]` —— 大小写不对
- `我觉得应该查询一下订单 Action: query_order[...]` —— 格式对但位置不对

于是你开始写越来越复杂的正则，处理各种边界情况。这就是**解析地狱**。

### 2.2 API 原生式（现代方案）

OpenAI 在 2023 年推出 Function Calling，后来演变为 Tool Use。核心思路是：**不要让模型"自由发挥"，而是在解码层面约束输出**。

```python
response = client.chat.completions.create(
    model="gpt-4",
    messages=messages,
    tools=[{
        "type": "function",
        "function": {
            "name": "query_order",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"}
                }
            }
        }
    }],
    tool_choice="auto"
)
```

模型返回的不是自由文本，而是**结构化对象**：

```json
{
  "tool_calls": [{
    "id": "call_abc123",
    "function": {
      "name": "query_order",
      "arguments": "{\"user_id\": \"12345\"}"
    }
  }]
}
```

**这是怎么保证的？** 不是靠 Prompt 祈祷，而是**约束解码（Constrained Decoding）**。模型在生成每个 token 时，只有符合 JSON Schema 的 token 才会被允许。这是在模型推理层面做的硬约束。

### 2.3 对比总结

| 维度 | 文本解析式 | API 原生式 |
|------|-----------|-----------|
| 可靠性 | 依赖 Prompt + 正则容错 | 解码层硬约束，接近 100% |
| 开发成本 | 需要写复杂的 Parser | 直接用 SDK |
| 灵活性 | 高（可以自定义任意格式） | 受限于 API 支持的 Schema |
| 适用场景 | 开源模型、学术研究 | 生产系统、商业 API |

**结论**：如果用 OpenAI、Anthropic、Moonshot 等商业 API，直接用原生 Tool Calling。只有在用开源模型（如 Llama、Qwen）且它们不支持 Function Calling 时，才考虑文本解析。

## 3. 上下文管理：Agent 的"记忆"难题

当 Agent 需要多步推理时，历史信息会不断累积。一个复杂任务可能需要 10+ 轮工具调用，每轮都有输入输出，Context 很快就会爆炸。

### 3.1 Claude Code 的做法

根据 Anthropic 的技术文档[^2]，Claude Code 采用**自动压缩**机制：

1. **监控阈值**：当 Token 使用达到 ~95% 时触发
2. **注入总结请求**：暂停当前操作，让 Claude 自己总结
3. **结构化摘要**：生成包含"已完成/关键决策/下一步"的 `<summary>`
4. **替换历史**：用摘要替换详细的对话历史
5. **继续执行**：释放 Token 空间后恢复

用户也可以手动触发 `/compact` 命令主动压缩。

### 3.2 Cursor 的做法

Cursor 面对的挑战更大——它要处理整个代码库。它的策略是**分层管理**：

```
┌─────────────────────────────────────┐
│  系统 Prompt + 工具定义（~30%）      │  ← 固定开销
├─────────────────────────────────────┤
│  RAG 检索结果（动态）                │  ← 只取相关片段
├─────────────────────────────────────┤
│  当前文件上下文（动态）              │  ← 大文件只发 outline
├─────────────────────────────────────┤
│  对话历史（可压缩）                  │  ← 达到阈值时总结
└─────────────────────────────────────┘
```

关键技巧：
- **大文件处理**：不发全文，只发 outline + 光标附近的代码
- **显式引用**：`@file` 强制包含特定文件，绕过智能筛选
- **向量检索**：代码库预先 Embedding，只检索语义相关的片段

### 3.3 工程启示

上下文管理的核心矛盾是：**信息完整性 vs Token 成本**。

我的实践经验是采用**分层策略**：
1. **Short-term Memory**：当前任务的关键事实（用户 ID、订单号），永远保留
2. **Working Memory**：最近几轮的工具调用结果，定期压缩
3. **Long-term Memory**：历史知识放 RAG，按需检索

## 4. 错误处理：生产系统的必修课

即使用了 API 原生 Tool Calling，工程上仍然要处理各种异常：

### 4.1 常见错误类型

| 错误类型 | 原因 | 处理策略 |
|----------|------|----------|
| 参数缺失 | 模型推理不完整 | 重试 + 错误信息反馈 |
| 工具不存在 | 幻觉出不存在的工具 | 返回可用工具列表 |
| 执行超时 | 外部 API 慢 | 超时机制 + 降级方案 |
| 结果解析失败 | 工具返回非预期格式 | 容错解析 + 默认值 |

### 4.2 重试机制

一个实用的模式是**错误反馈重试**：

```python
def execute_with_retry(tool_call, max_retries=3):
    for attempt in range(max_retries):
        try:
            return execute_tool(tool_call)
        except ToolError as e:
            # 把错误信息反馈给 LLM，让它修正
            messages.append({
                "role": "tool",
                "content": f"[错误]: {e.message}，请检查参数后重试"
            })
            # 重新调用 LLM
            response = call_llm(messages)
            tool_call = response.tool_calls[0]
    
    return fallback_response()
```

### 4.3 确定性护栏

对于高风险操作（删除文件、执行危险命令），不能完全信任 LLM 的判断：

```python
DANGEROUS_COMMANDS = ['rm -rf', 'DROP TABLE', 'format']

def bash_tool(command: str) -> str:
    # 硬编码的安全检查，不依赖 LLM
    if any(danger in command for danger in DANGEROUS_COMMANDS):
        return "[拒绝]: 该命令被安全策略禁止"
    
    return subprocess.run(command, ...)
```

## 5. 什么时候不该用 Tool Calling？

Tool Calling 不是 Silver Bullet。以下场景可能不需要：

- **纯对话场景**：聊天机器人不需要调用外部工具
- **单步查询**：用户问"北京天气"，直接调 API 返回即可，不需要 Agent 循环
- **延迟敏感**：每次工具调用都增加延迟，高频低延迟场景慎用

我的判断标准：**如果任务需要"观察结果 → 调整策略 → 再次行动"的循环，才用 Agent；否则用简单的 API 调用链**。

## 6. 结语

从 Tool Calling 的实现细节可以看出，Agent 系统的工程挑战远不止"让 LLM 更聪明"这么简单。

- **可靠性**需要 API 层面的结构化约束，而非 Prompt 祈祷
- **可扩展性**需要精细的上下文管理，而非暴力塞 Token
- **可维护性**需要分层的错误处理，而非祈祷不出错

这些工程细节，往往是 Demo 和生产系统之间的真正鸿沟。

---

### References

[^1]: Yao, S., et al. (2023). ReAct: Synergizing Reasoning and Acting in Language Models. *ICLR*.
[^2]: Anthropic. (2025). Tool Use - Automatic Context Compaction. https://platform.claude.com/cookbook/tool-use-automatic-context-compaction
© Curtis Mei
