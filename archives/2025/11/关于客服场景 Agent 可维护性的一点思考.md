# 关于客服场景 Agent 可维护性的一点思考

## 1. 引言：低代码浪潮下的隐形债务

在 ToB 低代码平台领域，**AI 客服** 已成为 Agent 落地的核心场景。企业通过可视化的拖拉拽组件，将垂直业务知识库（RAG）、数据库查询（Database Query）和外部工具（Function Calling）封装成 Agent，极大地降低了 AI 应用的构建门槛。

然而，这种“快速搭建”的便利性背后，往往隐藏着巨大的**工程维护债务**。随着交付深入，简单的 Demo 变成了复杂的生产系统，我们发现了一个严峻的问题：**初期的低代码红利，正在被后期高昂的维护成本所吞噬。**

## 2. 痛点诊断：陷入 "Prompt Debt"（提示词技术债）

在实际交付中，我们面临一个难以持续维护的困境：我们试图用 **“通用逻辑 + 穷举补丁”** 的方式来对抗 **“无限的长尾场景”**。

### 2.1 真实 Case Study：一个“退款问题”的崩坏之路
为了形象说明这个问题，我们可以复盘一个真实的电商客服场景演变：

*   **阶段一（上线初期）**：
    System Prompt 写着：`“你是客服助手，请根据知识库回答问题，态度要亲切。”`
    知识库里有一条通用的《售后服务协议》。
    *结果*：运行良好。

*   **阶段二（由于幻觉导致的第一块补丁）**：
    客户投诉：AI 居然答应了给“数字虚拟商品”退款。
    *修改*：开发人员在 System Prompt 里加了一句：`Restrictions: 严禁通过虚拟商品的退款申请。`

*   **阶段三（规则冲突导致的第二块补丁）**：
    客户投诉：AI 拒绝了一位 VIP 客户的退款申请，但该客户属于特例。
    *修改*：Prompt 变成：`Restrictions: 严禁通过虚拟商品的退款申请，除非客户明确提到是系统故障导致的无法使用，且客户等级为 VIP。`

*   **阶段四（不可维护的“屎山”）**：
    随着业务发展，出现了“预售商品”、“跨境商品”、“赠品”等各种规则。System Prompt 逐渐变成了一份长达 4000 token 的“免责声明”和“逻辑判断树”。
    *后果*：
    1.  **Prompt Bloating**：Token 消耗剧增，响应变慢。
    2.  **Context Pollution**：模型注意力分散，AI 开始记不住最初的指令（比如“态度亲切”），或者在复杂的逻辑判断中出现推理错误。研究表明，当相关信息位于长上下文的中间位置时，模型的检索准确率会显著下降（即 "Lost in the Middle" 现象）[^2]。但即便我们将一些优先级最高的"rules"置于prompt的头尾，在海量Knowledge-Retrieval的context面前，仍然显得力不从心。
    3.  **不敢动**：新来的维护人员不敢删改之前的 Prompt，生怕引发蝴蝶效应，只能继续往上堆叠新的补丁。

## 3. 破局探讨：基于“动态路由与策略检索”的分层架构

要跳出这个循环，我们需要引入 **模块化 (Modularity)**、**动态化 (Dynamic Context)** 和 **数据驱动 (Data-Driven)** 的思维。

### 3.1 语义路由层 (Semantic Router) —— 专人做专事 (Multi-Agent)
**核心理念**：不要让一个 Agent 做所有事。这本质上是 **Multi-Agent System (MAS)** [^5] 的应用。

利用轻量级模型或 Embedding 相似度，在入口处识别用户意图，并将请求分发给对应的 **专家 Agent**。
*   **投诉 Agent**：专注于安抚话术和处理流程。
*   **技术 Agent**：专注于技术细节，内部可采用 **ReAct (Reasoning + Acting)** [^6] 范式，通过“思考-行动-观察”的循环来解决复杂故障。

*   **投诉 Agent**：专注于安抚话术和处理流程，无需加载技术排查的 Prompt。
*   **技术 Agent**：专注于技术细节，排除销售话术干扰。对于复杂的故障排查，该 Agent 内部可采用 **ReAct (Reasoning + Acting)** [^6] 范式，通过“思考-行动-观察”的循环（如先调用接口查询设备状态，再根据状态检索特定维修文档）来分步解决问题，而非单纯依赖一次性问答。

### 3.2 动态策略检索 (Dynamic Policy RAG) —— 解决“补丁”堆叠
**核心理念**：将 Bad Case 从 Prompt 中剥离，变成可检索的数据。

建立一个专门的 **Policy/Correction Database (规则与反例库)**。
*   **数据化**：当出现上述 Case Study 中的“虚拟商品误退款”时，我们不改 Prompt，而是将其处理成一条规则数据：`{query: "退款", condition: "虚拟商品", action: "拒绝", reason: "政策规定"}` 存入向量库。
*   **运行时**：系统不仅检索业务文档，还检索这个规则库。只有当用户问到“退款”相关问题时，才将那条“虚拟商品不退规则”动态加载到 Context 中。
*   **效果**：Prompt 永远保持清爽，但 Agent 却拥有“记忆”，能根据当前问题动态调取历史教训。这实现了 **RAG-based In-Context Learning**，即通过检索与当前输入语义相关的示例来增强模型的上下文学习能力[^3]。

#### 辨析：为什么要独立于通用知识库？
你可能会问：*“直接把这些规则扔进现有的知识库（Knowledge Base）不就行了吗？反正都是 RAG。”*
答案是：**不行，混在一起会稀释“纠错”的权重。**
1.  **检索粒度不同**：通用知识库检索的是“事实（Facts）”，而策略库检索的是“约束（Constraints）”。如果用户问“怎么退款”，通用库会返回一大段流程文档，而策略库需要精准返回“虚拟商品除外”这一条短小精悍的强指令。如果混在一起，长文档的高 Embedding 分数往往会淹没短规则。
2.  **Prompt 位置不同**：在构建 Context 时，我们将通用知识作为 `Reference Context`，而将策略库检索出的内容作为 `Few-shot Examples` 或 `High-Priority Rules` 放在 System Prompt 更关键的位置，强制模型遵循。
3.  **维护周期不同**：知识库相对稳定（产品手册），而策略库是高频更新的（Bad Case 日更）。独立维护能降低工程耦合。

#### Engineering Tip: 如何让 LLM 赋予 Policy 更大的权重？
仅仅把 Policy 检索出来还不够，我们还需要在 Prompt Engineering 层面使用技巧来“加权”：
1.  **XML 标签隔离与强调**：使用 `<CRITICAL_POLICIES>` 等显眼标签包裹检索出的规则，并在 System Prompt 中明确：*“无论 Reference Context 中说什么，一旦与 CRITICAL_POLICIES 冲突，以 CRITICAL_POLICIES 为准。”*
2.  **CoT (Chain of Thought) 引导**：强制要求 Agent 在回答前先进行“自我审查”。例如：*“Answer logic: Step 1 - Check if any retrieval policy applies to this user query. Step 2 - If yes, apply the policy constraint strictly. Step 3 - Generate final response.”*
3.  **负向约束 (Negative Constraints)**：不仅告诉模型“要做什么”，还要明确“**不能**做什么”。对于 Policy 中的禁止项，使用“MUST NOT”等强语气词。

### 3.3 数据驱动优化 (Data-Driven Optimization)
**核心理念**：从“手调”转向“自动编译”。

借鉴 **DSPy**[^4] 等前沿框架的思路，将维护的重心从 Prompt 转移到 **数据集 (Dataset)** 上。
*   **做法**：将收集到的 50 个 Bad Cases 转化为测试集，定义好 Metric，运行 DSPy 的 `Optimizer`。
*   **效果**：算法会自动搜索最优的 Prompt 组合和 Few-Shot 示例，把“玄学”调优变成了“数学”优化。

对于工程落地，除了门槛较高的 DSPy，也可以尝试以下轻量级工具：

1.  **gpt-prompt-engineer**[^7]：
    *   **机制**：自动生成 Prompt，运行 LLM 生成结果，然后让 LLM 当裁判在生成结果间进行两两对战（ELO 评分）。
    *   **特点**：逻辑简单直观，适合快速上手，本质上是一种偏随机搜索的优化策略。
2.  **AutoPrompt**[^8]：
    *   **机制**：用户输入初始任务，LLM 生成测试样例。随后使用当前 Prompt 进行预测、分析结果，并反向优化 Prompt，形成闭环迭代。
    *   **特点**：引入了“反馈循环”，比单纯随机搜索更具针对性。
3.  **SAMMO**[^9]：
    *   **机制**：微软推出的 Prompt 优化框架。它在 Prompt 修改操作上做得非常细致，支持重写、精简、格式转换等多种算子。
    *   **特点**：相比 DSPy 的“编程思维”，SAMMO 更像是一个精细化的“Prompt 编辑器”，文档虽不如 DSPy 完善，但功能模块化做得不错。

### 3.4 进阶思考：从 Prompt Engineering 到 Context Engineering

个人认为，在低代码平台，Prompt Engineering 有必要演变为 **Context Engineering**。

与其费尽心力去雕琢一个完美的 Prompt，不如设计一个**“万金油”的元 Prompt 结构**，而将所有变动的业务逻辑外置到 RAG 知识库中。

**这样做的好处是：**
1.  **量化优化**：针对某条检索不准的 Policy，我们只用去改那条 Policy（增加关键词或权重），优化路径清晰可量化。
2.  **高可维护性**：只需维护一个清洗过的业务规则库，而不是维护一个层层堆叠的 Prompt 屎山。

我们甚至可以将规则库映射到 Prompt 中，形成一个通用的**动态指令模板**：

```xml
<System_Instruction>
  You are a professional customer service agent.
  
  # Dynamic Workflow Execution
  When handling user requests, you MUST follow the steps below:
  
  1. **Policy Check**: 
     - Retrieve relevant rules from <Policy_Database>.
     - IF current query matches any rule in <Retrieved_Policies>, APPLY IT STRICTLY.
     - {{Insert_Dynamic_Policies_Here}}  <!-- 核心：这里动态插入检索到的几条关键规则 -->
  
  2. **Eligibility Check**:
     - Use available tools to check user status (e.g., VIP level, order status).
     - Logic: If user is VIP AND issue is <System_Fault>, override standard refund limits.
  
  3. **Response Generation**:
     - Synthesize the answer using the retrieved <Knowledge_Base> context.
     - Style: Professional and empathetic.
     
  # Output Format (CoT)
  Thinking Process:
  - Policy Match: [Yes/No] -> [Which Rule?]
  - Tool Check: [Result]
  - Final Decision: [Action]
  
  Response: [Your final answer to user]
</System_Instruction>
```

这种方式将“思考路径”（CoT）固定下来，而将“思考内容”（Policies）动态化，实现了架构的解耦。

## 4. 还有没有其他路？（替代方案探讨）

除了上述架构重构，我们在工程实践中通常还会讨论以下几种方案：

### 4.1 方案 A：微调 (Fine-Tuning / SFT)
很多客户第一反应是：“能不能把我的数据拿去微调一下模型？”
*   **优点**：能极好地固化“语气风格”（比如必须像二次元客服）和“固定流程”。
*   **缺点（致命）**：对于 B 端 SaaS 来说，**维护成本过高**。业务规则（如退款政策）是动态变化的，如果每次改规则都要重新训练模型，交付周期和成本都无法接受。另外，SFT 对于数据清洗的要求高，如果只喂一些低质量的、少量的数据根本无法达到显著的效果。
*   **结论**：适合固化 Style，不适合固化 Knowledge 和 Logic。

### 4.2 方案 B：超长上下文 (Long Context Windows)
直接使用支持 128k 甚至 1M Context 的模型，把所有规则书都扔进去。
*   **优点**：开发极其简单，短期内无需设计复杂架构。
*   **缺点**：
    1.  **成本与延迟**：每次对话都带入巨量 Token，计费昂贵且首字延迟（TTFT）高。
    2.  **Lost in the Middle**：虽然模型支持长文本，但在提取中间部分的细微规则时，准确率往往不如短文本 RAG[^2]。
*   **结论**：适合离线分析或高价值低频咨询，不适合高并发的实时客服。

### 4.3 方案 C：确定性护栏 (Deterministic Guardrails)
在 Agent 输出之后，增加一道基于 Python 代码或关键词匹配的“防火墙”（如 NeMo Guardrails）。
*   针对特定的高危问题（如退款金额、承诺性话术），写确定性的 Python 代码校验逻辑。
*   如果 LLM 输出包含敏感词或违规承诺，Guardrail 层直接拦截并强制替换为标准话术，而不需要重构 Prompt。
*   **优点**：绝对安全。对于红线问题可以 100% 拦截。
*   **缺点**：比较死板，难以处理复杂的语义逻辑。
*   **结论**：**它是必需品，但不是全能药**。

## 5. 结语

客服 Agent 的可维护性问题，本质上是**复杂度管理**问题。

*   **微调**试图将复杂度内化到模型权重中（难以更新）；
*   **长上下文**试图依靠模型的暴力计算能力消化复杂度（昂贵且慢）；
*   **分层 RAG 架构**则是将复杂度从 **Context Window** 转移到 **外部存储** 和 **检索系统** 中。

在当前的 LLM 能力阶段，**“分层架构 + 动态检索”** 依然是平衡效果、成本与可维护性的最优解。

---

### References

[^1]: Lewis, P., et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. *NeurIPS*.
[^2]: Liu, N. F., et al. (2024). Lost in the Middle: How Language Models Use Long Contexts. *TACL*.
[^3]: Rubin, O., et al. (2022). Learning To Retrieve Prompts for In-Context Learning. *NAACL*.
[^4]: Khattab, O., et al. (2024). DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines. *ICLR*.
[^5]: Wu, Q., et al. (2023). AutoGen: Enabling Next-Gen LLM Applications. *arXiv*.
[^6]: Yao, S., et al. (2023). ReAct: Synergizing Reasoning and Acting in Language Models. *ICLR*.
[^7]: Shumer, M. (2023). gpt-prompt-engineer. https://github.com/mshumer/gpt-prompt-engineer
[^8]: Lev, E., et al. (2023). AutoPrompt. https://github.com/Eladlev/AutoPrompt
[^9]: Microsoft. (2024). SAMMO: Structure-Aware Multi-Modal Optimization. https://github.com/microsoft/sammo
