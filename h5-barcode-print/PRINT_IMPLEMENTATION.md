# 本体码打印实现说明

## 核心思路

**保持页面预览显示不变，打印时按照CSS @media print样式创建精确尺寸的临时DOM**

## 尺寸计算

### 像素转换
- **96 DPI（屏幕标准）**: 1mm ≈ 3.78px
- **48mm x 6mm** = **181px x 23px**

### 具体尺寸
- 容器: 181px x 23px (48mm x 6mm)
- QRCode: 19px x 19px (5mm x 5mm)
- 条形码: 最大174px x 19px (46mm x 5mm)
- 字体: 4pt
- 间距: 0.5mm - 0.8mm (1.9px - 3px)

## 实现流程

### 1. 页面预览（不变）
- 用户在页面上看到的预览效果保持原样
- QRCode区域和条形码区域使用原有样式显示
- 便于用户查看和确认打印内容

### 2. 打印处理（参照CSS @media print）

#### 步骤1: 克隆预览DOM
```typescript
const originalSection = document.querySelector(`.${styles.qrSection}`)
const container = originalSection.cloneNode(true) as HTMLElement
```

#### 步骤2: 应用打印样式（像素单位）
```typescript
const mmToPx = 3.78  // 96 DPI
const width = 48 * mmToPx  // 181px
const height = 6 * mmToPx   // 23px

container.style.cssText = `
  width: ${width}px;
  height: ${height}px;
  background: white;
  display: flex;
  align-items: center;
  padding: ${0.5 * mmToPx}px;
  box-sizing: border-box;
  gap: ${0.5 * mmToPx}px;
  position: absolute;
  left: -9999px;
  top: 0;
`
```

#### 步骤3: 调整子元素尺寸（参照CSS）
**QRCode区域:**
- QRCode容器: 5mm x 5.5mm (19px x 21px)
- QRCode canvas: 5mm x 5mm (19px x 19px)
- 字体: 4pt
- 行间距: 0.2mm (0.76px)
- 标签间距: 0.2mm (0.76px)
- 值间距: 0.8mm (3px)

**条形码区域:**
- 容器: 48mm x 6mm (181px x 23px)
- 条形码: 最大46mm x 5mm (174px x 19px)
- 居中对齐

#### 步骤4: 转换为base64（203 DPI）
```typescript
const qrBase64 = await domToBase64(container, 48, 6)
// domToBase64内部使用203 DPI转换为高质量图片
// 48mm x 6mm @ 203 DPI = 382px x 48px
```

#### 步骤5: 清理临时DOM
```typescript
document.body.removeChild(container)
```

## 打印尺寸规格

### QRCode区域 (48mm x 6mm = 181px x 23px @ 96 DPI)
```
┌──────────────────────────────────────────────┐
│ ┌──┐  PN: 02406294  Rev: B32                │ 6mm (23px)
│ │QR│  Model: Box-B0                          │
│ └──┘  SN: 00052726100                        │
└──────────────────────────────────────────────┘
  5mm   信息区域（自适应）
 (19px)
         48mm (181px)
```

### 条形码区域 (48mm x 6mm = 181px x 23px @ 96 DPI)
```
┌──────────────────────────────────────────────┐
│  ║║│││║║║│││║║║│││║║║│││║║║│││║║║│││║║║      │ 6mm (23px)
│  SAAA52725100ZIPA24H62942PB32-001            │
└──────────────────────────────────────────────┘
         48mm (181px)
```

## 关键参数对照表

| 元素 | CSS @media print | 屏幕像素 (96 DPI) | 打印像素 (203 DPI) |
|------|------------------|-------------------|-------------------|
| 容器宽度 | 48mm | 181px | 382px |
| 容器高度 | 6mm | 23px | 48px |
| QRCode | 5mm x 5mm | 19px x 19px | 40px x 40px |
| 条形码最大宽 | 46mm | 174px | 366px |
| 条形码最大高 | 5mm | 19px | 40px |
| 字体大小 | 4pt | 4pt | 4pt |
| 容器padding | 0.5mm | 1.9px | 4px |
| 元素gap | 0.5mm | 1.9px | 4px |

## 两阶段DPI处理

### 阶段1: DOM渲染（96 DPI）
- 使用像素单位创建临时DOM
- 按照96 DPI计算尺寸（1mm ≈ 3.78px）
- 确保DOM元素正确渲染

### 阶段2: 图片转换（203 DPI）
- html2canvas转换时使用203 DPI
- 输出高质量打印图片
- 48mm x 6mm @ 203 DPI = 382px x 48px

## 样式来源

所有打印样式严格参照 `index.module.less` 中的 `@media print` 部分：

```less
@media print {
  .qrSection {
    width: 48mm !important;
    height: 6mm !important;
    padding: 0.5mm !important;
    gap: 0.5mm !important;
    
    .qrCode {
      width: 5mm !important;
      height: 5.5mm !important;
      canvas {
        width: 5mm !important;
        height: 5mm !important;
      }
    }
    
    .qrInfo {
      gap: 0.2mm !important;
      .qrInfoRow {
        font-size: 4pt !important;
        line-height: 1 !important;
        .qrLabel {
          margin-right: 0.2mm !important;
        }
        .qrValue {
          margin-right: 0.8mm !important;
        }
      }
    }
  }
  
  .barcodeSection {
    width: 48mm !important;
    height: 6mm !important;
    padding: 0.5mm !important;
    canvas {
      max-width: 46mm !important;
      max-height: 5mm !important;
    }
  }
}
```

## 优势

1. ✅ **页面预览正常显示** - 用户体验不受影响
2. ✅ **打印尺寸精确** - 严格按照CSS @media print样式
3. ✅ **内容完整** - 所有信息都能正确显示
4. ✅ **高清晰度** - 203 DPI确保打印质量
5. ✅ **样式一致** - 与原生window.print()效果相同
6. ✅ **资源管理** - 临时DOM及时清理，无内存泄漏

## 注意事项

1. 临时DOM使用像素单位（px），便于html2canvas处理
2. 使用96 DPI计算DOM尺寸（1mm ≈ 3.78px）
3. html2canvas转换时使用203 DPI输出高质量图片
4. 样式严格参照CSS @media print部分
5. 字体使用pt单位（4pt），与CSS保持一致
6. 每次转换后立即清理临时DOM
