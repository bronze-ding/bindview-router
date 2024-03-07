import urlSearchParse from "../tools/urlSearchParse"

/**
 * 添加事件监听
 * @param {Bus} Bus 事件总线
 */
export default function addEventListener(Bus) {
  window.addEventListener("popstate", (event) => {
    Bus.to(window.location.pathname, urlSearchParse(window.location.search))
  });

  window.addEventListener('load', () => {
    Bus.to(window.location.pathname, urlSearchParse(window.location.search))
  })
}