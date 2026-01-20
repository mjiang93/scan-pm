# 打印尺寸规格说明

## 最终尺寸

**382px x 48px** (48mm x 6mm @ 203 DPI)

## 尺寸计算

```
203 DPI (标签打印机标准分辨率)
1 inch = 25.4mm = 203 pixels
1mm = 203 / 25.4 ≈ 8 pixels

48mm = 48 × 8 = 384px ≈ 382px
6mm = 6 × 8 = 48px
```

## QRCode区域布局 (382px x 48px)

```
┌────────────────────────────────────────────────────────────┐
│ ┌────┐  PN: 02406294  Rev: B32                            │ 48px
│ │ QR │  Model: Box-B0                                      │
│ └────┘  SN: 00052726100                                    │
└────────────────────────────────────────────────────────────┘
  40px    信息区域（自适应，约334px）
                    382px
```

### 详细尺寸
- **容器**: 382px x 48px
- **padding**: 4px
- **gap**: 4px
- **QRCode**: 40px x 40px (5mm @ 203 DPI)
- **信息区域**: 约334px宽
- **字体**: 9px
- **行间距**: 2px
- **标签间距**: 2px
- **值间距**: 6px

## 条形码区域布局 (382px x 48px)

```
┌────────────────────────────────────────────────────────────┐
│  ║║│││║║║│││║║║│││║║║│││║║║│││║║║│││║║║                  │ 48px
│  SAAA52725100ZIPA24H62942PB32-001                          │
└────────────────────────────────────────────────────────────┘
                    382px
```

### 详细尺寸
- **容器**: 382px x 48px
- **padding**: 4px
- **条形码最大**: 366px x 40px (46mm x 5mm @ 203 DPI)
- **居中对齐**

## 元素尺寸对照表

| 元素 | 物理尺寸 | 像素尺寸 (203 DPI) |
|------|----------|-------------------|
| 容器 | 48mm x 6mm | 382px x 48px |
| padding | 0.5mm | 4px |
| gap | 0.5mm | 4px |
| QRCode | 5mm x 5mm | 40px x 40px |
| 条形码最大宽 | 46mm | 366px |
| 条形码最大高 | 5mm | 40px |

## 字体设置

- **字体大小**: 9px (适配382px宽度)
- **字体族**: Arial, sans-serif
- **行高**: 1.2
- **标签**: 加粗
- **颜色**: #000 (纯黑)

## Canvas处理

### QRCode Canvas
```typescript
canvas.style.width = '40px'
canvas.style.height = '40px'
canvas.style.display = 'block'
```

### Barcode Canvas
```typescript
canvas.style.maxWidth = '366px'
canvas.style.maxHeight = '40px'
canvas.style.width = 'auto'
canvas.style.height = 'auto'
canvas.style.display = 'block'
canvas.style.margin = '0 auto'
```

## html2canvas配置

```typescript
await html2canvas(element, {
  backgroundColor: '#ffffff',
  scale: 1,  // 不缩放，使用元素原始尺寸
  useCORS: true,
  logging: false
})
```

## 关键点

1. ✅ DOM直接使用382px x 48px尺寸
2. ✅ 不进行DPI转换，直接使用目标像素
3. ✅ Canvas保持原始尺寸，只调整显示样式
4. ✅ html2canvas使用scale: 1，不进行额外缩放
5. ✅ 字体使用9px，确保在382px宽度下清晰可读

## 输出

- **格式**: PNG
- **尺寸**: 382px x 48px
- **编码**: base64
- **背景**: 白色 (#ffffff)
