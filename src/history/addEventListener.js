import urlSearchParse from "../tools/urlSearchParse"

/**
 * 添加事件监听
 * @param {Bus} Bus 事件总线
 */
export default function addEventListener(Bus) {
  window.addEventListener("popstate", () => {
    // 后退/前进时只派发状态,不再 pushState,避免污染历史记录
    Bus.emit(window.location.pathname, urlSearchParse(window.location.search))
  });
}