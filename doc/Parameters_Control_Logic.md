# LogoSilhouette 参数控制逻辑详细文档

本文档详细说明了 LogoSilhouette 应用中所有可配置参数的控制逻辑、取值范围、影响效果及其在代码中的实现。

---

## 目录

1. [处理管线概览](#处理管线概览)
2. [参数总览表](#参数总览表)
3. [各参数详细说明](#各参数详细说明)
4. [预设配置](#预设配置)
5. [参数依赖关系](#参数依赖关系)
6. [调参建议](#调参建议)

---

## 处理管线概览

图像处理按以下 6 个步骤顺序执行：

```
┌─────────────────────────────────────────────────────────────────────┐
│  输入图像                                                            │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 1: resize512                                                   │
│  • 最长边缩放至 512px（等比例）                                        │
│  • 内部统一工作尺寸，提升处理性能                                       │
│  • 无参数可配置                                                       │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 2: thresholdBW                                                 │
│  • 灰度化 + 阈值二值化                                                │
│  • 参数：threshold, invert                                           │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 3: denoiseLite                                                 │
│  • 去除小黑点（噪点）                                                 │
│  • 填充小孔洞                                                        │
│  • 参数：denoiseLevel, removeSpecksMinArea, fillHolesMaxArea          │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 4: cropToMain                                                  │
│  • 基于最大连通域识别主体                                             │
│  • 自动裁剪到主体区域                                                 │
│  • 参数：autoCrop, cropPaddingPct, minMainComponentAreaPct            │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 5: traceSvg                                                    │
│  • Marching Squares 算法提取轮廓                                      │
│  • Douglas-Peucker 算法简化路径                                       │
│  • Catmull-Rom 样条转贝塞尔曲线平滑                                   │
│  • 参数：pathOmit, cornerThreshold                                   │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 6: cleanSvg                                                    │
│  • SVG 路径优化和清理                                                 │
│  • 无参数可配置                                                       │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  输出 SVG                                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 参数总览表

| 参数名 | 类型 | 范围 | 默认值 | 影响步骤 | 简述 |
|--------|------|------|--------|----------|------|
| `threshold` | number | 50-240 | 175 | thresholdBW | 黑白阈值 |
| `invert` | boolean | true/false | false | thresholdBW | 颜色反转 |
| `denoiseLevel` | enum | off/low/medium/high | high | denoiseLite | 降噪强度 |
| `removeSpecksMinArea` | number | 0-500 | 140 | denoiseLite | 去噪点面积阈值 |
| `fillHolesMaxArea` | number | 0-500 | 220 | denoiseLite | 填洞面积阈值 |
| `autoCrop` | boolean | true/false | false | cropToMain | 自动裁剪 |
| `cropPaddingPct` | number | 0-20 | 8 | cropToMain | 裁剪留边比例 |
| `minMainComponentAreaPct` | number | 0-10 | 1.2 | cropToMain | 主体最小面积 |
| `pathOmit` | number | 1-30 | 18 | traceSvg | 路径简化程度 |
| `cornerThreshold` | number | 20-80 | 60 | traceSvg | 拐点角度阈值 |

---

## 各参数详细说明

### 1. threshold（黑白阈值）

**位置**: `src/core/steps/thresholdBW.ts`

**功能**: 将彩色/灰度图像转换为纯黑白二值图像的分界点。

**原理**:
```typescript
// 灰度计算（ITU-R BT.601 标准）
gray = 0.299 * R + 0.587 * G + 0.114 * B

// 阈值判断
isBlack = gray < threshold
```

**取值影响**:
| threshold 值 | 效果 |
|-------------|------|
| 低（50-100） | 只有很暗的像素变黑，结果偏白/偏细 |
| 中（100-180） | 平衡状态 |
| 高（180-240） | 大部分像素变黑，结果偏黑/偏粗 |

**调参建议**:
- 白底黑 Logo：120-180
- 黑底白 Logo：配合 `invert: true` 使用
- 灰度复杂图像：需要多次尝试

---

### 2. invert（颜色反转）

**位置**: `src/core/steps/thresholdBW.ts`

**功能**: 交换黑白判定结果。

**原理**:
```typescript
if (invert) {
  isBlack = !isBlack
}
```

**使用场景**:
- 原图是白色 Logo + 深色背景 → 开启 `invert`
- 原图是黑色 Logo + 浅色背景 → 关闭 `invert`

---

### 3. denoiseLevel（降噪级别）

**位置**: `src/core/steps/denoiseLite.ts`

**功能**: 控制降噪处理的整体强度。

**原理**:
```typescript
const DENOISE_MULTIPLIERS = {
  off: 0,      // 不处理
  low: 0.5,    // 半强度
  medium: 1,   // 标准强度
  high: 1.5,   // 1.5 倍强度
}

// 实际面积阈值 = 基础值 × 系数
removeSpecksArea = baseRemoveSpecksArea * multiplier
fillHolesArea = baseFillHolesArea * multiplier
```

**取值影响**:
| 级别 | 效果 |
|------|------|
| off | 完全不降噪，保留所有细节和噪点 |
| low | 轻度降噪，保留较多细节 |
| medium | 中度降噪，平衡状态 |
| high | 强力降噪，去除大部分噪点 |

---

### 4. removeSpecksMinArea（去噪点面积阈值）

**位置**: `src/core/utils/connectedComponents.ts`

**功能**: 小于此面积（像素数）的黑色连通域会被删除。

**原理**:
```typescript
// 使用 Flood Fill 算法识别连通域
// 面积 < removeSpecksMinArea 的黑色区域 → 变白色
```

**取值影响**:
| 值 | 效果 |
|----|------|
| 小（20-60） | 只去除微小噪点，保留小细节 |
| 中（60-150） | 去除中等噪点 |
| 大（150-300） | 去除较大噪点，但可能误删小特征 |

**注意**: 实际生效值 = `removeSpecksMinArea × denoiseLevel 系数`

---

### 5. fillHolesMaxArea（填洞面积阈值）

**位置**: `src/core/utils/connectedComponents.ts`

**功能**: 小于此面积的白色孔洞（被黑色包围）会被填充为黑色。

**原理**:
```typescript
// 识别被黑色完全包围的白色区域
// 面积 < fillHolesMaxArea 的孔洞 → 变黑色
```

**取值影响**:
| 值 | 效果 |
|----|------|
| 小（30-80） | 只填充微小孔洞 |
| 中（80-150） | 填充中等孔洞 |
| 大（150-300） | 填充较大孔洞，可能影响内部细节 |

---

### 6. autoCrop（自动裁剪）

**位置**: `src/core/steps/cropMain.ts`

**功能**: 是否自动裁剪到主体 Logo 区域。

**原理**:
```typescript
if (autoCrop) {
  // 1. 尝试找最大连通域的边界框
  bbox = findLargestComponentBBox(image, minMainAreaPct)

  // 2. 如果失败，使用所有黑色像素的边界框
  if (!bbox) {
    bbox = findBlackPixelsBBox(image)
  }

  // 3. 按边界框 + padding 裁剪
  cropped = cropImageData(image, bbox, paddingPct)
}
```

**使用建议**:
- Logo 周围有大量空白 → 开启
- Logo 本身已紧凑或希望保留背景 → 关闭

---

### 7. cropPaddingPct（裁剪留边比例）

**位置**: `src/core/steps/cropMain.ts`

**功能**: 裁剪时在主体周围保留的边距，以百分比表示。

**计算方式**:
```typescript
// padding = 裁剪区域尺寸 × (cropPaddingPct / 100)
padding = Math.max(cropWidth, cropHeight) * paddingPct / 100
```

**取值影响**:
| 值 | 效果 |
|----|------|
| 0-3 | 紧贴主体，几乎无边距 |
| 4-8 | 适度边距 |
| 10-20 | 较大边距 |

---

### 8. minMainComponentAreaPct（主体最小面积百分比）

**位置**: `src/core/steps/cropMain.ts`

**功能**: 判定最大连通域是否为"主体"的面积阈值。

**原理**:
```typescript
// 连通域面积 >= 图像总面积 × (minMainComponentAreaPct / 100)
// 才被认为是有效主体
isValidMain = componentArea >= totalArea * minMainComponentAreaPct / 100
```

**取值影响**:
| 值 | 效果 |
|----|------|
| 低（0.5-1.0） | 小 Logo 也能被识别为主体 |
| 中（1.0-2.0） | 标准判定 |
| 高（2.0-5.0） | 只有较大的 Logo 才被识别 |

---

### 9. pathOmit（路径简化程度）

**位置**: `src/core/steps/traceSvg.ts`

**功能**: 控制 Douglas-Peucker 算法的简化容差，值越大，路径点越少。

**原理**:
```typescript
// 容差 = pathOmit / 10
tolerance = pathOmit / 10  // pathOmit=18 → tolerance=1.8

// Douglas-Peucker 算法
// 点到线段距离 < tolerance 的点会被删除
simplifiedPoints = douglasPeucker(points, tolerance)
```

**派生参数**（自动计算，非直接配置）:
```typescript
// 角度阈值（如果未手动指定 cornerThreshold）
cornerThreshold = 30 + (pathOmit / 30) * 40  // 范围 30° - 70°

// 曲线张力
tension = 0.7 - (pathOmit / 30) * 0.4  // 范围 0.3 - 0.7
```

**取值影响**:
| pathOmit | tolerance | 效果 |
|----------|-----------|------|
| 1-5 | 0.1-0.5 | 几乎不简化，保留所有细节 |
| 5-12 | 0.5-1.2 | 轻度简化 |
| 12-20 | 1.2-2.0 | 中度简化，适合大多数 Logo |
| 20-30 | 2.0-3.0 | 强力简化，曲线非常平滑 |

**与 imagetracerjs 的 qtres 对应关系**:
```
qtres ≈ pathOmit / 10
qtres = 2.0  →  pathOmit = 20
qtres = 2.5  →  pathOmit = 25
```

---

### 10. cornerThreshold（拐点角度阈值）

**位置**: `src/core/utils/curvefitting.ts`

**功能**: 控制哪些点被识别为"拐点"（sharp corner）。

**原理**:
```typescript
// 计算连续三点 P1→P2→P3 在中间点 P2 的转角
// angle = 180° - |方向变化|
// 0° = 完全直线
// 90° = 直角转弯
// 180° = 完全折返

if (angle > cornerThreshold) {
  markAsCorner(P2)  // P2 被标记为拐点
}

// 拐点处使用直线连接
// 非拐点处使用贝塞尔曲线平滑
```

**防抖机制**:
```typescript
// 1. 极短向量过滤（< 1.5px 跳过）
// 2. 相邻拐点合并（间距 < 3 个点，保留角度最大者）
```

**取值影响**:
| cornerThreshold | 效果 |
|-----------------|------|
| 低（20-40°） | 更多点被识别为拐点，路径更折线化 |
| 中（40-60°） | 平衡状态 |
| 高（60-80°） | 只有非常尖锐的角才保留，曲线更平滑 |

---

## 预设配置

### Minimal Logo（默认）

极简风格，适合 Logo 图标。

```typescript
{
  threshold: 175,
  invert: false,
  denoiseLevel: 'high',
  removeSpecksMinArea: 140,  // 实际: 140 × 1.5 = 210
  fillHolesMaxArea: 220,     // 实际: 220 × 1.5 = 330
  autoCrop: false,
  cropPaddingPct: 8,
  minMainComponentAreaPct: 1.2,
  pathOmit: 18,              // tolerance = 1.8
  cornerThreshold: 60,
}
```

### Clean Silhouette

平衡风格，适合大多数图像。

```typescript
{
  threshold: 160,
  invert: false,
  denoiseLevel: 'medium',
  removeSpecksMinArea: 80,   // 实际: 80 × 1.0 = 80
  fillHolesMaxArea: 120,     // 实际: 120 × 1.0 = 120
  autoCrop: false,
  cropPaddingPct: 6,
  minMainComponentAreaPct: 1.0,
  pathOmit: 10,              // tolerance = 1.0
  cornerThreshold: 50,
}
```

### Keep Details

细节保留风格，适合复杂图案。

```typescript
{
  threshold: 145,
  invert: false,
  denoiseLevel: 'low',
  removeSpecksMinArea: 40,   // 实际: 40 × 0.5 = 20
  fillHolesMaxArea: 60,      // 实际: 60 × 0.5 = 30
  autoCrop: false,
  cropPaddingPct: 4,
  minMainComponentAreaPct: 0.8,
  pathOmit: 4,               // tolerance = 0.4
  cornerThreshold: 40,
}
```

---

## 参数依赖关系

参数变化时，只需要从受影响的步骤开始重新处理：

```
参数                    → 影响的步骤（从此步骤开始重算）
─────────────────────────────────────────────────
threshold              → bw → denoise → crop → trace → clean
invert                 → bw → denoise → crop → trace → clean
denoiseLevel           → denoise → crop → trace → clean
removeSpecksMinArea    → denoise → crop → trace → clean
fillHolesMaxArea       → denoise → crop → trace → clean
autoCrop               → crop → trace → clean
cropPaddingPct         → crop → trace → clean
minMainComponentAreaPct→ crop → trace → clean
pathOmit               → trace → clean
cornerThreshold        → trace → clean
```

代码实现位置: `src/core/pipeline/dependencies.ts`

---

## 调参建议

### 折线太多/路径不够平滑

1. 增大 `pathOmit`（18 → 22-25）
2. 增大 `cornerThreshold`（60 → 70）
3. 提高 `denoiseLevel` 到 `high`

### 细节丢失太多

1. 减小 `pathOmit`（18 → 10-12）
2. 减小 `cornerThreshold`（60 → 45-50）
3. 降低 `denoiseLevel` 到 `medium` 或 `low`

### 输出有噪点/碎片

1. 增大 `removeSpecksMinArea`
2. 提高 `denoiseLevel`
3. 调整 `threshold` 使二值化更干净

### 孔洞被错误填充

1. 减小 `fillHolesMaxArea`
2. 降低 `denoiseLevel`

### 主体识别不准确

1. 调整 `minMainComponentAreaPct`
2. 调整 `threshold` 改善二值化质量
3. 关闭 `autoCrop` 手动控制

---

## 性能保护机制

**位置**: `src/core/utils/performanceGuard.ts`

| 限制项 | 值 | 说明 |
|--------|-----|------|
| MAX_CONTOURS | 500 | 轮廓数量超过此值会报错 |
| PROCESSING_TIMEOUT | 15000ms | 处理超时限制 |
| MAX_IMAGE_DIMENSION | 4096px | 图像尺寸警告阈值 |

---

## 文件索引

| 文件路径 | 说明 |
|----------|------|
| `src/presets/types.ts` | 参数类型定义 |
| `src/presets/presets.ts` | 三套预设配置 |
| `src/core/pipeline/runPipeline.ts` | 管线调度器 |
| `src/core/pipeline/dependencies.ts` | 参数依赖关系 |
| `src/core/steps/resize512.ts` | 图像缩放 |
| `src/core/steps/thresholdBW.ts` | 黑白二值化 |
| `src/core/steps/denoiseLite.ts` | 降噪处理 |
| `src/core/steps/cropMain.ts` | 主体裁剪 |
| `src/core/steps/traceSvg.ts` | SVG 描摹 |
| `src/core/steps/cleanSvg.ts` | SVG 优化 |
| `src/core/utils/curvefitting.ts` | 曲线拟合 |
| `src/core/utils/connectedComponents.ts` | 连通域分析 |
| `src/core/utils/performanceGuard.ts` | 性能保护 |
