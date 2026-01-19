/**
 * 连通域分析工具
 * 使用 Union-Find 算法识别图像中的连通区域
 */

import type { BoundingBox } from '../pipeline/types'

/**
 * Union-Find 数据结构
 */
class UnionFind {
  private parent: number[]
  private rank: number[]
  private size: number[]

  constructor(n: number) {
    this.parent = new Array(n)
    this.rank = new Array(n).fill(0)
    this.size = new Array(n).fill(1)

    for (let i = 0; i < n; i++) {
      this.parent[i] = i
    }
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]) // 路径压缩
    }
    return this.parent[x]
  }

  union(x: number, y: number): void {
    const rootX = this.find(x)
    const rootY = this.find(y)

    if (rootX === rootY) return

    // 按秩合并
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY
      this.size[rootY] += this.size[rootX]
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX
      this.size[rootX] += this.size[rootY]
    } else {
      this.parent[rootY] = rootX
      this.size[rootX] += this.size[rootY]
      this.rank[rootX]++
    }
  }

  getSize(x: number): number {
    return this.size[this.find(x)]
  }
}

interface Component {
  root: number
  size: number
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/**
 * 查找黑色像素的连通域
 * @param imageData 二值图像数据（黑白）
 * @returns 连通域列表，按面积从大到小排序
 */
export function findConnectedComponents(imageData: ImageData): Component[] {
  const { width, height, data } = imageData
  const n = width * height
  const uf = new UnionFind(n)

  // 第一遍：建立连通关系（4连通）
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const pixelIdx = idx * 4

      // 只处理黑色像素
      if (data[pixelIdx] !== 0) continue

      // 检查右边邻居
      if (x + 1 < width) {
        const rightIdx = idx + 1
        const rightPixelIdx = rightIdx * 4
        if (data[rightPixelIdx] === 0) {
          uf.union(idx, rightIdx)
        }
      }

      // 检查下边邻居
      if (y + 1 < height) {
        const downIdx = idx + width
        const downPixelIdx = downIdx * 4
        if (data[downPixelIdx] === 0) {
          uf.union(idx, downIdx)
        }
      }
    }
  }

  // 第二遍：统计各连通域
  const componentMap = new Map<number, Component>()

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const pixelIdx = idx * 4

      // 只处理黑色像素
      if (data[pixelIdx] !== 0) continue

      const root = uf.find(idx)

      if (!componentMap.has(root)) {
        componentMap.set(root, {
          root,
          size: 0,
          minX: x,
          minY: y,
          maxX: x,
          maxY: y,
        })
      }

      const comp = componentMap.get(root)!
      comp.size++
      comp.minX = Math.min(comp.minX, x)
      comp.minY = Math.min(comp.minY, y)
      comp.maxX = Math.max(comp.maxX, x)
      comp.maxY = Math.max(comp.maxY, y)
    }
  }

  // 按面积排序
  const components = Array.from(componentMap.values())
  components.sort((a, b) => b.size - a.size)

  return components
}

/**
 * 找到最大连通域的边界框
 * @param imageData 二值图像数据
 * @param minAreaPct 最小面积百分比（相对于总面积）
 * @returns 边界框，如果没有找到符合条件的连通域则返回 null
 */
export function findLargestComponentBBox(
  imageData: ImageData,
  minAreaPct: number
): BoundingBox | null {
  const { width, height } = imageData
  const totalArea = width * height
  const minArea = (minAreaPct / 100) * totalArea

  const components = findConnectedComponents(imageData)

  if (components.length === 0) {
    return null
  }

  const largest = components[0]

  // 检查是否满足最小面积要求
  if (largest.size < minArea) {
    return null
  }

  return {
    x: largest.minX,
    y: largest.minY,
    width: largest.maxX - largest.minX + 1,
    height: largest.maxY - largest.minY + 1,
  }
}

/**
 * 移除小于指定面积的黑色连通域（去噪点）
 */
export function removeSmallComponents(
  imageData: ImageData,
  minArea: number
): ImageData {
  const { width, height, data } = imageData
  const output = new ImageData(new Uint8ClampedArray(data), width, height)
  const outputData = output.data

  const components = findConnectedComponents(imageData)
  const smallRoots = new Set<number>()

  // 找出小于阈值的连通域
  const n = width * height
  const uf = new UnionFind(n)

  // 重建 Union-Find
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const pixelIdx = idx * 4
      if (data[pixelIdx] !== 0) continue

      if (x + 1 < width && data[(idx + 1) * 4] === 0) {
        uf.union(idx, idx + 1)
      }
      if (y + 1 < height && data[(idx + width) * 4] === 0) {
        uf.union(idx, idx + width)
      }
    }
  }

  // 标记小连通域的根
  for (const comp of components) {
    if (comp.size < minArea) {
      smallRoots.add(comp.root)
    }
  }

  // 将小连通域的像素变白
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const pixelIdx = idx * 4

      if (data[pixelIdx] !== 0) continue

      const root = uf.find(idx)
      if (smallRoots.has(root)) {
        outputData[pixelIdx] = 255
        outputData[pixelIdx + 1] = 255
        outputData[pixelIdx + 2] = 255
      }
    }
  }

  return output
}

/**
 * 填充小于指定面积的白色孔洞
 */
export function fillSmallHoles(
  imageData: ImageData,
  maxArea: number
): ImageData {
  const { width, height, data } = imageData
  const output = new ImageData(new Uint8ClampedArray(data), width, height)
  const outputData = output.data

  // 反转图像，让白色变成黑色
  const inverted = new ImageData(width, height)
  const invertedData = inverted.data

  for (let i = 0; i < data.length; i += 4) {
    const isWhite = data[i] === 255
    const value = isWhite ? 0 : 255
    invertedData[i] = value
    invertedData[i + 1] = value
    invertedData[i + 2] = value
    invertedData[i + 3] = 255
  }

  // 找到反转图像中的连通域（即原图的白色区域）
  const components = findConnectedComponents(inverted)

  // 重建 Union-Find 用于查找
  const n = width * height
  const uf = new UnionFind(n)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const pixelIdx = idx * 4
      if (invertedData[pixelIdx] !== 0) continue

      if (x + 1 < width && invertedData[(idx + 1) * 4] === 0) {
        uf.union(idx, idx + 1)
      }
      if (y + 1 < height && invertedData[(idx + width) * 4] === 0) {
        uf.union(idx, idx + width)
      }
    }
  }

  // 找出接触边界的连通域（这些是背景，不是孔洞）
  const borderRoots = new Set<number>()
  for (let x = 0; x < width; x++) {
    // 上边
    if (invertedData[x * 4] === 0) {
      borderRoots.add(uf.find(x))
    }
    // 下边
    const bottomIdx = (height - 1) * width + x
    if (invertedData[bottomIdx * 4] === 0) {
      borderRoots.add(uf.find(bottomIdx))
    }
  }
  for (let y = 0; y < height; y++) {
    // 左边
    const leftIdx = y * width
    if (invertedData[leftIdx * 4] === 0) {
      borderRoots.add(uf.find(leftIdx))
    }
    // 右边
    const rightIdx = y * width + width - 1
    if (invertedData[rightIdx * 4] === 0) {
      borderRoots.add(uf.find(rightIdx))
    }
  }

  // 找出需要填充的孔洞
  const holeRoots = new Set<number>()
  for (const comp of components) {
    // 不接触边界且面积小于阈值的是孔洞
    if (!borderRoots.has(comp.root) && comp.size <= maxArea) {
      holeRoots.add(comp.root)
    }
  }

  // 填充孔洞（将白色变为黑色）
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const pixelIdx = idx * 4

      if (invertedData[pixelIdx] !== 0) continue

      const root = uf.find(idx)
      if (holeRoots.has(root)) {
        outputData[pixelIdx] = 0
        outputData[pixelIdx + 1] = 0
        outputData[pixelIdx + 2] = 0
      }
    }
  }

  return output
}
