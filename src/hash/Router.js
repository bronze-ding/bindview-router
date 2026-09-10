const isObj = (to) => Object.prototype.toString.call(to) === '[object Object]'

class Router {
  oldURL = ""
  newURL = ""
  query = null

  __init__(__to__) {
    Object.defineProperty(this.__proto__, '__to__', {
      value: __to__,
      writable: true,
      enumerable: false,
      configurable: true
    });
  }

  $to(path, query = {}) {
    // 兼容对象形态:$to({ to: '/B', query: { title: 'x' } })
    if (isObj(path)) {
      query = path.query || query
      path = path.to
    }
    this.__to__(path, query)
  }

  $go(n) { window.history.go(n) }

  $back() { window.history.back() }

  $forward() { window.history.forward() }
}

export default Router