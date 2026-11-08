# 蔚蓝星球 · Azure Planet

深空星野 + 蓝色星球地平线的 **DeepSeek Harness** 主题。整套 `--dsw-alias-*` 语义色被重新调成深海蓝，主界面面板保持半透明，让行星的弧线、星环和大气辉光从界面后面透出来。

![preview](./preview.png)

## 特点

- **完整 token 覆盖**：154 个 `--dsw-alias-*` 与常用 `--dsw-specific-*` 变量，浅色 / 深色两套都强制为深蓝，切换系统主题不会闪回白色。
- **静态星球场景**：深空渐变、星野 SVG、星云、月亮、带大气层 / 星环 / 云带 / 明暗终止线的冰蓝行星，全部由 CSS + SVG 绘制，无外部图片依赖。
- **面板真正透明**：覆盖 `sidebarCol`、`centerCol` 和聊天根容器 `*_root` 的背景，行星不会被不透明底盖住。
- **右下角 HUD**：`星球` 标签 + `全辉 / 静谧 / 关闭` 三种动效模式 + 全屏按钮；双击标签也可切换模式。选择记在 `localStorage`（键 `dsh-theme-blue-planet/mode`），刷新后保留。
- **礼貌的动效**：页面隐藏时暂停；`prefers-reduced-motion: reduce` 下自动降级。

## 安装

在 DSH 插件市场搜索 **蔚蓝星球** / **Azure Planet**，或：

```bash
dsh plugin --profile desktop add dsh-theme-blue-planet
```

安装后主题立即生效（Host 热挂载）。也可以把本仓库的 `.tgz` 直接拖进市场安装。

## 说明

- 这是一个 **skin**：它强制深蓝配色，不注册 `ThemeService`，所以不会出现在“浅色 / 深色 / 跟随系统”的主题选择器里。想恢复原样，禁用或卸载本插件即可。
- 星环、云带在真实界面里是“透过半透明面板看到的背景层”，会比预览图更淡；这是为了让正文保持可读。
- 推荐在 1280×800 以上窗口使用；更小的窗口会隐藏 HUD 标签，只保留按钮。

## 兼容性

- DSH `>= 0.1.7`
- Web 客户端（桌面端内置浏览器 / Chrome / Edge）

## License

MIT © lianghui
