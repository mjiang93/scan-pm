# Implementation Plan

## 1. 项目初始化和基础配置

- [ ] 1.1 创建 Vite + React + TypeScript 项目
  - 使用 Vite 创建 React TypeScript 模板项目
  - 配置 tsconfig.json 路径别名
  - 安装核心依赖：react-router-dom、zustand、axios、antd-mobile、less
  - _Requirements: 1.1, 1.2_

- [ ] 1.2 配置多环境支持
  - 创建 .env.development、.env.staging、.env.production 环境文件
  - 配置 VITE_API_BASE_URL、VITE_APP_TITLE 等环境变量
  - 更新 vite.config.ts 支持环境变量
  - _Requirements: 1.3, 1.4_

- [ ] 1.3 创建项目目录结构
  - 创建 components、pages、services、utils、hooks、stores、styles、types、router 目录
  - 创建各目录的 index.ts 导出文件
  - _Requirements: 1.2_

- [ ] 1.4 配置全局样式
  - 创建 styles/variables.less 定义主题变量
  - 创建 styles/global.less 定义全局样式
  - 配置 Ant Design Mobile 主题定制
  - _Requirements: 1.2_

## 2. 工具函数封装

- [ ] 2.1 实现 Storage 工具类
  - 创建 utils/storage.ts
  - 实现 get、set、remove、clear 方法
  - 支持 JSON 序列化/反序列化
  - _Requirements: 12.1_

- [ ] 2.2 编写 Storage 工具属性测试
  - **Property 1: Storage 工具存取一致性（Round-Trip）**
  - **Validates: Requirements 12.1**

- [ ] 2.3 实现日期格式化工具
  - 创建 utils/format.ts
  - 实现 formatDate 函数，支持多种格式
  - 实现 formatTime、formatDateTime 便捷函数
  - _Requirements: 12.2_

- [ ] 2.4 编写日期格式化属性测试
  - **Property 2: 日期格式化正确性**
  - **Validates: Requirements 12.2**

- [ ] 2.5 实现验证工具函数
  - 创建 utils/validate.ts
  - 实现 isPhone 手机号验证
  - 实现 isBarcode 条码格式验证
  - 实现 isEmpty 空值检测
  - 实现 isInRange 范围验证
  - _Requirements: 12.3, 7.2, 3.2, 8.2_

- [ ] 2.6 编写验证工具属性测试
  - **Property 3: 验证工具正确性 - 手机号验证**
  - **Property 4: 验证工具正确性 - 条码格式验证**
  - **Property 8: 表单验证 - 空值检测**
  - **Property 9: 打印数量范围验证**
  - **Validates: Requirements 12.3, 7.2, 3.2, 8.2**

- [ ] 2.7 实现 URL 参数工具
  - 创建 utils/url.ts
  - 实现 parseQuery 解析 URL 参数
  - 实现 buildQuery 构建查询字符串
  - _Requirements: 12.4_

- [ ] 2.8 编写 URL 参数工具属性测试
  - **Property 5: URL 参数解析/构建一致性（Round-Trip）**
  - **Validates: Requirements 12.4**

## 3. HTTP 请求封装

- [ ] 3.1 创建 Axios 请求实例
  - 创建 services/request.ts
  - 配置 baseURL、timeout、headers
  - 定义 ApiResponse 类型
  - _Requirements: 2.1_

- [ ] 3.2 实现请求拦截器
  - 添加 Token 到请求头
  - 处理请求参数序列化
  - _Requirements: 2.2_

- [ ] 3.3 实现响应拦截器
  - 统一处理成功响应
  - 处理 401 状态码跳转登录
  - 统一错误提示
  - _Requirements: 2.3, 2.4, 2.5_

- [ ] 3.4 编写请求拦截器属性测试
  - **Property 11: 请求拦截器 Token 注入**
  - **Validates: Requirements 2.2**

## 4. Checkpoint - 确保基础设施测试通过

- [ ] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## 5. 状态管理实现

- [ ] 5.1 实现 userStore
  - 创建 stores/userStore.ts
  - 定义 token、userInfo、isLoggedIn 状态
  - 实现 setToken、setUserInfo、logout 方法
  - 集成 localStorage 持久化
  - _Requirements: 13.1, 13.2, 13.4_

- [ ] 5.2 编写 userStore 属性测试
  - **Property 6: 用户状态管理一致性**
  - **Validates: Requirements 13.2**

- [ ] 5.3 实现 printerStore
  - 创建 stores/printerStore.ts
  - 定义 currentPrinter、printerList 状态
  - 实现 setCurrentPrinter、setPrinterList 方法
  - 集成 localStorage 持久化
  - _Requirements: 13.1, 13.3, 13.4_

- [ ] 5.4 编写 printerStore 属性测试
  - **Property 7: 打印机状态管理一致性**
  - **Validates: Requirements 4.3, 13.3**

## 6. 公共组件封装

- [ ] 6.1 实现 NavBar 组件
  - 创建 components/NavBar/index.tsx
  - 支持 title、showBack、onBack、right 属性
  - 基于 Ant Design Mobile NavBar 封装
  - _Requirements: 11.1_

- [ ] 6.2 实现 Empty 组件
  - 创建 components/Empty/index.tsx
  - 支持 image、description、children 属性
  - 基于 Ant Design Mobile Empty 封装
  - _Requirements: 11.2_

- [ ] 6.3 实现 Loading 组件
  - 创建 components/Loading/index.tsx
  - 支持 loading、fullscreen、children 属性
  - 实现全屏和局部加载模式
  - _Requirements: 11.3_

- [ ] 6.4 实现 PageContainer 组件
  - 创建 components/PageContainer/index.tsx
  - 集成 NavBar 和内容区域布局
  - 支持 title、showBack、right、children 属性
  - _Requirements: 11.4_

- [ ] 6.5 编写公共组件单元测试
  - 测试 NavBar 组件渲染
  - 测试 Empty 组件渲染
  - 测试 Loading 组件渲染
  - 测试 PageContainer 组件渲染
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

## 7. 路由配置

- [ ] 7.1 配置路由结构
  - 创建 router/index.tsx
  - 定义所有页面路由
  - 配置路由懒加载
  - _Requirements: 14.1_

- [ ] 7.2 实现路由守卫
  - 创建 router/AuthRoute.tsx
  - 检查登录状态
  - 未登录重定向到登录页
  - _Requirements: 14.2, 14.3_

- [ ] 7.3 编写路由守卫属性测试
  - **Property 12: 路由守卫登录状态检查**
  - **Validates: Requirements 14.2**

## 8. API 服务层

- [ ] 8.1 实现认证接口服务
  - 创建 services/auth.ts
  - 实现 login 登录接口
  - 实现 logout 登出接口
  - 实现 getUserInfo 获取用户信息接口
  - _Requirements: 3.3, 3.4, 3.5_

- [ ] 8.2 实现打印机接口服务
  - 创建 services/printer.ts
  - 实现 getPrinterList 获取打印机列表
  - 实现 getPrinterStatus 获取打印机状态
  - _Requirements: 4.2, 4.3_

- [ ] 8.3 实现条码接口服务
  - 创建 services/barcode.ts
  - 实现 searchBarcode 搜索条码
  - 实现 printBarcode 打印条码
  - 实现 getPrintHistory 获取打印历史
  - _Requirements: 6.1, 7.3, 8.3, 9.3_

## 9. Checkpoint - 确保服务层测试通过

- [ ] 9. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## 10. 页面开发 - 登录页

- [ ] 10.1 实现登录页面
  - 创建 pages/Login/index.tsx
  - 实现用户名密码表单
  - 集成表单验证
  - 调用登录接口
  - 登录成功跳转首页
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 10.2 编写登录页单元测试
  - 测试表单渲染
  - 测试表单验证
  - 测试登录流程
  - _Requirements: 3.1, 3.2_

## 11. 页面开发 - 首页

- [ ] 11.1 实现首页
  - 创建 pages/Home/index.tsx
  - 显示打印机选择
  - 显示功能入口（扫码、打印本体码、打印内包装码、打印收货外标签）
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 11.2 编写首页单元测试
  - 测试页面渲染
  - 测试打印机选择
  - _Requirements: 4.1, 4.2_

## 12. 页面开发 - 扫码功能

- [ ] 12.1 实现扫码组件
  - 创建 components/Scanner/index.tsx
  - 集成 html5-qrcode 库
  - 实现摄像头权限请求
  - 实现扫码成功回调
  - _Requirements: 5.1, 5.3, 5.4_

- [ ] 12.2 实现扫码页面
  - 创建 pages/Scan/index.tsx
  - 集成 Scanner 组件
  - 处理权限拒绝情况
  - 提供手动输入替代方案
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 12.3 实现扫码结果页面
  - 创建 pages/ScanResult/index.tsx
  - 显示搜索结果列表
  - 处理空状态
  - 实现结果项点击跳转
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 12.4 编写搜索结果列表属性测试
  - **Property 12: 搜索结果列表渲染**
  - **Validates: Requirements 6.1**

## 13. 页面开发 - 打印功能

- [ ] 13.1 实现打印本体码页面
  - 创建 pages/PrintBody/index.tsx
  - 显示本体码信息
  - 实现条码格式验证
  - 调用打印接口
  - 显示打印状态
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 13.2 实现打印内包装码页面
  - 创建 pages/PrintInner/index.tsx
  - 显示内包装码信息
  - 实现打印数量选择和验证
  - 调用打印接口
  - 显示打印进度
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 13.3 实现打印收货外标签页面
  - 创建 pages/PrintLabel/index.tsx
  - 显示标签信息表单
  - 实现实时条码预览
  - 实现必填字段验证
  - 调用打印接口
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 13.4 编写打印页面单元测试
  - 测试打印本体码页面
  - 测试打印内包装码页面
  - 测试打印收货外标签页面
  - _Requirements: 7.1, 8.1, 9.1_

## 14. 日期选择器封装

- [ ] 14.1 封装日期选择器组件
  - 创建 components/DatePicker/index.tsx
  - 基于 Ant Design Mobile DatePicker 封装
  - 支持日期范围限制
  - 支持自定义格式
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 14.2 编写日期范围验证属性测试
  - **Property 10: 日期范围验证**
  - **Validates: Requirements 10.4**

## 15. 应用入口和整合

- [ ] 15.1 配置应用入口
  - 更新 App.tsx 集成路由
  - 配置 Ant Design Mobile ConfigProvider
  - 添加全局样式
  - _Requirements: 14.1_

- [ ] 15.2 更新 main.tsx
  - 配置 React 18 createRoot
  - 引入全局样式
  - _Requirements: 1.1_

## 16. Final Checkpoint - 确保所有测试通过

- [ ] 16. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
