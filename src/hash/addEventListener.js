import urlSearchParse from "../tools/urlSearchParse";
import separateQuery from "../tools/separateQuery";

export default function addEventListener(Bus) {
  window.addEventListener("hashchange", () => {
    Bus.emit(separateQuery(location.hash), urlSearchParse(location.hash))
  })

  window.addEventListener('load', () => {
    Bus.emit(separateQuery(location.hash), urlSearchParse(location.hash))
  })
}
