import Router from "../hash/Router"
import Bus from "../hash/Bus"
import addEventListener from "../hash/addEventListener"

import initSwitch from "../hash/initSwitch"
import initLink from "../hash/initLink"

import config from "../../package.json"

/**
 * hash 路由模式
 * @param {*} vm 
 * @returns 
 */
export default function hash(vm) {
  if (vm.constructor.Router) return

  const newRouter = new Router()
  const newBus = new Bus(newRouter)

  vm.proto("Router", newRouter)

  const Switch = initSwitch(newBus, newRouter)
  const Link = initLink(newBus)

  vm.components({ Switch, Link })

  addEventListener(newBus)

  console.log(`%c bindview-router %c v${config.version ? config.version : '❓🤔'} `,
    'background: #35495e; padding: 1px; border-radius: 3px 0 0 3px; color: #fff;',
    'background: #41b883; padding: 1px; border-radius: 0 3px 3px 0; color: #fff',
    '\n',
    'https://github.com/bronze-ding/bindview-router');
}
