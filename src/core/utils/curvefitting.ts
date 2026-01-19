/**
 * 曲线拟合工具
 * 将折线点序列转换为平滑的贝塞尔曲线
 */

interface Point {
  x: number
  y: number
}

interface CurveSegment {
  type: 'L' | 'C'  // L = 直线, C = 三次贝塞尔
  points: Point[]  // L: [end], C: [cp1, cp2, end]
}

/**
 * 计算两点之间的角度（弧度）
 */
function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}

/**
 * 计算两点之间的距离
 */
function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 计算三点形成的角度（中间点的转角，单位：度）
 */
function cornerAngle(p1: Point, p2: Point, p3: Point): number {
  const a1 = angle(p1, p2)
  const a2 = angle(p2, p3)
  let diff = Math.abs(a2 - a1)
  if (diff > Math.PI) {
    diff = 2 * Math.PI - diff
  }
  // 转换为度数，返回偏离直线的角度
  return 180 - (diff * 180 / Math.PI)
}

/**
 * 检测拐点（角度变化超过阈值的点）
 * @param points 点序列
 * @param threshold 角度阈值（度），超过此值视为拐点
 * @returns 拐点索引数组（包含首尾点）
 */
export function detectCorners(points: Point[], threshold: number = 50): number[] {
  if (points.length < 3) {
    return points.map((_, i) => i)
  }

  const corners: number[] = [0] // 起点总是拐点

  for (let i = 1; i < points.length - 1; i++) {
    const angle = cornerAngle(points[i - 1], points[i], points[i + 1])
    if (angle > threshold) {
      corners.push(i)
    }
  }

  corners.push(points.length - 1) // 终点总是拐点

  return corners
}

/**
 * Catmull-Rom 样条转三次贝塞尔曲线
 * 给定四个点 P0, P1, P2, P3，计算 P1 到 P2 段的贝塞尔控制点
 * @param p0 前一点（用于计算切线）
 * @param p1 起点
 * @param p2 终点
 * @param p3 后一点（用于计算切线）
 * @param tension 张力系数，0.5 为标准 Catmull-Rom
 * @returns 贝塞尔控制点 [cp1, cp2]
 */
function catmullRomToBezier(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  tension: number = 0.5
): [Point, Point] {
  const t = tension

  // 计算控制点
  // CP1 = P1 + (P2 - P0) / 6 * t
  // CP2 = P2 - (P3 - P1) / 6 * t
  const cp1: Point = {
    x: p1.x + (p2.x - p0.x) * t / 3,
    y: p1.y + (p2.y - p0.y) * t / 3,
  }

  const cp2: Point = {
    x: p2.x - (p3.x - p1.x) * t / 3,
    y: p2.y - (p3.y - p1.y) * t / 3,
  }

  return [cp1, cp2]
}

/**
 * 将点序列的一段转换为平滑贝塞尔曲线
 * @param points 完整点序列
 * @param startIdx 起始索引
 * @param endIdx 结束索引
 * @param tension 张力系数
 * @returns 曲线段数组
 */
function smoothSegment(
  points: Point[],
  startIdx: number,
  endIdx: number,
  tension: number
): CurveSegment[] {
  const segments: CurveSegment[] = []
  const count = endIdx - startIdx

  if (count <= 1) {
    // 只有一个点或相邻，用直线
    if (count === 1) {
      segments.push({
        type: 'L',
        points: [points[endIdx]],
      })
    }
    return segments
  }

  // 对于段内的每对相邻点，生成贝塞尔曲线
  for (let i = startIdx; i < endIdx; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]

    // 获取前后点（用于计算切线）
    const p0 = i > 0 ? points[i - 1] : p1
    const p3 = i + 2 < points.length ? points[i + 2] : p2

    const [cp1, cp2] = catmullRomToBezier(p0, p1, p2, p3, tension)

    segments.push({
      type: 'C',
      points: [cp1, cp2, p2],
    })
  }

  return segments
}

/**
 * 将折线点序列转换为混合路径（曲线 + 直线）
 * @param points 点序列（已经过简化）
 * @param cornerThreshold 角度阈值（度）
 * @param tension Catmull-Rom 张力
 * @returns SVG path d 属性字符串
 */
export function pointsToCurvePath(
  points: Point[],
  cornerThreshold: number = 50,
  tension: number = 0.5
): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} Z`
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)} Z`
  }

  // 检测拐点
  const corners = detectCorners(points, cornerThreshold)

  const parts: string[] = []

  // 起点
  parts.push(`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`)

  // 处理每段（拐点之间）
  for (let i = 0; i < corners.length - 1; i++) {
    const startIdx = corners[i]
    const endIdx = corners[i + 1]
    const segmentLength = endIdx - startIdx

    if (segmentLength === 1) {
      // 相邻拐点，用直线连接
      const p = points[endIdx]
      parts.push(`L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    } else if (segmentLength === 2) {
      // 只有两段，用二次贝塞尔或直接曲线
      const segments = smoothSegment(points, startIdx, endIdx, tension)
      for (const seg of segments) {
        if (seg.type === 'C') {
          const [cp1, cp2, end] = seg.points
          parts.push(`C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)} ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`)
        } else {
          parts.push(`L ${seg.points[0].x.toFixed(2)} ${seg.points[0].y.toFixed(2)}`)
        }
      }
    } else {
      // 多个点，使用平滑曲线
      const segments = smoothSegment(points, startIdx, endIdx, tension)
      for (const seg of segments) {
        if (seg.type === 'C') {
          const [cp1, cp2, end] = seg.points
          parts.push(`C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)} ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`)
        } else {
          parts.push(`L ${seg.points[0].x.toFixed(2)} ${seg.points[0].y.toFixed(2)}`)
        }
      }
    }
  }

  // 闭合路径
  parts.push('Z')

  return parts.join(' ')
}

/**
 * 简单版本：将所有点转换为平滑曲线（不检测拐点）
 * 适合需要完全平滑效果的场景
 */
export function pointsToSmoothCurve(points: Point[], tension: number = 0.5): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} Z`
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)} Z`
  }

  const parts: string[] = []
  parts.push(`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`)

  // 对于闭合路径，需要将首尾点连接起来考虑
  const closed = distance(points[0], points[points.length - 1]) < 1

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? (closed ? points.length - 2 : 0) : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 >= points.length ? (closed ? (i + 2) % points.length : points.length - 1) : i + 2]

    const [cp1, cp2] = catmullRomToBezier(p0, p1, p2, p3, tension)

    parts.push(`C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)} ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`)
  }

  parts.push('Z')

  return parts.join(' ')
}

/**
 * 根据 pathOmit 参数计算合适的角度阈值
 * pathOmit 越大，简化越多，角度阈值也应该越大（保留更少的尖角）
 */
export function getCornerThreshold(pathOmit: number): number {
  // pathOmit 范围约 1-30
  // 角度阈值范围约 30-70 度
  const minThreshold = 30
  const maxThreshold = 70
  const normalized = Math.min(30, Math.max(1, pathOmit)) / 30
  return minThreshold + normalized * (maxThreshold - minThreshold)
}

/**
 * 根据 pathOmit 参数计算张力系数
 */
export function getTension(pathOmit: number): number {
  // pathOmit 越大，曲线越平滑（张力越小）
  const minTension = 0.3
  const maxTension = 0.7
  const normalized = Math.min(30, Math.max(1, pathOmit)) / 30
  return maxTension - normalized * (maxTension - minTension)
}
