import Router from "../hash/Router"
import Bus from "../hash/Bus"
import addEventListener from "../hash/addEventListener"

import initSwitch from "../hash/initSwitch"
import initLink from "../hash/initLink"

export default function hash(vm) {
  if (vm.constructor.Router) return

  const newRouter = new Router()
  const newBus = new Bus(newRouter)

  vm.proto("Router", newRouter)

  const Switch = initSwitch(newBus, newRouter)
  const Link = initLink(newBus)

  vm.components({ Switch, Link })

  addEventListener(newBus)
}
