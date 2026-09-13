import Router from "./Router"
import Bus from "./Bus"
import addEventListener from "./addEventListener"

import initLink from "./initLink"
import initSwitch from "./initSwitch"

import { registerRouterPlugin } from "../tools/devtools"

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

  // 注册路由插件信息到 devtools(未安装调试插件时为空操作)
  registerRouterPlugin({ mode: "history", version: config.version, router: newRouter, bus: newBus })

  console.log(`%c bindview-router %c v${config.version ? config.version : '❓🤔'} `,
    'background: #35495e; padding: 1px; border-radius: 3px 0 0 3px; color: #fff;',
    'background: #41b883; padding: 1px; border-radius: 0 3px 3px 0; color: #fff',
    '\n',
    'https://github.com/bronze-ding/bindview-router');
}