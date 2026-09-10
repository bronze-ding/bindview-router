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
    this.Router.oldURL = this.Router.newURL
    this.Router.newURL = newURL
    this.Router.query = Query
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