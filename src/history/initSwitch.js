import separateQuery from "../tools/separateQuery"
import urlSearchParse from "../tools/urlSearchParse"

const isObj = (to) => Object.prototype.toString.call(to) === '[object Object]'

export default function initSwitch(Bus, Router) {
  return function Switch(props, slot) {
    let { components, rank, className, defend, async = {}, wait } = props
    return {
      name: 'Switch',
      render(h) {
        const { data: _, methods: f } = this
        return (h('div', { class: className ? className : "" }, [slot ? f.render(slot(_.path)) : ""]))
      },
      data: () => ({
        path: ""
      }),
      methods: {
        render(slot) {
          let state = false
          if (slot['elementName'] in this._Components) {
            return slot
          }
          if (slot['elementName'] in async) {
            async[slot['elementName']]().then(module => {
              this.$appendComponent(slot['elementName'], module.default)
              state = true
              this.$mupdate()
            })
          } else {
            state = true
          }
          return state ? slot : typeof wait === 'function' ? wait() : ""
        }
      },
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


          Bus.emit(window.location.pathname, urlSearchParse(window.location.search), vm._key)

        },
        beforeDestroy() {
          Bus.off(this._key)
        }
      },
      components: isObj(components) ? components : {}
    }
  }
}