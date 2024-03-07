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

  $to(paht, query = {}) { this.__to__(paht, query) }

  $go(Number) { window.history.go(Number) }

  $back() { history.back() }

  $forward() { history.forward() }
}

export default Router