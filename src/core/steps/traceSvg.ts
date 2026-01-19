/**
 * 位图描摹 - 将二值图像转换为 SVG 路径
 * 基于 Marching Squares 算法实现轮廓提取
 * 使用 Catmull-Rom 样条转贝塞尔曲线实现平滑
 */

import { pointsToCurvePath, getCornerThreshold, getTension } from '../utils/curvefitting'

interface Point {
  x: number
  y: number
}

interface Contour {
  points: Point[]
  isHole: boolean
}

/**
 * Marching Squares 方向查找表
 * 根据 4 个角的状态（0-15）确定轮廓方向
 */
const DIRECTIONS: Record<number, [number, number][]> = {
  1: [[0, 0.5], [-0.5, 0]],
  2: [[0.5, 0], [0, 0.5]],
  3: [[0.5, 0], [-0.5, 0]],
  4: [[0, -0.5], [0.5, 0]],
  5: [[0, 0.5], [0.5, 0], [0, -0.5], [-0.5, 0]], // 鞍点
  6: [[0, -0.5], [0, 0.5]],
  7: [[0, -0.5], [-0.5, 0]],
  8: [[-0.5, 0], [0, -0.5]],
  9: [[0, 0.5], [0, -0.5]],
  10: [[-0.5, 0], [0, 0.5], [0.5, 0], [0, -0.5]], // 鞍点
  11: [[0.5, 0], [0, -0.5]],
  12: [[-0.5, 0], [0.5, 0]],
  13: [[0, 0.5], [0.5, 0]],
  14: [[-0.5, 0], [0, 0.5]],
}

/**
 * 获取像素值（0 = 黑, 1 = 白）
 */
function getPixel(data: Uint8ClampedArray, width: number, height: number, x: number, y: number): number {
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return 1 // 边界外视为白色
  }
  const idx = (y * width + x) * 4
  return data[idx] === 0 ? 0 : 1
}

/**
 * 计算 Marching Squares 的 case 值
 */
function getCase(data: Uint8ClampedArray, width: number, height: number, x: number, y: number): number {
  const tl = getPixel(data, width, height, x - 1, y - 1)
  const tr = getPixel(data, width, height, x, y - 1)
  const br = getPixel(data, width, height, x, y)
  const bl = getPixel(data, width, height, x - 1, y)
  return (tl << 3) | (tr << 2) | (br << 1) | bl
}

/**
 * 使用 Marching Squares 提取轮廓
 */
function extractContours(imageData: ImageData): Contour[] {
  const { width, height, data } = imageData
  const visited = new Set<string>()
  const contours: Contour[] = []

  // 遍历每个像素点的交叉处
  for (let y = 0; y <= height; y++) {
    for (let x = 0; x <= width; x++) {
      const caseValue = getCase(data, width, height, x, y)

      // 跳过全黑或全白
      if (caseValue === 0 || caseValue === 15) continue

      // 跳过已访问
      const key = `${x},${y}`
      if (visited.has(key)) continue

      // 追踪轮廓
      const contour = traceContour(data, width, height, x, y, visited)
      if (contour.length >= 3) {
        contours.push({
          points: contour,
          isHole: false, // 稍后判断
        })
      }
    }
  }

  return contours
}

/**
 * 追踪单个轮廓
 */
function traceContour(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  startY: number,
  visited: Set<string>
): Point[] {
  const points: Point[] = []
  let x = startX
  let y = startY
  let prevDir: [number, number] | null = null

  const maxIterations = width * height * 4 // 防止无限循环

  for (let i = 0; i < maxIterations; i++) {
    const key = `${x},${y}`
    const caseValue = getCase(data, width, height, x, y)

    if (caseValue === 0 || caseValue === 15) break

    visited.add(key)

    const dirs = DIRECTIONS[caseValue]
    if (!dirs || dirs.length === 0) break

    // 选择方向（避免回头）
    let dir: [number, number]
    if (dirs.length === 4) {
      // 鞍点：根据前进方向选择
      if (prevDir) {
        const pd = prevDir
        dir = dirs.find(d => !(d[0] === -pd[0] && d[1] === -pd[1])) || dirs[0]
      } else {
        dir = dirs[0]
      }
    } else if (dirs.length === 2) {
      // 普通情况：选择不是反方向的
      if (prevDir) {
        const pd = prevDir
        dir = dirs.find(d => !(d[0] === -pd[0] && d[1] === -pd[1])) || dirs[0]
      } else {
        dir = dirs[0]
      }
    } else {
      dir = dirs[0]
    }

    // 记录点
    points.push({ x: x + dir[0], y: y + dir[1] })

    // 移动到下一个位置
    const nextX = x + dir[0] * 2
    const nextY = y + dir[1] * 2

    // 回到起点
    if (Math.abs(nextX - startX) < 0.01 && Math.abs(nextY - startY) < 0.01) {
      break
    }

    x = Math.round(nextX)
    y = Math.round(nextY)
    prevDir = dir

    // 防止越界
    if (x < -1 || x > width + 1 || y < -1 || y > height + 1) break
  }

  return points
}

/**
 * 简化路径（Douglas-Peucker 算法）
 */
function simplifyPath(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points

  // 找到距离首尾连线最远的点
  const first = points[0]
  const last = points[points.length - 1]

  let maxDist = 0
  let maxIndex = 0

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last)
    if (dist > maxDist) {
      maxDist = dist
      maxIndex = i
    }
  }

  // 如果最大距离大于容差，递归简化
  if (maxDist > tolerance) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), tolerance)
    const right = simplifyPath(points.slice(maxIndex), tolerance)
    return [...left.slice(0, -1), ...right]
  }

  // 否则只保留首尾
  return [first, last]
}

/**
 * 计算点到线段的垂直距离
 */
function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y

  if (dx === 0 && dy === 0) {
    return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2)
  }

  const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy)
  const nearestX = lineStart.x + t * dx
  const nearestY = lineStart.y + t * dy

  return Math.sqrt((point.x - nearestX) ** 2 + (point.y - nearestY) ** 2)
}

/**
 * 将点数组转换为 SVG path d 属性（折线版本，用于对比）
 */
function pointsToPathD(points: Point[]): string {
  if (points.length === 0) return ''

  const parts: string[] = []
  parts.push(`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`)

  for (let i = 1; i < points.length; i++) {
    parts.push(`L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`)
  }

  parts.push('Z')
  return parts.join(' ')
}

/**
 * 描摹二值图像生成 SVG（使用曲线拟合）
 * @param imageData 二值图像数据（黑白）
 * @param pathOmit 路径简化程度（值越大简化越多）
 * @param cornerThresholdParam 角度阈值（可选，若提供则直接使用）
 * @param useCurve 是否使用曲线拟合（默认 true）
 * @returns SVG 字符串
 */
export function traceSvg(
  imageData: ImageData,
  pathOmit: number,
  cornerThresholdParam?: number,
  useCurve: boolean = true
): string {
  const { width, height } = imageData

  // 提取轮廓
  const contours = extractContours(imageData)

  // 简化路径
  const tolerance = pathOmit / 10 // 将 pathOmit 转换为容差值
  const simplifiedContours = contours.map(c => ({
    ...c,
    points: simplifyPath(c.points, tolerance),
  }))

  // 计算曲线参数（若提供 cornerThresholdParam 则使用，否则从 pathOmit 计算）
  const cornerThreshold = cornerThresholdParam !== undefined ? cornerThresholdParam : getCornerThreshold(pathOmit)
  const tension = getTension(pathOmit)

  // 生成 SVG 路径
  const paths: string[] = []
  for (const contour of simplifiedContours) {
    if (contour.points.length >= 3) {
      // 根据选项使用曲线或折线
      const d = useCurve
        ? pointsToCurvePath(contour.points, cornerThreshold, tension)
        : pointsToPathD(contour.points)
      paths.push(`<path d="${d}" fill="#000000" fill-rule="evenodd"/>`)
    }
  }

  // 组装 SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${paths.join('\n')}
</svg>`

  return svg
}

/**
 * 描摹二值图像生成 SVG（折线版本，保留用于对比）
 */
export function traceSvgPolyline(imageData: ImageData, pathOmit: number): string {
  return traceSvg(imageData, pathOmit, undefined, false)
}

/**
 * 使用更简单的边缘检测方法描摹
 * 适合简单的 Logo 图形
 */
export function traceSimple(imageData: ImageData, _pathOmit: number): string {
  const { width, height, data } = imageData
  const paths: string[] = []

  // 使用简单的边缘检测
  const edges: Point[] = []

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      const isBlack = data[idx] === 0

      if (isBlack) {
        // 检查是否是边缘（至少一个邻居是白色）
        const neighbors = [
          data[((y - 1) * width + x) * 4],
          data[((y + 1) * width + x) * 4],
          data[(y * width + x - 1) * 4],
          data[(y * width + x + 1) * 4],
        ]

        const hasWhiteNeighbor = neighbors.some(n => n === 255)
        if (hasWhiteNeighbor) {
          edges.push({ x, y })
        }
      }
    }
  }

  // 对于简单方法，直接生成填充的矩形来表示黑色区域
  // 这是一个退化方案，主要依靠 Marching Squares
  if (edges.length > 0) {
    // 找到所有黑色像素并创建一个合并的路径
    let pathD = ''
    for (let y = 0; y < height; y++) {
      let inRun = false
      let runStart = 0

      for (let x = 0; x <= width; x++) {
        const idx = (y * width + x) * 4
        const isBlack = x < width && data[idx] === 0

        if (isBlack && !inRun) {
          inRun = true
          runStart = x
        } else if (!isBlack && inRun) {
          inRun = false
          pathD += `M ${runStart} ${y} h ${x - runStart} v 1 h ${runStart - x} Z `
        }
      }
    }

    if (pathD) {
      paths.push(`<path d="${pathD.trim()}" fill="#000000"/>`)
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${paths.join('\n')}
</svg>`

  return svg
}
