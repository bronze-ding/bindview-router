import Router from "./Router"
import Bus from "./Bus"
import addEventListener from "./addEventListener"

import initLink from "./initLink"
import initSwitch from "./initSwitch"

import config from "../../package.json"

/**
 * history 路由模式
 * @param {*} vm 
 * @returns 
 */
export default function history(vm) {
  if (vm.constructor.Router) return

  const newRouter = new Router()
  const newBus = new Bus(newRouter)

  vm.proto("Router", newRouter)

  const Switch = initSwitch(newBus, newRouter)
  const Link = initLink(newBus)

  vm.components({ Link, Switch })

  addEventListener(newBus)

  console.log(`%c bindview-router %c v${config.version ? config.version : '❓🤔'} `,
    'background: #35495e; padding: 1px; border-radius: 3px 0 0 3px; color: #fff;',
    'background: #41b883; padding: 1px; border-radius: 0 3px 3px 0; color: #fff',
    '\n',
    'https://github.com/bronze-ding/bindview-router');
}