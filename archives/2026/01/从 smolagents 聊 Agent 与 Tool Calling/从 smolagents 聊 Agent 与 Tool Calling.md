从 smolagents 聊 Agent 与 Tool Calling

2026-01-19 AI, Agent, LLM

## 1. 引言：Agent 到底是什么？

最近读了 HuggingFace 的 **smolagents** 文档[[1\]](#ref1)，里面对 "What are agents?" 有一段非常清晰的阐述。简单来说：**Agent 是一种让 LLM 输出能够控制程序流程的系统**——不再仅仅是"生成文本"，而是"做决策、调工具、执行动作"。

这让我想起之前写的那篇关于客服场景 Agent 可维护性的文章。当时我们聊的是 "Prompt Debt"（提示词技术债），本质上就是在追问：当 Agent 越来越复杂，我们该如何管理它的行为？

今天换个角度，从 smolagents 的设计哲学出发，聊聊 **Agent 的本质** 以及 **Tool Calling 的工程实践**。

## 2. Agent 是一个光谱，而非二元开关

smolagents 文档中有一个很有洞见的观点：**Agent 不是一个非此即彼的概念，而是一个连续的光谱。**

### 2.1 从简单到复杂的演进

- **Level 0 - 纯生成**：LLM 接收输入，输出文本。没有任何流程控制。这是最基础的 ChatBot。
- **Level 1 - 条件路由**：LLM 的输出决定走哪条分支（比如"这是投诉还是咨询？"），本质上是一个 Router。
- **Level 2 - 单步工具调用**：LLM 决定调用哪个外部工具（Function Calling），执行一次，返回结果。
- **Level 3 - 多步 Agent**：LLM 在一个循环中持续决策——"思考 → 行动 → 观察 → 再思考"，直到任务完成。这就是 ReAct 范式[[2\]](#ref2)。
- **Level 4 - Multi-Agent**：多个 Agent 协作，甚至一个 Agent 可以启动另一个 Agent。

这个光谱的启示在于：**不是所有场景都需要 Level 4 的复杂度**。很多时候，一个简单的 Level 2（单步工具调用）就够了，过度设计反而会增加维护成本。

## 3. Tool Calling：Agent 的"手"

如果说 LLM 是 Agent 的"大脑"，那 Tool Calling 就是它的"手"。smolagents 把这块讲得很透彻，核心要素有三个：

### 3.1 工具描述（Tool Description）

每个工具需要一份清晰的"说明书"，告诉 LLM：

- 这个工具能做什么（功能描述）
- 需要什么参数（输入格式）
- 会返回什么（输出格式）

写得好的工具描述，LLM 一看就知道什么时候该用、怎么用。写得差的，要么被误用，要么被忽略。

### 3.2 调用格式（Action Format）

LLM 要"说出"它想调用什么工具、传什么参数。smolagents 支持两种格式：

- **JSON 格式**：结构化、易解析，但 token 消耗略高。
- **Code 格式**：直接生成 Python 代码片段，灵活度更高，但需要沙箱执行。

选哪种取决于场景。对于客服场景，我倾向于 JSON——更可控、更容易做日志和审计。

![Tool Calling 流程示意](/images/posts/tool calling.gif)

▲ Tool Calling 的执行流程：LLM 决策 → 工具调用 → 结果返回 → 继续推理

### 3.3 解析器（Parser）

LLM 的输出是文本，需要一个 Parser 把它转成可执行的指令。这里有个坑：**LLM 不总是乖乖按格式输出**。

解决方案通常有两个：

1. **Prompt 约束**：在 System Prompt 里反复强调输出格式，用 Few-shot 示例加强。
2. **容错解析**：Parser 要能处理一些"差不多对"的输出，比如多余的空格、字段顺序不对等。

## 4. 记忆（Memory）：Agent 的"上下文管理"

对于多步 Agent，**Memory** 是不可或缺的组件。它存储了：

- 对话历史
- 之前的工具调用结果
- 中间推理过程

smolagents 的设计思路是：每一步循环都把历史信息拼进 Prompt，让 LLM "看到" 之前发生了什么，从而做出连贯的决策。

### 4.1 Memory 的工程挑战

理想很美好，现实有几个坑：

- **Context 膨胀**：多轮对话后，历史信息越来越长，Token 消耗剧增，还可能触发 "Lost in the Middle" 问题[[3\]](#ref3)。
- **信息筛选**：不是所有历史都重要。需要一套策略来决定保留什么、丢弃什么。
- **状态一致性**：Memory 里存的信息要和外部系统（比如数据库、订单状态）保持同步。

我的做法是：**分层存储**。核心事实（用户身份、订单号）放在 Short-term Memory，长期知识放在 RAG 里检索。两者分开管理，各司其职。

## 5. 错误处理：设计时就要假设 Agent 会出错

smolagents 文档里有句话我很认同：**"Since LLM outputs are unpredictable, you should expect errors."**

Agent 系统的错误来源有很多：

- LLM 输出格式不对，Parser 解析失败
- 工具调用超时或返回异常
- LLM 的推理逻辑本身就错了（幻觉）

### 5.1 实用的错误处理策略

1. **重试机制**：对于格式错误，可以把错误信息反馈给 LLM，让它"再来一次"。
2. **Fallback 路径**：关键场景要有兜底方案——比如转人工、返回标准话术。
3. **日志与监控**：记录每一步的输入输出，出问题时能快速定位。

这和我之前说的 "确定性护栏（Deterministic Guardrails）" 是一脉相承的——**在 Agent 的灵活性和系统的可控性之间，找到平衡点**。

## 6. 什么时候不该用 Agent？

smolagents 文档也提醒了这一点：**Agent 不是银弹**。以下场景，传统的 if/else 逻辑可能更合适：

- **流程完全确定**：用户请求的类型有限，每种类型的处理路径都能预先定义好。
- **对延迟敏感**：多步 Agent 需要多次 LLM 调用，延迟会累积。
- **对可靠性要求极高**：LLM 的输出本质上是概率性的，某些场景（金融、医疗）容不得任何差错。

我的判断标准是：**如果能用规则覆盖 80% 的场景，那就先用规则**。把 Agent 留给那些真正需要"智能判断"的长尾问题。

## 7. 结语

从 smolagents 的设计哲学回看，Agent 系统的核心挑战其实是：**如何在 LLM 的灵活性与工程系统的可控性之间取得平衡**。

- **Tool Calling** 赋予了 Agent 与外部世界交互的能力，但也带来了格式约束、错误处理的复杂度。
- **Memory** 让 Agent 能够"记住"上下文，但也需要精细的管理策略来控制成本和保持一致性。
- **多步推理** 让 Agent 能够处理复杂任务，但也增加了延迟和不确定性。

最终的答案不是"用不用 Agent"，而是**"在这个光谱上，我的场景应该站在哪个位置"**。

------

### References

1. Hugging Face. (2025). smolagents - Introduction to Agents. https://huggingface.co/docs/smolagents/conceptual_guides/intro_agents
2. Yao, S., et al. (2023). ReAct: Synergizing Reasoning and Acting in Language Models. *ICLR*.
3. Liu, N. F., et al. (2024). Lost in the Middle: How Language Models Use Long Contexts. *TACL*.

© Curtis Mei