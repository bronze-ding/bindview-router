/**
 * 解析 query 参数
 * @param {String} url url
 * @returns Object
 */
export default function urlSearchParse(url) {
  let obj = {};
  if (url.indexOf("?") === -1) return obj
  //提取？后面的值
  let urlArr = url.split('?')[1].split('&');//['q=12345','a=b']
  if (urlArr.length) {
    urlArr.forEach((item) => {
      let key = item.split('=')[0];
      let value = item.split('=')[1];
      obj[key] = value;
    })
  }
  return obj;
}
