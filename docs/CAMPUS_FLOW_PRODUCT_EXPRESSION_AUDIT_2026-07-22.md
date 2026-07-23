# Campus Flow 产品表达审计（2026-07-22）

## 1. 审计结论

当前实现已经基本符合“面向留学生的单所有者个人校园仪表板”定位，不需要新增页面或重写结构。主导航只保留 Today 与 My Profile，Account 作为登录和连接入口；Project Entrances、API Docs、OpenAPI、Local API、JWT 角色测试均不占据正常用户界面。

本次发现的主要问题不是功能缺失，而是三处表达边界不够明确：

1. 首页没有直接写明服务对象是留学生，也没有把“今日信息—资料维护—简历导出”讲完整。
2. Search 与 Save to Profile 的数据影响不同，但原页面没有说明；访客按钮还显示为通用的资料编辑提示。
3. Profile 左侧编辑表单曾被描述成“公开预览”，而真正的公开简历预览在右侧，容易让人混淆访客视图和所有者编辑状态。

## 2. 十项产品问题核对

1. **项目目的：通过。** 首页现明确说明这是留学生的个人校园仪表板，并包含本地今日信息、资料维护和简历导出。
2. **首屏理解：通过。** `International Student Dashboard` 与一句话说明在首屏主视觉内出现。
3. **Today / My Profile / Account：通过。** Today 与 My Profile 是唯一主导航；Account 位于固定页头，负责登录和连接服务。
4. **技术入口是否抢视觉：通过。** 正常页面没有 Project Entrances、API Docs、OpenAPI、Local API、GitHub API 测试入口或 Google Calendar API 测试入口。API 文档仍可通过独立 URL 验收。
5. **JWT 角色是否像业务角色：基本通过。** JWT 实验区仍在 HTML/JS 中保留，但隐藏且没有正常导航入口，不会被普通用户误解成三角色管理系统。
6. **Google / GitHub 用户价值：通过。** Account 明确说明 Google 用于近期 Calendar 日程，GitHub 用于公开资料与仓库；两者都允许所有者编辑同一份资料。
7. **公开预览 / 所有者编辑：通过。** 左侧标记为 `Owner Editing Mode`，右侧标记为 `Public Resume Preview`，访客状态说明编辑已锁定且私密字段不展示。
8. **Search / Save to Profile：通过。** 页面明确说明 Search 只临时查看，Save to Profile 更新默认校园地点；访客按钮说明登录后才能保存地点。
9. **导航站 / 技术展示页观感：通过。** 正常用户界面只有个人今日信息、资料和账户连接，没有快捷网址矩阵或项目 API 卡片。源码中仍有未渲染的旧快捷入口数据与样式，但不影响当前产品表达。
10. **前端与后端能力一致性：本次已修正已知文档误差。** OpenAPI 现在说明 BCrypt、公开注册仅允许 STUDENT、匿名资料隐藏 studentId/phone，以及资料更新需要 OAuth 会话或 JWT。前端没有声称不存在的多人资料隔离或 GitHub 私有数据能力。

## 3. 本次最小修改

- `index.html`：修改首页定位文案；增加 Search/Save 说明；增加 Owner Editing Mode 与 Public Resume Preview 标签；调整 Account eyebrow。
- `style.css`：仅为上述说明和标签补充小字号、强调色及网格占位样式。
- `script.js`：同步英中日文案；访客的地点保存按钮改为 `Sign in to save location`；已连接账户仍保留 `Account` 主线并附带 provider 名称。
- `openapi.yaml`：只修正与真实后端不一致的认证、注册、隐私字段和资料更新描述。
- Java 后端未修改；没有新增页面、模块、角色、Demo Mode 或数据模型。

## 4. 仍然存在但本次不建议扩张的事项

- 当前“单所有者”是产品边界，不是按固定账号 allowlist 强制的身份边界；有效 OAuth 会话或 JWT 都会获得编辑权。这与现有产品逻辑文本一致，但若未来真正公开上线，需要单独设计所有者身份绑定。
- 隐藏的 JWT 技术实验区和旧快捷入口数据可以在答辩后清理，但提交前删除会扩大回归范围，且 JWT/API 文档仍属于课程验收证据。
- Account 弹窗以后可以补键盘焦点循环、Escape 关闭和焦点返回；这是可访问性增强，不影响当前产品主线。
- README 与 OAuth 设置文档仍有部分旧界面描述，适合在功能冻结后单独做一次文档同步，本次不建议继续改页面或后端。

## 5. 验证证据

- Docker 镜像重新构建成功，Maven 测试 6/6 通过。
- Docker Compose 中应用与 MySQL 均正常运行；首页返回 HTTP 200。
- `/api/profile` 匿名响应不包含 `studentId`；`/api/home?country=Japan&city=Kyoto` 返回 Kyoto 与 Asia/Tokyo。
- 英文、中文、日文的新定位、地点说明和双模式标签均已在浏览器中验证。
- 最终截图位于 `screenshots/product-expression-audit-20260722/04-today-after.png`、`05-profile-after.png`、`06-account-after.png`。
