/**
 * 位图描摹 - 将二值图像转换为 SVG 路径
 * 使用 imagetracerjs 库实现高质量矢量化
 */

import ImageTracer from 'imagetracerjs'
import type { ImageTracerOptions } from 'imagetracerjs'

/**
 * imagetracerjs 的 tracing 参数
 */
export interface TracingParams {
  /** 曲线容差，值越大曲线越平滑（推荐 0.5-3.0） */
  qtres: number
  /** 直线容差，值越大直线越少（推荐 0.5-3.0） */
  ltres: number
  /** 路径最小节点数，小于此值的路径会被删除（噪声过滤） */
  pathomit: number
  /** 坐标精度，1 = 1位小数，2 = 2位小数 */
  roundcoords: number
  /** 是否增强直角 */
  rightangleenhance: boolean
  /** 线条过滤（减少噪声） */
  linefilter: boolean
}

/**
 * 默认 tracing 参数
 */
export const DEFAULT_TRACING_PARAMS: TracingParams = {
  qtres: 2.0,
  ltres: 2.0,
  pathomit: 16,
  roundcoords: 2,
  rightangleenhance: true,
  linefilter: false,
}

/**
 * 使用 imagetracerjs 描摹二值图像生成 SVG
 * @param imageData 二值图像数据（黑白）
 * @param params tracing 参数
 * @returns SVG 字符串
 */
export function traceSvg(
  imageData: ImageData,
  params: Partial<TracingParams> = {}
): string {
  const { width, height } = imageData

  // 合并参数
  const options: ImageTracerOptions = {
    // Tracing 参数
    qtres: params.qtres ?? DEFAULT_TRACING_PARAMS.qtres,
    ltres: params.ltres ?? DEFAULT_TRACING_PARAMS.ltres,
    pathomit: params.pathomit ?? DEFAULT_TRACING_PARAMS.pathomit,
    rightangleenhance: params.rightangleenhance ?? DEFAULT_TRACING_PARAMS.rightangleenhance,
    linefilter: params.linefilter ?? DEFAULT_TRACING_PARAMS.linefilter,

    // SVG 渲染参数
    roundcoords: params.roundcoords ?? DEFAULT_TRACING_PARAMS.roundcoords,
    scale: 1,
    strokewidth: 0,  // 不要描边，只要填充
    viewbox: true,   // 使用 viewBox
    desc: false,     // 不要描述

    // 颜色参数 - 二值图像只需要 2 色
    colorsampling: 0,      // 禁用采样，使用自定义调色板
    numberofcolors: 2,
    colorquantcycles: 1,

    // 自定义调色板：黑白
    pal: [
      { r: 0, g: 0, b: 0, a: 255 },      // 黑色
      { r: 255, g: 255, b: 255, a: 255 }, // 白色
    ],
  }

  // 调用 imagetracerjs
  let svg = ImageTracer.imagedataToSVG(imageData, options)

  // 后处理：移除白色路径，只保留黑色
  svg = removeWhitePaths(svg)

  // 确保 viewBox 正确
  svg = ensureViewBox(svg, width, height)

  return svg
}

/**
 * 移除 SVG 中的白色路径
 * imagetracerjs 会为黑白两色都生成路径，我们只需要黑色
 */
function removeWhitePaths(svg: string): string {
  // 移除 fill="rgb(255,255,255)" 的路径
  // imagetracerjs 生成的格式是 fill="rgb(r,g,b)"
  return svg.replace(/<path[^>]*fill="rgb\(255,255,255\)"[^>]*\/>/g, '')
}

/**
 * 确保 SVG 有正确的 viewBox
 */
function ensureViewBox(svg: string, width: number, height: number): string {
  // 如果已经有 viewBox，直接返回
  if (svg.includes('viewBox')) {
    return svg
  }

  // 添加 viewBox
  return svg.replace(
    /<svg([^>]*)>/,
    `<svg$1 viewBox="0 0 ${width} ${height}">`
  )
}

/**
 * 兼容旧 API 的包装函数
 * @deprecated 使用 traceSvg(imageData, params) 代替
 */
export function traceSvgLegacy(
  imageData: ImageData,
  pathOmit: number,
  _cornerThreshold?: number,
  _useCurve: boolean = true,
  _abortCheck?: () => boolean
): string {
  // 将旧的 pathOmit 参数映射到新的 tracing 参数
  // pathOmit 范围 1-30，映射到 qtres 0.5-3.0
  const qtres = 0.5 + (pathOmit / 30) * 2.5
  const ltres = qtres
  const pathomitNew = Math.max(4, Math.round(pathOmit * 0.8))

  return traceSvg(imageData, {
    qtres,
    ltres,
    pathomit: pathomitNew,
  })
}
