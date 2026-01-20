# 本体码打印功能更新

## 更新内容

将本体码打印功能从浏览器的 `window.print()` 改为调用后端批量打印接口，并优化打印内容的尺寸适配。

## 主要变更

### 1. 新增批量打印接口类型定义 (`src/types/printer.ts`)

```typescript
// 批量打印请求参数
export interface BatchPrintRequest {
  barcodeId: number
  copies: number
  ip: string
  operator: string
  port: number
  printData: string // base64图片数据
  printType: string // 打印类型：BODY(本体码)、INNER(内标)、LABEL(外标)
  printerId: string
  priority: number
}

// 批量打印响应
export interface BatchPrintResponse {
  code: number
  data: boolean
  msg: string
  success: boolean
}
```

### 2. 新增批量打印服务方法 (`src/services/printer.ts`)

```typescript
export async function batchPrint(printRequests: BatchPrintRequest[]): Promise<BatchPrintResponse> {
  return request.post<BatchPrintResponse>('/printer/batch-print', printRequests)
}
```

### 3. 优化DOM转图片工具 (`src/utils/domToImage.ts`)

- 使用203 DPI（标签打印机标准分辨率）替代96 DPI
- 精确控制输出图片尺寸为48mm x 6mm
- 提高打印质量和清晰度

### 4. 重构PrintBody页面打印逻辑 (`src/pages/PrintBody/index.tsx`)

**核心改进：**
1. 创建专门用于打印的隐藏DOM结构，精确控制48mm x 6mm尺寸
2. 动态生成打印用的QRCode区域和条形码区域
3. 使用内联样式确保尺寸精确匹配打印要求

**新增函数：**
- `createPrintQRSection()`: 创建48mm x 6mm的QRCode打印区域
  - QRCode: 5mm x 5mm
  - 信息区域: 包含PN、Rev、Model、SN，字体8pt
  - 布局: 横向flex布局，间距1mm
  
- `createPrintBarcodeSection()`: 创建48mm x 6mm的条形码打印区域
  - 条形码: 最大46mm x 5mm
  - 居中对齐

**打印流程：**
1. 选择打印机
2. 等待Canvas渲染完成（300ms）
3. 动态创建QRCode打印DOM（隐藏在屏幕外）
4. 转换为base64图片并添加到打印请求
5. 移除临时DOM
6. 对每个条形码重复步骤3-5
7. 调用批量打印接口
8. 更新打印状态

## 打印尺寸规格

### QRCode区域 (48mm x 6mm)
```
┌─────────────────────────────────────────────┐
│ ┌───┐  PN: 02406294  Rev: B32              │
│ │QR │  Model: Box-B0                        │
│ └───┘  SN: 00052726100                      │
└─────────────────────────────────────────────┘
  5mm    信息区域（自适应）
```

### 条形码区域 (48mm x 6mm)
```
┌─────────────────────────────────────────────┐
│  ║║│││║║║│││║║║│││║║║│││║║║│││║║║│││║║║     │
│  SAAA52725100ZIPA24H62942PB32-001           │
└─────────────────────────────────────────────┘
  最大46mm x 5mm，居中显示
```

## 技术细节

### DPI设置
- 使用203 DPI（标签打印机标准分辨率）
- 48mm = 约382像素
- 6mm = 约48像素

### 字体大小
- 标签（PN、Rev等）: 8pt, 加粗
- 数值: 8pt, 常规
- 行高: 1.2

### 间距
- QRCode与信息区域: 1mm
- 信息行之间: 0.3mm
- 容器内边距: 0.5mm

## 打印数据结构

每个打印任务包含以下信息：
- `barcodeId`: 条码ID
- `copies`: 打印份数（固定为1）
- `ip`: 打印机IP地址
- `operator`: 操作员名称
- `port`: 打印机端口
- `printData`: base64格式的PNG图片数据（48mm x 6mm, 203 DPI）
- `printType`: 打印类型（BODY）
- `printerId`: 打印机ID
- `priority`: 打印优先级

## 依赖包

新增依赖：
- `html2canvas`: 用于将DOM元素转换为Canvas
- `@types/html2canvas`: TypeScript类型定义

## 接口地址

```
POST http://47.110.53.133:7077/printer/batch-print
Content-Type: application/json

Body: BatchPrintRequest[]
```

## 注意事项

1. 每个打印元素（QRCode区域和条形码）都会生成独立的打印任务
2. 图片尺寸固定为 48mm x 6mm
3. 使用203 DPI进行像素转换（1mm ≈ 8px）
4. 临时DOM元素使用绝对定位隐藏在屏幕外（left: -9999px）
5. 打印完成后立即清理临时DOM元素
6. 所有尺寸使用mm单位，确保打印精度
