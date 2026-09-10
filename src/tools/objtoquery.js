/**
 * 将对象转换为 querystring(以 "?" 开头)
 * @param {*} queryParameters
 * @returns
 */
export default function objtoquery(queryParameters) {
  if (!queryParameters || typeof queryParameters !== 'object') return ''
  const pairs = []
  for (const [key, val] of Object.entries(queryParameters)) {
    if (val == null) continue
    if (typeof val !== 'string' && typeof val !== 'number' && typeof val !== 'boolean') continue
    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
  }
  return pairs.length ? '?' + pairs.join('&') : ''
};
