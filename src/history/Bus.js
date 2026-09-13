import objtoquery from "../tools/objtoquery"
import { emitRouterDevtools } from "../tools/devtools"

class Bus {
  list = new Map()
  Router = null
  constructor(Router) {
    this.Router = Router
    Router.__init__(this.to.bind(this))
  }

  on(key, func) {
    this.list.set(key, func)
  }

  emit(newURL, Query) {
    this.Router.oldURL = this.Router.newURL
    this.Router.newURL = newURL
    this.Router.query = Query

    // 通知 devtools 路由变更(未安装调试插件时为空操作)
    emitRouterDevtools('router:navigate', {
      oldURL: this.Router.oldURL,
      newURL: newURL,
      query: Query,
      timestamp: Date.now()
    })

    for (const [, listener] of this.list) {
      listener(newURL)
    }
  }

  to(path, query = {}) {
    history.pushState({}, "", path + objtoquery(query))
    this.emit(path, query)
  }

  off(key) {
    this.list.delete(key)
  }
}

export default Bus