import { isVnode } from "./isVnode"

/**
 * 路由映射表构造器
 */
class RouterTable {
  RouterTable = new Map()

  constructor(RouterTable) {
    this._addRouterTable(RouterTable)
  }


  _addRouterTable(RouterTable) {
    for (let i = 0; i < RouterTable.length; i++) {
      if (typeof RouterTable[i]['path'] !== "string" && !Array.isArray(RouterTable[i]['path'])) {
        console.error("[CreateRouterTable] path 应该为 string array")
        return
      }

      if (!(isVnode(RouterTable[i]['component']) || typeof RouterTable[i]['component'] === 'number' || typeof RouterTable[i]['component'] === 'string')) {
        console.error("[CreateRouterTable] component 应该为 vnode number string")
        return
      }

      if (Array.isArray(RouterTable[i]['path'])) {
        RouterTable[i]['path'].forEach(item => {
          if (typeof item !== 'string') {
            console.error("[CreateRouterTable] path数组元素应该为 string")
            return
          }

          this.RouterTable.set(item, RouterTable[i]['component'])
        });
      } else {
        this.RouterTable.set(RouterTable[i]['path'], RouterTable[i]['component'])
      }
    }
  }

  /**
   * 追加路由
   * @param {*} routerAndRouterList 路由或路由表
   */
  append(routerAndRouterList) {
    if (Object.prototype.toString.call(routerAndRouterList) === '[object Object]') {
      const table = []
      table.push(routerAndRouterList)
      this._addRouterTable(table)
    } else if (Array.isArray(routerAndRouterList)) {
      this._addRouterTable(routerAndRouterList)
    } else {
      console.error('[CreateRouterTable] 参数应该为对象或数组')
      return
    }
  }

  /**
   * 路由匹配
   * @param {String} path 路由
   * @returns 
   */
  result(path) {
    if (this.RouterTable.has(path)) {
      return this.RouterTable.get(path)
    } else {
      if (this.RouterTable.has("ErrorPage")) {
        return this.RouterTable.get("ErrorPage")
      } else {
        console.error("[CreateRouterTable] 路由表需要配置一个错误页 ErrorPage")
      }
    }
  }
  /**
   * 删除路由
   * @param {*} path path
   */
  deletePath(path) {
    if (this.RouterTable.has(path)) {
      map1.delete(path)
    } else {
      console.warn('[CreateRouterTable] 路由表中没有 ' + path)
    }
  }
}

/**
 * 创建路由表
 * @param {Array<Object>} config 
 * @returns {RouterTable}
 */
export default function CreateRouterTable(config) {
  return new RouterTable(config)
}