import separateQuery from "../tools/separateQuery"
import urlSearchParse from "../tools/urlSearchParse";

const isObj = (to) => Object.prototype.toString.call(to) === '[object Object]'

export default function initSwitch(Bus, Router) {
  return function Switch(props, slot) {
    let { components, rank, className, defend, async = {}, wait } = props
    // 异步组件加载中标记(每个 Switch 实例独立):
    // render 在异步组件加载完成前会被多次执行,若不加缓存会重复调用 import()
    // 并重复触发 $mupdate,从而造成重复渲染与多余的组件创建。
    const asyncLoading = Object.create(null)
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
          const name = slot['elementName']
          // 已注册(包含此前异步加载完成的组件)直接复用,不再触发加载
          if (name in this._Components) {
            return slot
          }
          if (name in async) {
            // 同一组件的 import 只发起一次(避免 render 期间重复 import 与重复更新)
            if (!asyncLoading[name]) {
              asyncLoading[name] = true
              async[name]()
                .then(module => {
                  asyncLoading[name] = false
                  if (name in this._Components) return // 已注册,无需重复处理
                  this.$appendComponent(name, module && module.default !== void 0 ? module.default : module)
                  this.$mupdate()
                })
                .catch(err => {
                  asyncLoading[name] = false // 加载失败时释放占位,允许后续重试
                  console.error(`[bindview-router] 异步组件 "${name}" 加载失败`, err)
                })
            }
            return typeof wait === 'function' ? wait() : ""
          }
          return slot
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
              if (vm.data.path !== newPath) {
                vm.data.path = newPath
              }
            }
          })

          Bus.emit(separateQuery(location.hash), urlSearchParse(location.hash))
        },
        beforeDestroy() {
          Bus.off(this._key)
        }
      },
      components: isObj(components) ? components : {}
    }
  }
}