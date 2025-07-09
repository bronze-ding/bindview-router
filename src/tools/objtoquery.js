/**
 * 将对象装换为querystring
 * @param {*} queryParameters 
 * @returns 
 */
export default function objtoquery(queryParameters) {
  return queryParameters
    ? Object.entries(queryParameters).reduce((queryString, [key, val], index) => {
      const symbol = queryString.length === 0 ? '?' : '&';
      queryString += typeof val === 'string' ? `${symbol}${key}=${val}` : typeof val === 'number' ? `${symbol}${key}=${val}` : '';
      return queryString;
    }, '')
    : '';
};
