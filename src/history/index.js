import Router from "./Router"
import Bus from "./Bus"
import addEventListener from "./addEventListener"

import initLink from "./initLink"
import initSwitch from "./initSwitch"

export default function history(vm) {
  if (vm.constructor.Router) return
  const newRouter = new Router()
  const newBus = new Bus(newRouter)

  vm.proto("Router", newRouter)

  const Link = initLink(newBus)
  const Switch = initSwitch(newBus, newRouter)

  vm.components({ Link, Switch })

  addEventListener(newBus)
}