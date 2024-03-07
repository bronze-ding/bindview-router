import objtoquery from "../tools/objtoquery"

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
    let tempPath
    tempPath = this.Router.newURL
    this.Router.oldURL = tempPath
    this.Router.newURL = newURL
    this.Router.query = Query
    for (let i of this.list) {
      i[1](newURL)
    }
  }

  to(path, query = {}) {
    // 跳转
    window.location.href = "#" + path + (query ? objtoquery(query) : '');
    this.emit(path, query)
  }

  off(key) {
    this.list.delete(key)
  }
}

export default Bus