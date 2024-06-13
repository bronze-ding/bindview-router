/**
 * is node type ?
 * @param {Vnode} vdom 
 * @returns {Boolean}
 */
function isVnode(vdom) {
  if (Object.prototype.toString.call(vdom) === '[object Object]') {
    return ("elementName" in vdom && "attributes" in vdom && "children" in vdom)
  } else {
    return false
  }
}

export {
  isVnode
}