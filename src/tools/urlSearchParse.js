/**
 * 解析 query 参数
 * @param {String} url url
 * @returns Object
 */
export default function urlSearchParse(url) {
  const obj = {}
  if (typeof url !== 'string') return obj
  const queryIndex = url.indexOf("?")
  if (queryIndex === -1) return obj
  try {
    new URLSearchParams(url.slice(queryIndex + 1)).forEach((value, key) => {
      obj[key] = value
    })
  } catch (e) {
    // 非法 query 忽略
  }
  return obj
}
