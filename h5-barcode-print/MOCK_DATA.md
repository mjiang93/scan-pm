# Mock 数据使用说明

## 打印机 Mock 数据

为了方便开发和测试，系统提供了打印机列表的 Mock 数据功能。

### 启用方式

有两种方式可以启用打印机 Mock 数据：

#### 方式 1：通过环境变量（推荐用于团队开发）

在 `.env.development` 文件中设置：

```env
VITE_USE_MOCK_PRINTERS=true
```

然后重启开发服务器。

#### 方式 2：通过浏览器控制台（推荐用于临时测试）

在浏览器控制台中执行：

```javascript
// 启用 Mock 数据
window.mockUtils.enableMockPrinters()

// 禁用 Mock 数据
window.mockUtils.disableMockPrinters()

// 检查当前状态
window.mockUtils.isMockPrintersEnabled()
```

执行后刷新页面即可生效。

### Mock 数据内容

Mock 数据包含 22 台打印机，分布在不同部门：
- MOM 车间：14 台
- 亚威车间：4 台
- 其他车间：4 台

所有打印机均为 TOSHIBA BA410T 型号，状态为在线（ONLINE）。

### 注意事项

1. Mock 模式会在控制台输出 "使用 Mock 打印机数据" 提示
2. Mock 数据会模拟 300ms 的网络延迟，更接近真实场景
3. localStorage 设置优先级高于环境变量
4. 生产环境不会加载 Mock 工具

### 开发建议

- 在没有后端服务时，使用 Mock 数据进行前端开发
- 在集成测试前，先用真实 API 验证功能
- 提交代码前确保 `.env.development` 中 `VITE_USE_MOCK_PRINTERS=false`
