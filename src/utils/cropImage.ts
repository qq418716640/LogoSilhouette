/**
 * 图片裁剪工具函数
 */

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 根据裁剪区域从图片创建裁剪后的 ImageData
 * @param imageSrc 图片 URL 或 Data URL
 * @param cropAreaPixels 裁剪区域（像素坐标）
 * @returns 裁剪后的 ImageData
 */
export async function getCroppedImageData(
  imageSrc: string,
  cropAreaPixels: CropArea
): Promise<ImageData> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.width = cropAreaPixels.width
  canvas.height = cropAreaPixels.height

  ctx.drawImage(
    image,
    cropAreaPixels.x,
    cropAreaPixels.y,
    cropAreaPixels.width,
    cropAreaPixels.height,
    0,
    0,
    cropAreaPixels.width,
    cropAreaPixels.height
  )

  return ctx.getImageData(0, 0, cropAreaPixels.width, cropAreaPixels.height)
}

/**
 * 从 URL 创建 Image 对象
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })
}

/**
 * 将 File 转换为 Data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 将 ImageData 转换为 Data URL
 */
export function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL()
}
