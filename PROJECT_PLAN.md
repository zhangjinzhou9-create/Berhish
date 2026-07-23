# Campus Flow 结课交付项目计划

更新日期：2026-07-23
项目仓库：`C:\ProgramData\campusflow`
远端仓库：`https://github.com/zhangjinzhou9-create/Berhish.git`
目标平台：Docker + Azure App Service + Azure Database for MySQL

## 1. 最终交付目标

Campus Flow 的最终交付物是一套可以被老师现场打开、操作、验证和复现的 Web Service：

1. 浏览器通过公开 HTTPS 地址访问 Campus Flow。
2. 前端清楚展示 Today、My Profile 和 Account 三条课堂演示主线。
3. Spring Boot 提供 REST API，并组合 REST Countries 与 Open-Meteo 的数据。
4. MySQL 真实保存个人资料和认证数据；云端不是只返回 fallback。
5. JWT、OAuth、角色权限和隐私字段控制可以通过测试或现场操作证明。
6. Docker 镜像可以重建，Azure 使用明确版本的镜像运行。
7. 报告、OpenAPI、截图和现场讲解与最终代码完全一致。

最终不以“页面看起来完成”为标准，而以“老师能看到证据”为标准。

## 2. 当前基线

| 检查项 | 当前状态 | 结论 |
|---|---|---|
| 本地前端 | `http://localhost:8080/index.html` 返回 200 | 可作为继续开发的基线 |
| 本地 Web Service | `/api/home`、`/api/profile`、`/api-docs.html` 返回 200 | 基础 API 可用 |
| 本地数据库 | Docker MySQL 容器健康，公开 Profile 响应显示 `databaseAvailable: true` | 本地持久化链路可用 |
| Docker | App 与 MySQL 两个容器正在运行 | Sidecar 结构可用 |
| 自动化测试 | 已有 6 个安全与时区回归测试 | 测试内容有价值，但当前 Java 25 环境因 Mockito/Byte Buddy 失败，不能计为通过 |
| Azure 地址 | 当前首页、Profile API、Home API 均返回 403 | 云端访问不合格，必须修复 |
| 云数据库 | 旧报告记录 `databaseAvailable: false` | 不能证明云端持久化，必须补齐 |
| 文档一致性 | 报告仍写“密码明文”，代码与 OpenAPI 已使用 BCrypt | 会造成明显扣分，必须修正 |
| Git 状态 | 当前有较多未提交修改和新增文件 | 最终提交前必须清理、复核并形成可追溯提交 |
| 路径文档 | README 仍包含旧的本机目录和旧界面描述 | 必须统一更新为当前项目结构 |

## 3. 建议评分模型

这不是课程官方评分表，而是用于项目自检的 100 分模拟评分。

| 评分项 | 分值 | 老师应看到的证据 |
|---|---:|---|
| Web Service 与外部 API | 20 | `/api/home` 合并国家、城市和天气数据；OpenAPI 可执行 |
| 数据库与数据流 | 15 | Profile 写入后刷新仍存在；容器重启或云端重新访问后仍存在 |
| 认证、授权与隐私 | 15 | BCrypt、JWT 角色限制、OAuth、匿名字段过滤均有测试或截图 |
| Docker 与云端部署 | 25 | 镜像可重建、容器健康、Azure HTTPS 地址返回 200、云数据库可用 |
| 前端与课堂演示 | 15 | 页面简洁、主流程明确、无死按钮、桌面和手机布局可用 |
| 测试、文档与发表 | 10 | 测试通过、报告无旧描述、截图和现场脚本完整 |

内部目标：至少 90/100，且“云端公开访问”“云端真实持久化”“核心测试通过”不得为 0 分。

## 4. 产品与页面范围

### 4.1 保留的页面和入口

- `Today`
- `My Profile`
- `Account` 弹窗
- 独立 API 文档页 `/api-docs.html`
- JWT 角色测试 API

### 4.2 不新增的内容

- 不新增论坛、课程管理、学生名单或管理后台。
- 不新增没有真实数据模型支持的教师/管理员业务页面。
- 不把 API、Docker、OpenAPI 等技术入口塞进普通用户首页。
- 不更换前端框架；继续使用现有 HTML、CSS、JavaScript，降低提交风险。
- 不继续扩展图片、动画或装饰模块。

## 5. 前端优化计划

### 5.1 全局结构

目标：老师打开页面后 10 秒内知道项目是什么、能做什么、下一步点哪里。

- 顶部只保留 `Campus Flow`、`Today`、`My Profile`、语言选择和 `Account`。
- `Today` 与 `My Profile` 改为明确的页面状态，不让点击导航后停在上一段内容的末尾。
- 固定页头不遮挡标题、按钮或锚点。
- 统一主按钮、次按钮、危险/退出按钮和禁用状态。
- 技术实验区继续从正常导航隐藏，但保留代码和 API 文档供老师验收。
- 保留英文、中文、日文切换，最终三种语言使用同一组键值并检查缺失项。

验收：

- 点击 Today 后视口从 Today 标题开始。
- 点击 My Profile 后视口从 My Profile 标题开始，不残留 Daily Tip。
- 所有可见按钮均有有效动作、明确禁用原因或加载状态。

### 5.2 Today 页面

页面内容顺序：

1. 项目名称和一句话用途。
2. Country / City 查询表单。
3. 当前天气。
4. 国家信息。
5. Daily Tip。

具体优化：

- 缩短首屏高度，减少标题和大图对查询表单的挤压。
- 图片只作为背景或少量辅助，不使用五张图片竞争主操作。
- 查询按钮是首要操作；保存地点是登录后的次要操作。
- Search 明确表示“临时查询”；Save to Profile 明确表示“保存为默认地点”。
- 查询时显示 loading；无结果、外部 API 失败和 fallback 必须有不同提示。
- 天气时间必须显示目标城市时区，不使用服务器本地时间冒充城市时间。
- Country、Weather、Tip 的字段数量控制在老师能快速扫读的范围内。

验收：

- 查询 Kyoto/Japan 后显示 Kyoto、Japan、天气、时区和生活建议。
- 输入不存在的城市时给出明确错误或 fallback 标记。
- 未登录点击保存时打开 Account，不假装保存成功。
- 已登录保存后，重新加载页面仍使用保存地点。

### 5.3 My Profile 页面

页面只表达两件事：维护资料、预览/导出简历。

- 桌面端左侧为 Owner Editing，右侧为 Public Resume Preview。
- 手机端先显示公开预览，再显示编辑区域或使用清楚的折叠顺序。
- 访客可查看公开字段，但不能看到 `studentId` 和 `phone`。
- 登录后才启用 Edit；Save 仅在编辑状态可用。
- Cancel 恢复最近一次服务器数据。
- 保存失败时保持输入内容并显示真实错误。
- Export PDF / Print 只输出公开简历，不输出编辑表单、导航和私密字段。

验收：

- 匿名页面与匿名 API 均不泄露学号和电话。
- 登录后编辑城市或简介，保存并刷新后仍存在。
- 打印预览只包含简历区域。

### 5.4 Account 弹窗

- 未登录时只展示 Google 与 GitHub 两种登录方式及各自用途。
- 登录后展示账号、provider、Logout 和对应服务：
  - Google：最近 Calendar 日程。
  - GitHub：公开个人资料和最近仓库。
- 不在普通弹窗中显示原始 JSON。
- 增加 Escape 关闭、关闭后焦点返回 Account、Tab 焦点限制和清楚的加载/错误状态。
- OAuth 不可用时显示“配置未完成/授权失败”，不显示空白面板。

验收：

- 弹窗可用键盘打开和关闭。
- OAuth 成功后页面能识别 provider。
- 未经对应 provider 授权时，Calendar/GitHub API 返回明确的 401 或 403。

### 5.5 响应式与可访问性

必须检查两个固定视口：

- 桌面：1440 × 900。
- 手机：390 × 844。

最低要求：

- 无横向滚动。
- 输入、按钮和文本不重叠。
- 可交互区域在手机上至少 44px。
- 键盘可到达导航、表单和弹窗。
- 文字与背景有足够对比度。
- 支持 `prefers-reduced-motion`。

## 6. 后端与 Web Service 计划

### 6.1 API 合同

保留并稳定以下接口：

| 接口 | 用途 | 最终要求 |
|---|---|---|
| `GET /api/home` | 聚合首页数据 | 支持 country/city；标记真实数据或 fallback |
| `GET /api/profile` | 读取资料 | 匿名过滤私密字段；登录后返回完整字段 |
| `POST /api/profile` | 保存资料 | 必须认证；输入校验；数据库失败不得返回成功 |
| `POST /api/register` | 课程 JWT 注册 | 公开注册只允许 STUDENT |
| `POST /api/authenticate` | JWT 登录 | BCrypt 校验并返回有限时 JWT |
| `GET /api/verify` | 验证 JWT | 返回用户名和角色 |
| `/api/*-area` | 角色授权证明 | STUDENT/TEACHER/ADMIN 权限矩阵保持可测试 |
| `/api/oauth/status` | OAuth 状态 | 返回登录状态和 provider |
| GitHub OAuth API | 读取公开资料/仓库 | 只返回演示所需字段 |
| Google Calendar API | 读取近期日程 | readonly scope，限制返回数量 |

统一改进：

- 成功和错误响应结构统一包含 `success`、`message`、`data` 或 `error`。
- 对 country、city、用户名、密码、Profile 字段增加长度与空值校验。
- 外部 API 设置连接和读取超时。
- 外部 API fallback 明确返回 `fallbackUsed: true`，不能伪装成实时数据。
- OpenAPI 的 servers 同时说明本地和云端地址。

### 6.2 健康检查

新增轻量健康检查，优先使用 Spring Boot Actuator：

- `/actuator/health`
- 应用存活为 `UP`。
- 数据库不可用时应能区分应用存活与数据库未就绪。
- Azure Health Check 使用该路径。

验收：

- 本地和云端健康检查返回 200。
- Azure 重启或换镜像后能够自动确认新实例健康。

### 6.3 外部 API 可靠性

- REST Countries 和 Open-Meteo 调用失败时，接口必须说明数据不是实时结果。
- 保存 Profile 不允许使用 fallback 假装持久化成功。
- 日志记录外部 API 名称、状态和耗时，但不记录 token 或个人密钥。
- 对外部 API 的返回值只提取项目需要的字段。

## 7. 数据库计划

### 7.1 本地

- MySQL 8 容器保持为 `campus-flow-mysql`。
- 数据使用命名卷 `campus_flow_mysql_data`。
- 初始化 SQL 必须可重复执行或只在空库执行。
- `personal_info` 与 `auth_users` 的表结构、字段用途和示例数据写入 README。
- 本地密码通过 `.env` 提供；Compose 中不继续硬编码正式密码。

### 7.2 云端

最终目标使用 Azure Database for MySQL Flexible Server：

- App Service 与 MySQL 使用同一区域。
- 连接使用 SSL。
- App Service 通过环境变量获得 JDBC URL、用户名和密码，或使用 Azure Service Connector。
- 云数据库完成 schema 初始化。
- 云端 `GET /api/profile` 必须显示 `databaseAvailable: true`。
- 云端保存 Profile 后，重启 App Service 再读取，修改仍然存在。

生产配置不得默认回退到本地容器文件来冒充长期持久化。H2 只允许作为测试或明确标记的临时模式。

## 8. 认证与安全计划

必须保留并证明：

- 密码使用 BCrypt，不保存明文。
- 旧明文记录只允许在成功登录后升级。
- `JWT_SECRET` 在生产环境必须通过环境变量提供；缺失时生产启动应失败或禁用 JWT。
- JWT 包含过期时间，旧源码密钥不能伪造新 token。
- 公共注册不能创建 TEACHER 或 ADMIN。
- 匿名 Profile 不返回 `studentId` 和 `phone`。
- Profile 写入需要 OAuth session 或有效 JWT。
- Google 使用 Calendar readonly scope。
- GitHub 只申请读取公开资料所需权限；如果不需要写仓库，不申请写权限。
- 日志、截图、报告和 Git 仓库中不得出现 client secret、数据库密码或 token。

提交前增加一次 secret scan，并检查 `.env` 未被 Git 跟踪。

## 9. Docker 计划

### 9.1 镜像

- 使用多阶段构建。
- 构建阶段运行测试，不再长期使用跳过测试的发布命令。
- 运行阶段只包含 JRE 和应用 JAR。
- 固定 Java 17，与 `pom.xml` 和课程运行环境一致。
- 增加非 root 用户运行应用。
- 增加容器健康检查或由 Azure Health Check 检查应用端点。
- 检查 `.dockerignore`，排除 target、截图、报告、Git 和本地密钥。

### 9.2 标签

不只发布 `latest`，每次课堂候选版本使用不可变标签：

```text
berhish/campus-flow:course-final-YYYYMMDD
```

Azure 固定使用已验证标签。只有验证通过后再同步 `latest`。

### 9.3 本地容器验收

```powershell
docker compose build --no-cache
docker compose up -d
docker compose ps
```

必须证明：

- app 与 mysql 均健康。
- 首页、Profile API、Home API、API Docs 均返回 200。
- Profile 修改在重建 app 容器后仍存在。
- 日志无持续数据库连接错误和 OAuth 配置异常。

## 10. Azure 云端计划

### 10.1 App Service 配置

- 使用 Linux Custom Container。
- 镜像来自 Docker Hub 的明确版本标签。
- 容器端口为 8080；App Service 配置 `WEBSITES_PORT=8080`。
- `APP_BASE_URL` 设置为最终 HTTPS 域名。
- `SPRING_PROFILES_ACTIVE=prod`。
- 配置数据库、JWT、Google、GitHub 和日志级别环境变量。
- 打开容器日志。
- 健康检查路径设置为 `/actuator/health`。
- 检查当前 403 的来源：App Service 停止、访问限制、认证网关或容器启动失败。

### 10.2 OAuth 云端回调

GitHub 和 Google 均注册最终地址：

```text
https://<final-domain>/login/oauth2/code/github
https://<final-domain>/login/oauth2/code/google
```

`APP_BASE_URL`、OAuth 控制台配置和浏览器实际地址必须完全一致。

### 10.3 云端验收

以下地址必须从非本机环境返回 200：

```text
https://<final-domain>/index.html
https://<final-domain>/api/home?country=Japan&city=Kyoto
https://<final-domain>/api/profile
https://<final-domain>/api-docs.html
https://<final-domain>/actuator/health
```

同时验证：

- 首页查询使用真实外部 API。
- Profile 云数据库可读写。
- App Service 重启后数据仍存在。
- GitHub OAuth 登录和 API 调用成功。
- Google OAuth 登录和 Calendar readonly 调用成功。
- 页面没有混合内容、错误回调或跨域问题。

Azure App Service 的自定义容器端口、健康检查和应用设置以 Microsoft 官方文档为准：

- https://learn.microsoft.com/en-us/azure/app-service/reference-app-settings
- https://learn.microsoft.com/en-us/azure/service-connector/how-to-integrate-mysql

## 11. 测试计划

### 11.1 固定测试环境

- 使用 Java 17 运行 Maven 测试。
- 修复当前 Java 25 下 Mockito/Byte Buddy 无法加载的问题。
- CI、Docker 构建和本地验收使用同一主版本 JDK。

### 11.2 自动化测试

现有 6 个测试继续保留：

1. 匿名注册不能创建 ADMIN。
2. 密码以 BCrypt 保存且可正常登录。
3. 旧源码密钥不能伪造 ADMIN token。
4. 匿名不能写 Profile，JWT STUDENT 可以写。
5. 匿名 Profile 隐藏私密字段。
6. Weather 使用目标城市时区。

需要补充：

- 无效 country/city 输入。
- 外部 API 超时与 fallback 标记。
- Profile 字段长度和空值校验。
- 数据库写入失败时返回失败。
- JWT 过期和错误角色矩阵。
- OAuth 未登录状态接口。
- 健康检查。

### 11.3 端到端测试

建立一条固定 happy path：

```text
打开云端首页
→ 查询 Kyoto/Japan
→ 登录
→ 保存默认地点
→ 编辑 Profile
→ 刷新确认持久化
→ 查看 GitHub 或 Calendar 数据
→ 打开 API Docs 验证一个 GET 和一个受保护接口
```

任何一步失败，课堂候选版本不得标记为 final。

## 12. 文档与证据计划

需要同步修改：

- `README.md`
- `REQUIREMENTS.md`
- `report.md`
- `OAUTH_SETUP.md`
- `openapi.yaml`

必须修正：

- 删除“密码明文保存”的旧描述。
- 删除把 cloud fallback 当作数据库通过证据的描述。
- 更新项目路径为 `C:\ProgramData\campusflow`。
- 更新最终 Azure URL、镜像标签和 OAuth callback。
- 前端截图必须来自最终构建，不使用旧版界面截图。
- 测试结果必须来自最终 commit 和 Java 17 环境。

最终证据包：

1. 首页桌面截图。
2. 手机布局截图。
3. Today 查询成功截图。
4. Profile 编辑与保存截图。
5. 匿名字段过滤 API 截图。
6. OAuth 成功截图。
7. JWT 角色授权截图。
8. Docker 两容器健康截图。
9. Docker Hub 版本标签截图。
10. Azure 首页、API、Health Check 和数据库持久化截图。
11. Maven 测试通过摘要。
12. Git commit 与最终 release tag。

## 13. 课堂发表脚本

建议总时长 6–8 分钟。

### 0:00–0:40 项目目的

- Campus Flow 是留学生个人校园仪表板。
- 一个 Spring Boot Web Service 聚合外部 API，并提供可保存的个人资料。

### 0:40–2:00 前端主流程

- 打开 Azure HTTPS 页面。
- 查询 Kyoto/Japan。
- 说明 Weather、Country、Daily Tip 来自后端聚合结果。

### 2:00–3:20 数据库

- 打开 My Profile。
- 登录、修改一个可见字段并保存。
- 刷新页面证明不是前端临时状态。
- 说明本地使用 Docker MySQL，云端使用 Azure MySQL。

### 3:20–4:30 Web Service

- 打开 API Docs。
- 执行 `/api/home`。
- 展示输入参数与 JSON 响应。

### 4:30–5:30 认证

- 展示匿名字段过滤。
- 展示一个 JWT 角色允许/拒绝结果。
- 展示 GitHub 或 Google OAuth 的实际返回。

### 5:30–6:30 部署

- 展示 Docker 两容器。
- 展示 Docker Hub 明确版本标签。
- 展示 Azure App Service 与健康检查。

### 6:30–结束 总结

- 重申浏览器、后端 API、数据库、认证、Docker 和云端形成完整链路。
- 不声称未实现的多人系统或管理后台。

## 14. 执行阶段与门禁

### 阶段 0：冻结范围与清理基线

- 确认三条前端主线。
- 更新路径和安全描述。
- 清理密钥风险。
- 固定 Java 17。

通过门禁：本地构建、测试和四个基础 URL 可复现。

### 阶段 1：前端收敛

- 修复导航落点。
- 压缩 Today 首屏。
- 完善 Profile、Account、响应式和错误状态。

通过门禁：桌面/手机 happy path 无布局错误和死按钮。

### 阶段 2：后端、数据库与安全

- 稳定 API 合同。
- 增加输入校验、健康检查和 fallback 标记。
- 证明本地持久化与安全边界。

通过门禁：自动化测试通过，匿名/登录权限符合预期。

### 阶段 3：Docker 发布候选

- 无缓存重建镜像。
- 使用明确版本标签。
- 运行 Compose 端到端验收。

通过门禁：应用重建后数据仍存在，日志无严重错误。

### 阶段 4：Azure 完整部署

- 修复 403。
- 连接 Azure MySQL。
- 配置 OAuth callback、环境变量、日志和健康检查。

通过门禁：公开地址全部返回 200，云端保存和重启持久化通过。

### 阶段 5：报告与发表

- 重新截图。
- 同步 README、Report、OpenAPI。
- 按 6–8 分钟脚本彩排。

通过门禁：报告的每项“Passed”都有最终版本证据。

## 15. 最终完成标准

只有以下全部成立，项目才可标记完成：

- [ ] 最终代码已提交，工作树没有遗漏的临时修改。
- [ ] Java 17 下 Maven 测试全部通过。
- [ ] Docker 镜像从最终 commit 构建成功。
- [ ] 本地 Compose 的 app 与 mysql 均健康。
- [ ] 前端桌面和手机主流程通过。
- [ ] 本地 Profile 持久化通过。
- [ ] Azure 公开首页和 API 返回 200，不再返回 403。
- [ ] Azure Profile 使用真实持久化数据库，`databaseAvailable: true`。
- [ ] Azure 重启后 Profile 数据仍存在。
- [ ] GitHub OAuth 和 Google OAuth callback 与最终域名一致。
- [ ] OAuth、JWT、匿名隐私过滤均有证据。
- [ ] OpenAPI 与真实后端一致。
- [ ] README、Requirements、Report 与最终代码一致。
- [ ] 最终截图全部来自同一候选版本。
- [ ] 课堂发表脚本完成一次完整彩排。

## 16. 当前最高优先级

1. P0：修复 Java 17 测试基线，不能继续引用旧的“6/6 通过”结论。
2. P0：修复 Azure 403，恢复公开可访问。
3. P0：接入 Azure MySQL，禁止把 fallback 当作云端数据库通过。
4. P0：修正报告中的明文密码、旧路径和旧云端结论。
5. P1：收敛 Today 首屏并修复 My Profile 导航落点。
6. P1：完善 Account 键盘操作与 OAuth 错误状态。
7. P1：增加 Health Check、输入校验和 cloud smoke test。
8. P2：最后重做截图、发布标签和发表材料。
