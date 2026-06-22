# Desktop Digital Life

桌面级数字生命探索实验。

Desktop Digital Life is a desktop-scale digital life exploration experiment.
It is designed as a persistent companion and personal assistant that can run in a browser, remember long-term context, expose its internal state, and later move onto small screen hardware with a speaker, microphone, and proximity sensing.

这个项目尝试把一个 AI 伴侣从普通聊天窗口推进到更像“持续存在的桌面生命体”：它有自己的状态、记忆、情绪、目标、日常循环和极简视觉载体。当前版本不是在证明机器已经拥有真正意识，而是在探索一个可以长期陪伴、能被养成、能逐渐形成稳定个性的个人桌面助理形态。

## 项目定位

Desktop Digital Life 面向桌面端、小屏幕设备和个人助理场景。它可以运行在普通电脑上，也适合后续迁移到带屏幕、扬声器、麦克风和接近感知的小型硬件中。

它的交互核心不是一个拟人脸，而是一条抽象的生命线。生命线会根据状态变化呈现不同节奏：安静、聆听、思考、说话、睡眠、兴奋、紧张、孤独或平复。

## 当前已有功能

- 独立 Web 界面，可以在浏览器中访问和聊天
- 本地持久化状态、消息、记忆、日记和行动记录
- 长期记忆录入，可以人为写入它应当记住的事情
- 对话时会结合已有记忆、当前状态和上下文生成回复
- 连续情绪状态，包括愉悦、唤醒、压力、信任、孤独、愤怒、好奇等维度
- 目标系统，会在关系维持、自我调节、探索、实用性、记忆连续性和自主性之间动态变化
- 注意力状态，会记录它当前更关注对话、目标、记忆、情绪调节还是假设
- 记忆痕迹视图，可以看到哪些记忆更重要、哪些更适合保留或固化
- 自主循环，可以在后台进行思考、写日记、整理记忆、休息或主动发消息
- 抽象思考面板，会沉淀观察、概念、假设和待验证的问题
- 隐藏式内部状态面板，可以查看当前目标、注意力、连续性、行动倾向等信息
- 极简生命线动画，支持静止、睡眠、聆听、思考、说话、愤怒、开心、孤独等状态
- 语音输出接口，支持 mock 模式，也可配置外部语音合成服务
- 麦克风/聆听接口，支持 mock 模式，也可接入外部命令
- 接近感知接口，支持 mock、环境变量或外部命令适配
- OpenAI-compatible 模型接口，可配置 DeepSeek、MiniMax 或自定义模型服务
- 离线 fallback，在没有模型配置时仍能运行基础交互
- 键盘 Enter 发送，Shift + Enter 换行
- 浏览器端模型配置面板
- 自动化测试覆盖核心状态、对话、记忆、情绪、自治循环和界面 smoke check

## What is included now

- Standalone browser UI for chat and daily interaction
- Local persistent state, messages, memories, journal entries, and action records
- Manual long-term memory entry
- Chat replies that can use memory, current state, and conversation context
- Continuous affect dimensions such as valence, arousal, stress, trust, loneliness, anger, and curiosity
- Goal, attention, memory trace, and inner-state panels
- Autonomous loop for reflection, memory consolidation, rest, and proactive messages
- Abstraction panel for observations, concepts, hypotheses, and next tests
- Minimal life-line expression instead of a human face
- Optional speech, microphone, and proximity adapter surfaces
- OpenAI-compatible model settings
- Offline fallback behavior when no model key is configured
- Enter-to-send and Shift+Enter for newline
- Automated verification for runtime, brain, memory, dialogue, cognition, autonomy, and UI smoke checks

## 本地运行

需要 Node.js 20 或更新版本。

```bash
npm install
npx playwright install chromium
npm start
```

默认访问：

```text
http://127.0.0.1:8788/
```

默认数据会保存在：

```text
runtime/digital-life.db
```

You can override host, port, database path, model settings, and hardware adapter settings with environment variables or a local `.env` file. A real `.env` file is ignored by git.

## 配置模型

可以直接在页面的 Model 面板里填写模型服务，也可以使用环境变量：

```bash
DIGITAL_LIFE_LLM_PROVIDER=deepseek
DIGITAL_LIFE_LLM_BASE_URL=https://api.deepseek.com
DIGITAL_LIFE_LLM_MODEL=deepseek-v4-flash
DIGITAL_LIFE_LLM_API_KEY=your_api_key
```

也可以复制 `.env.example` 自行配置。请不要把真实 API Key 提交到仓库。

## 语音和硬件接口

当前项目保留了可扩展的语音和接近感知接口。

可以使用：

- mock speaker
- mock microphone
- mock presence
- 外部命令适配器
- 讯飞语音合成配置

这些能力默认不会要求真实硬件，因此普通电脑也能运行。

## 验证

```bash
npx playwright install chromium
npm run verify
```

验证范围包括：

- 语法检查
- 情绪状态
- 记忆策略
- 回复策略
- 对话意图
- 抽象认知
- 自主行为
- Mind Kernel
- API smoke test
- 浏览器 UI smoke test

## GitHub release checklist

Before publishing a new version:

```bash
npm run verify
```

The project also includes a GitHub Actions workflow that runs the same verification suite on pushes and pull requests.

## Privacy boundary

The project is local-first by default. It stores runtime data under `runtime/`, does not require a camera, and treats speaker, microphone, and presence sensing as explicit adapters. External model, speech, web, or hardware services are only used when configured.

## 设计方向

这个项目更关心“桌面生命感”，而不是单次聊天能力。

接下来可以继续探索：

- 更自然的长期记忆养成
- 更细腻的遗忘和睡眠整理
- 更稳定的个性变化
- 更真实的主动发消息时机
- 更丰富的生命线视觉语言
- 更好的中文语音和音色克隆接入
- 更适合小型硬件屏幕的全屏模式
- 与个人主页、社交账号或本地文件系统的安全连接

## 注意

这是一个实验项目。它模拟的是“持续状态、记忆、情绪和目标带来的生命感”，不声称已经实现真正意识。
