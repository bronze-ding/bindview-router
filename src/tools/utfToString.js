/**
 * 将百分号编码(UTF-8)转换为字符串
 * @param {String} input 百分号编码文本
 * @returns
 */
export default function utfToString(input) {
  if (typeof input !== 'string') return input
  try {
    return decodeURIComponent(input)
  } catch (e) {
    return input
  }
}