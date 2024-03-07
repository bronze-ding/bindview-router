import separateQuery from "../tools/separateQuery"

const isObj = (to) => Object.prototype.toString.call(to) === '[object Object]'

export default function initSwitch(Bus, Router) {
  return function Switch(props, slot) {
    let { components, rank, className, defend } = props
    return {
      name: 'Switch',
      render(h) {
        const { data: _ } = this
        return (h('div', { class: className ? className : "" }, [slot ? slot(_.path) : ""]))
      },
      data: () => ({
        path: ""
      }),
      life: {
        created() {
          const vm = this
          Bus.on(vm._key, (path) => {
            let pathArry = separateQuery(path).split("/")
            pathArry.shift()
            let newPath = ""
            for (let i = 0; i < rank; i++) {
              if (pathArry[i] !== void 0) {
                newPath += "/" + pathArry[i]
              } else {
                break
              }
            }

            if (typeof defend === 'function') {
              defend(Router.oldURL, Router.newURL, (to, query = {}) => {
                // 路由守卫
                const Path = to ? separateQuery(to) : newPath
                if (to) {
                  Bus.to(Path, query)
                } else {
                  vm.data.path = newPath
                }
              })
            } else {
              vm.data.path = newPath
            }
          })
        },
        beforeDestroy() {
          Bus.off(this._key)
        }
      },
      components: isObj(components) ? components : {}
    }
  }
}