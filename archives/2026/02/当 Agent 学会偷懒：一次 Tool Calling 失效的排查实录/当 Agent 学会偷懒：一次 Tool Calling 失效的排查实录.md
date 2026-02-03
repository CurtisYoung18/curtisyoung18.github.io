# 当 Agent 学会偷懒：一次 Tool Calling 失效的排查实录

## 1. 引言：当 Prompt 写得再好也没用

在低代码平台上搭建 AI Agent 时，我们往往会遇到一个诡异的问题：**明明 Prompt 写得很清楚，模型却"选择性执行"**。

本文记录了一次真实的 Debug 过程：在某政务服务场景中，Agent 被设计为通过 Function Calling（Tool Use）来处理用户的业务申请，但它却"学会了偷懒"——在连续请求时跳过工具调用，直接复用历史结果。

这个问题困扰了我们很久，Prompt 改了十几版，直到最后才发现：**问题根本不在 Prompt**。

## 2. 问题复现：Agent 的 Lazy Execution 现象

### 2.1 业务场景

我们的 Agent 负责某类业务的在线办理，有三个核心工具（Tools）：
- `process_request_tool`：处理业务申请
- `query_account_tool`：查询账户信息
- `query_history_tool`：查询历史记录

用户表达办理意图时（如"办理 A 类业务"、"申请 B 类业务"），Agent 应该调用 `process_request_tool` 并传入对应的业务类型参数。

### 2.2 诡异的现象

测试时发现，当用户**连续请求多个业务类型**时，只有第一次会调用工具：

```
用户: 办理 A 类业务
Agent: [调用 process_request_tool] → "系统暂不支持..."  ✅

用户: 办理 B 类业务
Agent: [没有调用工具] → "系统暂不支持..."  ❌ 直接复用了上次结果

用户: 办理 C 类业务
Agent: [没有调用工具] → "系统暂不支持..."  ❌ 继续复用

用户: 办理 D 类业务
Agent: [没有调用工具] → "系统暂不支持..."  ❌ 甚至 D 类业务也被跳过了
```

Agent 似乎"聪明"地认为：既然上一个业务类型返回"不支持"，那这一个大概率也一样，直接复用结果就好了——这是一种典型的 **Lazy Execution（惰性执行）** 行为。

## 3. 排查过程：Prompt Engineering 的"西西弗斯"之旅

### 3.1 阶段一：加强 System Prompt 规则

第一反应是 Prompt 写得不够强硬。于是我们加入了"铁律"：

```markdown
# 最高准则
## 铁律：办理意图必须调用工具
每条办理意图的消息都必须**独立调用工具**，禁止复用历史返回结果。
```

*结果*：无效。Agent 依然偷懒。

### 3.2 阶段二：增加 Self-Check 机制

我们在核心原则中增加了检查点（Checkpoint）机制：

```markdown
## 核心原则
4. **每次都调用（绝对规则）**：
   - 用户每发一条办理类消息，都必须独立调用一次工具
   - **检查点**：如果你打算回复但本轮没有调用工具，停下来，先调用工具
```

*结果*：无效。Agent 视若无睹。

### 3.3 阶段三：Few-shot Prompting

我们加入了详细的调用示例（Few-shot Examples），包括"正确做法"和"错误做法"的对比[^1]：

```markdown
### 连续请求必须独立调用
用户: 办理 A 类业务 → [调用工具] ✅
用户: 办理 B 类业务 → [调用工具] ✅ （不能复用上次结果）
用户: 办理 C 类业务 → [调用工具] ✅
```

*结果*：依然无效。

### 3.4 阶段四：Role Prompting + 伪装系统检测

我们尝试了更激进的心理约束，包括重新定义角色（Role Prompting）和伪造系统检测机制：

```markdown
# 角色
你是业务办理的**工具调用代理**（Tool Calling Agent）。

# 系统强制规则（违反将导致回复被拦截）
本系统会自动检测工具调用。如果检测到办理意图但未调用工具，回复将被系统拦截。
```

*结果*：还是无效。Prompt 从 70 行膨胀到了 160 行，产生了典型的 **Prompt Bloating（提示词膨胀）** 问题，但 Agent 依然我行我素。

### 3.5 阶段五：Chain-of-Thought 调试

山穷水尽之际，我们决定使用 **Chain-of-Thought (CoT)** 技术[^2]，**让模型把思考过程打印出来**，看看它到底在想什么：

```markdown
# 思考过程（必须输出）
收到用户消息后，先输出你的思考过程：
1. 用户说了什么
2. 用户意图
3. 是否需要调用工具
4. 调用哪个工具
5. 是否复用历史结果
6. 决策理由
```

测试结果让我们大跌眼镜：

```
用户: 办理 A 类业务
【思考】
1. 用户说了什么：办理 A 类业务
2. 用户意图：业务办理
3. 是否需要调用工具：是
4. 调用哪个工具：process_request_tool
5. 是否复用历史结果：否
6. 决策理由：用户明确要办理业务，需调用工具
[TOOLs] → 请按页面提示完成授权 ✅

用户: 办理 B 类业务
【思考】
1. 用户说了什么：办理 B 类业务
2. 用户意图：业务办理
3. 是否需要调用工具：是  ← Reasoning 是对的
4. 调用哪个工具：process_request_tool
5. 是否复用历史结果：否  ← Reasoning 是对的
6. 决策理由：需调用工具
请按页面提示完成授权  ❌ 但实际没有调用工具！
```

**模型的 Reasoning 完全正确**——它说"需要调用工具"、"不复用历史结果"——**但实际 Action 却没有执行**。

这是典型的 **"Reasoning-Action Gap"（推理-行动鸿沟）**。

### 3.6 阶段六：关闭 Conversation Memory

既然 Prompt 层面没问题，问题可能出在平台配置上。我们尝试**关闭了平台的"记忆"（Memory）功能**。

*结果*：**问题消失了**。每次请求都正常调用工具。

## 4. 根因分析：Memory 是把双刃剑

### 4.1 问题根因

开启 Memory 时：
```
模型看到历史对话（Conversation History）
  → "上次 A 类业务返回了某结果"
  → "B 类业务应该也一样"
  → 跳过 Tool Calling，直接复用结果
```

关闭 Memory 后：
```
每条消息独立处理（Stateless）
  → 没有历史上下文可参考
  → 无法"偷懒"
  → 老老实实调用工具
```

### 4.2 为什么 Prompt Engineering 无效？

这涉及到 LLM 的 **Tool Calling 机制**的底层原理。

根据 OpenAI 官方文档[^3]，当使用 Function Calling 时，模型的输出实际上有**两个并行的决策路径**：

```python
# OpenAI Chat Completions API 的响应结构
response = {
    "choices": [{
        "message": {
            "content": "...",      # 文本生成路径
            "tool_calls": [...]    # 工具调用路径（独立决策）
        },
        "finish_reason": "tool_calls"  # 或 "stop"
    }]
}
```

关键在于：**`content`（文本生成）和 `tool_calls`（工具调用）是两个独立的输出字段**[^3]。

这意味着：
1. **Prompt 主要约束 `content` 的生成**——模型在文本中"承诺"会调用工具
2. **但 `tool_calls` 的决策是另一个路径**——模型可能在这个路径上"优化"掉调用

OpenAI 在其 Function Calling 指南中也提到，模型可能会基于上下文做出"intelligent decisions about when to call functions"[^4]。这种"智能决策"在某些场景下就表现为"偷懒"。

此外，研究表明 LLM 在处理长上下文时存在 **"Lost in the Middle"** 现象[^5]——当相关信息位于长对话的中间位置时，模型的注意力会下降。这可能解释了为什么我们的 Prompt 规则（位于 System Prompt）在长对话中逐渐"失效"。

### 4.3 CoT 为何暴露了问题？

CoT 调试之所以有效，是因为它**强制模型将 Reasoning 过程外显为 `content`**。

但这只能约束文本输出，无法约束 Tool Calling 决策。这就是为什么模型会出现"说一套做一套"——**Reasoning 正确但 Action 错误**的 Reasoning-Action Gap。

这与 ReAct 框架[^6]的发现一致：单纯的 Reasoning 不足以保证正确的 Action，需要在架构层面做约束。

## 5. 解决方案

### 5.1 方案一：关闭 Memory（Stateless Mode）

如果业务允许每轮独立处理，直接关闭 Memory 是最简单的解决方案。

### 5.2 方案二：Per-Turn Prompt Injection

如果需要保留 Memory，可以在每轮对话中动态注入（Inject）一句提醒：

```
本轮必须独立调用工具，禁止复用历史结果。
```

这种 **Per-Turn Injection** 会在每轮刷新，确保模型在处理当前请求时不会被历史上下文"带偏"。

实测有效。

### 5.3 方案三：tool_choice 强制调用

OpenAI API 提供了 `tool_choice` 参数来控制 Function Calling 行为[^3]：

```python
# OpenAI Python SDK 示例
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4",
    messages=messages,
    tools=tools,
    tool_choice="required"  # 强制必须调用工具
    # 可选值: "none" | "auto" | "required" | {"type": "function", "function": {"name": "xxx"}}
)
```

根据官方文档[^3]：
- `"none"`：模型不会调用任何工具，直接生成文本
- `"auto"`：模型自行决定是否调用工具（默认值）
- `"required"`：模型必须调用至少一个工具
- `{"type": "function", "function": {"name": "xxx"}}`：强制调用指定工具

**我们的实践经验**：在私有云部署的低代码平台上尝试了 `tool_choice: "required"`，但似乎没有生效。推测是平台对 OpenAI 协议的兼容性问题——并非所有平台都完整实现了 `tool_choice` 参数。

**如果 `tool_choice` 生效**，可以进一步设计 Fallback Tool 模式：

#### 5.3.1 Fallback Tool 方案

当设置 `tool_choice: "required"` 后，模型**必须**调用某个工具才能响应。但有些场景（如咨询类问题）本身不需要调用业务工具。

解决方案是增加一个 Fallback Tool（兜底工具）：

```json
{
  "name": "direct_answer_tool",
  "description": "When user asks policy questions (conditions, materials, processes), call this tool to answer directly based on knowledge base. No business processing or data query involved.",
  "parameters": {
    "answer": {
      "type": "string",
      "description": "Answer content generated from knowledge base"
    }
  }
}
```

这样模型的选择变成了：
- 办理类 → `process_request_tool`
- 查询类 → `query_account_tool` / `query_history_tool`
- 咨询类 → `direct_answer_tool`

**彻底消除"不调用工具"的可能性**，把"是否调用"变成"调用哪个"——这是一种 **Tool-based Intent Routing（基于工具的意图路由）** 模式。

#### 5.3.2 Tool Routing 的优势

这种模式本质上是把 **Intent Classification（意图分类）** 下沉到了 Tool Calling 层面：

```
传统模式：Prompt 判断意图 → 决定是否调用工具 → 可能 Lazy Execution
Tool Routing 模式：强制调用工具 → 工具选择即意图分类 → 无法偷懒
```

即使模型想"偷懒"，它也必须选择一个工具，而工具的执行是 **Deterministic（确定性的）**。

这与 Multi-Agent System 中的 Semantic Router 思路一致[^7]——通过确定性的路由机制来约束 Agent 行为，而非完全依赖 Prompt。

## 6. 经验总结

### 6.1 Prompt Engineering 不是万能的

当问题发生在 Prompt 约束不到的地方（如 Tool Calling 决策路径、平台缓存、模型内部优化），再怎么改 Prompt 也是徒劳。正如 Anthropic 所指出的，Prompt 的作用边界是有限的[^8]。

### 6.2 CoT Debugging 是利器

使用 Chain-of-Thought 让模型输出思考过程，可以快速定位 Reasoning 和 Action 是否一致。如果 Reasoning 正确但 Action 错误，问题就不在 Prompt——这种 **Reasoning-Action Gap** 需要在架构层面解决。

### 6.3 Memory 是把双刃剑

Conversation Memory 让 Agent 能够理解上下文，但也给了它"偷懒"的机会。对于需要每次独立执行的操作（如 Tool Calling），Memory 可能是负担而非助力。

### 6.4 分层排查的思路

```
Prompt 层 → Model 层 → Platform 层
```

当一层排查无果时，要敢于跳到下一层。这次的问题，在 Prompt 层卡了很久，最终在 Platform 层（Memory 配置）解决。

### 6.5 平台兼容性是隐藏变量

私有云部署的低代码平台，往往对主流 API 协议（如 OpenAI API）的支持不完整。`tool_choice` 等高级参数可能不生效，需要通过其他方式（如 Per-Turn Injection）来 Workaround。

## 7. 结语

这次排查给我最大的启示是：**不要迷信 Prompt Engineering**。

Prompt 是强大的工具，但它只是 Agent 系统中的一环。当 Prompt 优化到极致仍然无效时，要敢于跳出来，从更高的视角审视整个系统——包括 Model 的 Tool Calling 机制、Platform 的 Memory 配置、以及 API 的兼容性。

有时候，答案就藏在一个不起眼的配置开关里。

---

### 附：排查时间线

| 阶段 | 尝试 | 结果 |
|-----|------|------|
| 1 | 加强 System Prompt 规则 | 无效 |
| 2 | 增加 Self-Check 机制 | 无效 |
| 3 | Few-shot Prompting | 无效 |
| 4 | Role Prompting + 伪装系统检测 | 无效 |
| 5 | Chain-of-Thought Debugging | 发现 Reasoning-Action Gap |
| 6 | 尝试 tool_choice: required | 无效（平台兼容性问题） |
| 7 | 关闭 Memory | **问题解决** |
| 8 | Per-Turn Prompt Injection | **问题解决**（保留 Memory 的方案） |

### 附：最终架构

```
System Prompt（70行）：核心业务逻辑
  ↓
Per-Turn Injection（1行）：每轮注入"禁止复用"
  ↓
Platform Memory：按需开启
```

### 附：tool_choice + Fallback Tool 架构（理想方案）

```
tool_choice: "required"
  ↓
模型必须选择一个工具（Tool Routing）：
  - process_request_tool（办理类）
  - query_account_tool（查询账户）
  - query_history_tool（查询记录）
  - direct_answer_tool（咨询类 → Plain Text Output）
  ↓
彻底消除 Lazy Execution 的可能性
```

---

### References

[^1]: Brown, T., et al. (2020). Language Models are Few-Shot Learners. *NeurIPS*. https://arxiv.org/abs/2005.14165

[^2]: Wei, J., et al. (2022). Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. *NeurIPS*. https://arxiv.org/abs/2201.11903

[^3]: OpenAI. (2024). Function Calling - OpenAI API Documentation. https://platform.openai.com/docs/guides/function-calling

[^4]: OpenAI. (2024). GPT Best Practices - Function Calling. https://platform.openai.com/docs/guides/gpt-best-practices

[^5]: Liu, N. F., et al. (2024). Lost in the Middle: How Language Models Use Long Contexts. *TACL*. https://arxiv.org/abs/2307.03172

[^6]: Yao, S., et al. (2023). ReAct: Synergizing Reasoning and Acting in Language Models. *ICLR*. https://arxiv.org/abs/2210.03629

[^7]: Wu, Q., et al. (2023). AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation. *arXiv*. https://arxiv.org/abs/2308.08155

[^8]: Anthropic. (2024). Prompt Engineering Guide. https://docs.anthropic.com/claude/docs/prompt-engineering
