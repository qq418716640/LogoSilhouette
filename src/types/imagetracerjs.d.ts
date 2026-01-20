/**
 * imagetracerjs 类型定义
 */

declare module 'imagetracerjs' {
  export interface ImageTracerOptions {
    // Tracing
    corsenabled?: boolean
    ltres?: number       // 直线容差
    qtres?: number       // 曲线容差
    pathomit?: number    // 路径最小长度（噪声过滤）
    rightangleenhance?: boolean  // 直角增强

    // Color quantization
    colorsampling?: 0 | 1 | 2
    numberofcolors?: number
    mincolorratio?: number
    colorquantcycles?: number

    // Layering
    layering?: 0 | 1

    // SVG rendering
    strokewidth?: number
    linefilter?: boolean
    scale?: number
    roundcoords?: number
    viewbox?: boolean
    desc?: boolean
    lcpr?: number
    qcpr?: number

    // Blur preprocessing
    blurradius?: number
    blurdelta?: number

    // Custom palette
    pal?: Array<{ r: number; g: number; b: number; a: number }>
  }

  export interface ImageTracerStatic {
    imageToSVG(
      url: string,
      callback: (svgstr: string) => void,
      options?: ImageTracerOptions | string
    ): void

    imagedataToSVG(
      imagedata: ImageData,
      options?: ImageTracerOptions | string
    ): string

    imageToTracedata(
      url: string,
      callback: (tracedata: any) => void,
      options?: ImageTracerOptions | string
    ): void

    imagedataToTracedata(
      imagedata: ImageData,
      options?: ImageTracerOptions | string
    ): any

    appendSVGString(svgstr: string, parentid: string): void

    optionpresets: Record<string, Partial<ImageTracerOptions>>
  }

  const ImageTracer: ImageTracerStatic
  export default ImageTracer
}
