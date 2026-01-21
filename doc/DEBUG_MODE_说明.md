# Debug Mode 说明

## 概述

Debug Mode 是一个开发调试功能，用于在开发阶段暴露所有内部处理参数，方便调试和优化预设配置。

## 开关位置

```ts
// src/config/debug.ts
export const DEBUG_MODE = true  // 发版前改为 false
```

## 本次改动

### 1. 新增工作分辨率参数 (`src/presets/types.ts`)
- 添加 `WorkingResolution` 类型 (512 | 1024 | 2048)
- `ProcessParams` 新增 `maxSize` 字段

### 2. 更新预设默认值 (`src/presets/presets.ts`)
- Minimal Logo / Clean Silhouette: `maxSize: 512`
- Keep Details: `maxSize: 1024` (默认更高分辨率以保留更多细节)

### 3. 更新 resize 逻辑 (`src/core/steps/resize512.ts`)
- 新增 `resizeToMax(imageData, maxSize)` 函数
- 支持动态工作分辨率

### 4. Debug Panel UI (`src/components/EmbeddedApp/AdvancedSettings.tsx`)
- 橙色虚线边框区分，标注 "(dev only)"
- 仅在 `DEBUG_MODE = true` 时显示
- 包含以下参数控制：

| 参数 | 说明 | 范围 |
|------|------|------|
| Working Resolution | 工作分辨率 | 512 / 1024 / 2048 |
| Line Tolerance (ltres) | 直线容差 | 0.5 - 3.0 |
| Coord Precision (roundcoords) | 坐标精度 | 1 - 3 |
| Invert colors | 反相颜色 | on / off |
| Remove Specks Area | 去噪点面积阈值 | 0 - 300 |
| Fill Holes Area | 填洞面积阈值 | 0 - 300 |
| Crop Padding % | 裁剪留边百分比 | 0 - 20 |
| Min Component % | 主体最小面积百分比 | 0.5 - 5.0 |

## 使用方式

1. 确保 `DEBUG_MODE = true`
2. 运行 `npm run dev`
3. 上传图片后，展开 "Advanced Settings"
4. 在底部可以看到橙色边框的 "Debug Panel"
5. 调整参数，实时查看效果
6. 确定好参数后，更新对应预设的默认值
7. 发版前将 `DEBUG_MODE` 改为 `false`

## 性能说明

工作分辨率对性能影响：

| 分辨率 | 处理速度 | 细节保留 |
|--------|---------|---------|
| 512px  | 快速 (<1秒) | 较少 |
| 1024px | 中等 (2-5秒) | 中等 |
| 2048px | 较慢 (5-15秒) | 良好 |

imagetracerjs 的时间复杂度约为 O(n²)，图像尺寸翻倍，处理时间增加约 4 倍。
