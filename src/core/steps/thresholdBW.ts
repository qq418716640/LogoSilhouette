/**
 * 灰度化 + 阈值二值化
 * 将图像转为黑白二值图
 */

/**
 * 将 RGB 转换为灰度值
 * 使用 ITU-R BT.601 标准加权公式
 */
function rgbToGray(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/**
 * 对图像进行灰度化和阈值二值化处理
 * @param imageData 输入图像数据
 * @param threshold 阈值 (0-255)
 * @param invert 是否反相（交换黑白）
 * @returns 二值化后的图像数据（黑白，保留透明通道）
 */
export function thresholdBW(
  imageData: ImageData,
  threshold: number,
  invert: boolean
): ImageData {
  const { width, height, data } = imageData
  const output = new ImageData(width, height)
  const outputData = output.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    // 计算灰度值
    const gray = rgbToGray(r, g, b)

    // 阈值判断
    let isBlack = gray < threshold

    // 反相处理
    if (invert) {
      isBlack = !isBlack
    }

    // 透明像素保持透明，否则转为黑或白
    if (a < 128) {
      // 透明像素变为白色
      outputData[i] = 255
      outputData[i + 1] = 255
      outputData[i + 2] = 255
      outputData[i + 3] = 255
    } else {
      // 黑色或白色
      const value = isBlack ? 0 : 255
      outputData[i] = value
      outputData[i + 1] = value
      outputData[i + 2] = value
      outputData[i + 3] = 255
    }
  }

  return output
}

/**
 * 判断像素是否为黑色（用于后续处理）
 */
export function isBlackPixel(data: Uint8ClampedArray, index: number): boolean {
  return data[index] === 0
}

/**
 * 判断像素是否为白色
 */
export function isWhitePixel(data: Uint8ClampedArray, index: number): boolean {
  return data[index] === 255
}
