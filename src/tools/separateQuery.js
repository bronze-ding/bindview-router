/**
 * 分离query
 * @param {*} url 
 */
export default function separateQuery(url) {
  let separateJingUrl = url.indexOf("#") !== -1 ? url.split("#")[1] : url
  if (url === "" || url === "#/" || url === "/") return "/"
  separateJingUrl = separateJingUrl.indexOf('?') !== -1 ? separateJingUrl.split('?')[0] : separateJingUrl
  if (separateJingUrl[separateJingUrl.length - 1] === "/") {
    separateJingUrl = separateJingUrl.slice(0, -1)
    return separateJingUrl
  } else {
    return separateJingUrl
  }
}