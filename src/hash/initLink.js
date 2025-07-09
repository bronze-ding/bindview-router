import separateQuery from "../tools/separateQuery"
import objtoquery from "../tools/objtoquery"

const isObj = (to) => Object.prototype.toString.call(to) === '[object Object]'

export default function initLink(Bus) {
  return function Link(props, slot) {
    let { to, className, activeName } = props
    return {
      name: 'Link',
      render(h) {
        const { data: _, methods: f } = this
        return (h('a', {
          href: isObj(to) ? "#" + separateQuery(to.to) + objtoquery(to.query) : "#" + to,
          class: f.class()
        }, [slot()]))
      },
      data: () => ({
        path: ""
      }),
      methods: {
        class() {
          const length = isObj(to) ? separateQuery(to.to).length : to.length
          let newPath = this.data.path.substring(0, length + 1);
          let toPath = isObj(to) ? separateQuery(to.to) : to
          if (newPath === toPath.split("?")[0]) {
            let active = activeName ? activeName : "active"
            return `${active} ${className ? className : ""}`
          } else {
            return className ? className : ""
          }
        }
      },
      life: {
        created() {
          const vm = this
          Bus.on(vm._key, (path) => {
            vm.data.path = separateQuery(path)
          })
        },
        beforeDestroy() {
          Bus.off(this._key)
        }
      }
    }
  }
}