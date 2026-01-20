
# Corner Detection & Smoothing Logic Notes

本文档用于说明当前轮廓角度检测（detectCorners）与 UI「平滑度（Smoothness）」参数的设计逻辑，并记录关键修正与优化建议。

---

## 一、UI 参数语义调整（重要）

### 新参数（推荐）
- **Smoothness（平滑度）**
- 数值范围：`20 – 80`

| Smoothness 值 | 效果说明 |
|---------------|---------- |
| 低（20–30） | 更少平滑，更多拐点，路径偏折线 |
| 中（40–60） | 平衡尖角与曲线（默认） |
| 高（70–80） | 更平滑，仅保留非常尖锐的角 |

> Higher value = smoother curves, fewer sharp corners

---

## 二、角度定义

对连续三点 `P1 → P2 → P3`，在中间点 `P2` 计算转角（偏离直线的角度）：

- `0°` = 完全直线  
- `90°` = 直角  
- `180°` = 完全折返  

---

## 三、关键修复：atan2 角度差归一化（必须）

`atan2` 返回范围为 `[-π, π]`，直接取差值会在跨 ±π 时产生错误。

### 正确实现

```ts
let diff = Math.abs(a2 - a1)
if (diff > Math.PI) {
  diff = 2 * Math.PI - diff
}
```

或：

```ts
diff = Math.abs(Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1)))
```

---

## 四、拐点检测逻辑

```ts
if (angle > smoothnessThreshold) {
  markAsCorner()
}
```

> Smoothness 越高 → 越平滑 → 拐点越少

---

## 五、稳定性优化建议

### 1. 极短向量过滤

```ts
if (len1 < epsilon || len2 < epsilon) skip
```

### 2. 角度 × 长度加权

```ts
const weightedAngle = angle * Math.min(len1, len2)
if (weightedAngle > threshold) markAsCorner()
```

---

## 六、拐点防抖策略

- 相邻拐点过近 → 保留角度最大者
- 连续拐点 → 合并为单一拐点
- 起点、终点始终保留

---

## 七、路径生成策略

- 拐点之间：直线连接
- 非拐点段：贝塞尔曲线平滑

---

## 八、结论

- UI 使用「Smoothness」后，用户认知与实际效果一致  
- atan2 角度归一化是视觉质量的关键修复点  
- 轻量防抖与长度加权可显著提升 Logo 轮廓稳定性
