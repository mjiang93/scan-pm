# Canvas克隆问题修复

## 问题描述

使用 `cloneNode(true)` 克隆包含canvas的DOM时，只会复制canvas的DOM结构，**不会复制canvas的像素数据**。这导致克隆后的canvas是空白的。

## 问题原因

```typescript
// ❌ 错误做法：只克隆DOM结构
const container = originalSection.cloneNode(true) as HTMLElement
// 克隆后的canvas是空白的，因为像素数据没有被复制
```

Canvas元素的内容（像素数据）存储在内存中，不是DOM的一部分，所以 `cloneNode()` 无法复制它。

## 解决方案

手动复制canvas的像素数据：

```typescript
// ✅ 正确做法：手动复制canvas内容

// 1. 获取原始canvas和克隆的canvas
const originalCanvas = originalSection.querySelector('canvas') as HTMLCanvasElement
const clonedCanvas = container.querySelector('canvas') as HTMLCanvasElement

// 2. 复制canvas的像素数据
if (originalCanvas && clonedCanvas) {
  const ctx = clonedCanvas.getContext('2d')
  if (ctx) {
    // 设置克隆canvas的尺寸与原始canvas相同
    clonedCanvas.width = originalCanvas.width
    clonedCanvas.height = originalCanvas.height
    
    // 使用drawImage复制像素数据
    ctx.drawImage(originalCanvas, 0, 0)
  }
  
  // 3. 调整显示样式
  clonedCanvas.style.width = '40px'
  clonedCanvas.style.height = '40px'
  clonedCanvas.style.display = 'block'
}
```

## 实现步骤

### 1. 克隆DOM结构
```typescript
const container = originalSection.cloneNode(true) as HTMLElement
```

### 2. 获取原始和克隆的canvas
```typescript
const originalCanvas = originalSection.querySelector('canvas') as HTMLCanvasElement
const clonedCanvas = container.querySelector('canvas') as HTMLCanvasElement
```

### 3. 复制canvas尺寸
```typescript
clonedCanvas.width = originalCanvas.width
clonedCanvas.height = originalCanvas.height
```

### 4. 复制像素数据
```typescript
const ctx = clonedCanvas.getContext('2d')
ctx.drawImage(originalCanvas, 0, 0)
```

### 5. 调整显示样式
```typescript
clonedCanvas.style.width = '40px'
clonedCanvas.style.height = '40px'
```

## Canvas属性说明

### width/height (属性)
- **作用**: 设置canvas的实际渲染尺寸（像素缓冲区大小）
- **影响**: 决定canvas的分辨率和清晰度
- **示例**: `canvas.width = 120` (120像素宽)

### style.width/style.height (CSS样式)
- **作用**: 设置canvas在页面上的显示尺寸
- **影响**: 只影响显示大小，不影响实际渲染质量
- **示例**: `canvas.style.width = '40px'` (显示为40px宽)

## 完整示例

### QRCode Canvas复制
```typescript
// 原始QRCode canvas: 120x120 (实际尺寸)
// 显示需求: 40x40 (显示尺寸)

const originalCanvas = originalSection.querySelector('.qrCode canvas')
const clonedCanvas = container.querySelector('.qrCode canvas')

// 复制像素数据
const ctx = clonedCanvas.getContext('2d')
clonedCanvas.width = originalCanvas.width   // 120
clonedCanvas.height = originalCanvas.height // 120
ctx.drawImage(originalCanvas, 0, 0)

// 调整显示大小
clonedCanvas.style.width = '40px'
clonedCanvas.style.height = '40px'
```

### Barcode Canvas复制
```typescript
// 原始Barcode canvas: 可能是600x100 (实际尺寸)
// 显示需求: 最大366x40 (显示尺寸)

const originalCanvas = originalSection.querySelector('canvas')
const clonedCanvas = container.querySelector('canvas')

// 复制像素数据
const ctx = clonedCanvas.getContext('2d')
clonedCanvas.width = originalCanvas.width
clonedCanvas.height = originalCanvas.height
ctx.drawImage(originalCanvas, 0, 0)

// 调整显示大小
clonedCanvas.style.maxWidth = '366px'
clonedCanvas.style.maxHeight = '40px'
clonedCanvas.style.width = 'auto'
clonedCanvas.style.height = 'auto'
```

## 为什么这样做有效

1. **保持原始分辨率**: 复制原始canvas的width/height，保持高分辨率
2. **复制像素数据**: 使用drawImage复制所有像素内容
3. **调整显示大小**: 通过CSS样式调整显示尺寸，不影响实际分辨率
4. **html2canvas捕获**: html2canvas能正确捕获高分辨率的canvas内容

## 关键点

✅ **必须先设置canvas.width和canvas.height**
✅ **然后使用drawImage复制像素数据**
✅ **最后通过style调整显示大小**
✅ **不要直接修改原始canvas**

## 常见错误

❌ **只克隆DOM**: `cloneNode(true)` - canvas是空白的
❌ **只复制样式**: 只设置style.width/height - canvas还是空白的
❌ **不设置canvas尺寸**: 直接drawImage - 可能被裁剪或拉伸

## 测试验证

打印前可以临时将临时DOM显示出来验证：

```typescript
// 临时显示用于调试
container.style.left = '0'
container.style.top = '0'
container.style.position = 'fixed'
container.style.zIndex = '9999'

// 等待几秒查看效果
await new Promise(resolve => setTimeout(resolve, 3000))
```

## 性能考虑

- `drawImage` 操作很快，通常在几毫秒内完成
- 对于多个条形码，顺序复制不会造成明显延迟
- 总体打印准备时间仍在可接受范围内（< 1秒）
