/**
 * 分离 query 并标准化路径:去掉 hash 前缀、查询串、末尾斜杠,空路径归一为 "/"
 * @param {*} url
 */
export default function separateQuery(url) {
  if (typeof url !== 'string') url = url == null ? "" : String(url)
  let path = url

  const hashIndex = path.indexOf("#")
  if (hashIndex !== -1) path = path.slice(hashIndex + 1)

  const queryIndex = path.indexOf("?")
  if (queryIndex !== -1) path = path.slice(0, queryIndex)

  if (path === "" || path === "/") return "/"
  if (path.length > 1 && path[path.length - 1] === "/") {
    path = path.slice(0, -1)
  }
  return path
}