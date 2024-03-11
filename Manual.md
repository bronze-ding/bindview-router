## bindview-router
bindview-router 是基于 `Bindview@3` 的路由组件库内部提供了两个路由组件`Link`和`Switch`,用来帮助用户构建单页面应用（SPA）

## 安装

使用 `npm` 包管理器

```npm
npm i bindview-router
```

## 使用

因为 `hash` 和 `history` 路由模式的配置和使用完全一样所以下面的例子将以 `hash` 的模式下演示，下面的演示都将在 `Bindview` 的<a href="https://github.com/bronze-ding/bindview-Template">webpack 模板</a> 环境下进行

### 1. 导入并使用

到通过 `use` 使用插件后，插件将自动将 `Link` 和 `Switch` 注册为全局组件，还添加一个 `Router` 全局属性

```jsx
import Bindview from "bindview@3"
import { hash, history } from "bindview-router" //导入并解构出路由插件

import App from "./App";

Bindview.use(hash) // 在 use 中使用

new Bindview({
  el: "#Root",
  render: () => (<App />),
  components: { App }
})
```

### 2. `Switch` 组件

| 配置项       | 必要性 | 说明                 |
| ------------ | ------ | -------------------- |
| `rank`       | ✅      | 标识路由级别         |
| `components` | ❎      | 给 `Switch` 注册组件 |
| `className`  | ❎      | 给 `Switch` 设置类名 |
| `defend`     | ❎      | `Switch` 路由守卫    |
| `async`      | ❎      | 注册异步组件         |
| `wait`       | ❎      | 异步等待时样式       |

`Switch` 是基于动态组件创建的，组件需要一个属性 `rank` 路由级别这是必须的 ，组件使用了函数插槽，函数接收一个参数的是当前路由级别的路由字符串，通过这个字符串配合 `swtich` 语句返回对应的组件，因为是基于动态组件的每个组件都需要一个唯一的 `UUID` 可使用 `Bindview@3` 提供的 `createID` 函数创建

```jsx
import { createID } from "bindview@3"
import A from "./Components/A"
import B from "./Components/B"

export default function App() {
  const [a, b] = createID(2)
  return {
    name: 'App',
    render() {
      const { data: _ } = this
      return (
        <div id="App">
          <Switch rank={1} components={{ A, B }}>{(path) => {
            switch (path) {
              case "/":
              case "/A":
                return <A id={a} />
              case "/B":
                return <B id={b} />
              default:
                return <div>404</div>
            }
          }}</Switch>
        </div >
      )
    }
  }
}
```

#### 路由守卫

`Switch` 组件路由守卫, 组件上有一个 `defend` 属性它需要一个函数参数，函数会接到3个参数，为 `oldURL` `newURL` `next` 分别为 旧的路由，新的路由，和 `next` 用来对路由放行和定向重,当使用了路由守卫 `defend` 必须调用 `next`

```jsx
import { createID } from "bindview@3"
import A from "./Components/A"
import B from "./Components/B"

export default function App() {
  const [a, b] = createID(2)
  return {
    name: 'App',
    render() {
      const { data: _ ,methods: f} = this
      return (
        <div id="App">
          <Switch rank={1} components={{ A, B }} defend={f.defend}>{(path) => {
            switch (path) {
              case "/":
              case "/A":
                return <A id={a} />
              case "/B":
                return <B id={b} />
              default:
                return <div>404</div>
            }
          }}</Switch>
        </div >
      )
    },
    methods:{
        defend(oldURL,newURL,next){
            ... 逻辑
            next 函数定向重 
            next('/B' , { ...query参数 })
        }
    }
  }
}
```

#### 异步组件

`异步组件` 它允许开发者在需要时才加载组件，而不是在应用启动时就立即加载所有组件。这种方式可以避免页面加载时加载全部组件，从而减少页面加载时间，提高应用程序的性能和加载速度。异步组件通过 `import()` 进行导入，它们不会立即被解析和加载，只有在实际需要时才会进行加载。这种延迟加载的特性使得异步组件适用于那些需要按需加载的场景，例如与路由系统配合使用时，可以实现动态加载组件，进一步提升用户体验和响应速度

需要异步导入的 组件 在 `async` 中配置以对象的形式配置属性名是组件名，属性是一个函数返回一个 `import()` 

`wait` 是在异步加载组件等待过程中展示的，通过一个函数返回一个组件 (!!! 组件需要在 `components` 中注册,组件需要一个唯一不变的 `UUID` ) 或通过函数返回一段 `虚拟dom` 结构

```jsx
import { createID } from "bindview@3"
import { Wait } from "./Components/Wait"

export default function Async() {
  const [b,w] = createID(2)
  return {
    name: 'Async',
    render() {
      return (
        <div>
          <Link to="/Pag/B">B</Link>
          <Switch
            rank={2}
            wait={() => (<Wait id={w} />)}
            components={{ Wait }}
            async={{
              B: () => import("@/Components/B")
            }}
          >{(path) => {
            switch (path) {
              case "/Pag/B":
                return <B id={b} />
              default:
                return <div>404</div>
            }
          }}</Switch>
        </div>
      )
    }
  }
}
```



### 3. `Link` 组件

| 配置项        | 必要性 | 说明                    |
| ------------- | ------ | ----------------------- |
| `to`          | ✅      | 跳转路径和 `query` 参数 |
| `className`   | ❎      | a 标签类名              |
| `activeClass` | ❎      | 激活时类名默认 `active` |

`Link` 组件是配合 `Switch` 来使用的，组件会创建出一个 `a` 标签，组件上有三个属性， `to` 属性是要去的路由， `className` a 标签类名可以不添加，`activeClass` 激活时添加类名默认添加 `active`

```jsx
import { createID } from "bindview@3"
import A from "./Components/A"
import B from "./Components/B"

export default function App() {
  const [a, b] = createID(2)
  return {
    name: 'App',
    render() {
      const { data: _ } = this
      return (
        <div id="App">
          <Link to="/A">/A</Link>|
          <Link to={{
            to: "/B",
            query: {
              title: "Test"
            }
          }}>B</Link> ... 传递 query参数
          <Switch rank={1} components={{ A, B }}>{ ...逻辑 }</Switch>
        </div >
      )
    }
  }
}
```

### 4. `Router` 对象

在 `Router` 上有三个属性，四个方法，该属性提供了编程式路由

| 属性或方法 | 使用                                                         |
| ---------- | ------------------------------------------------------------ |
| `oldURL`   | 获取跳转前旧路由                                             |
| `newURL`   | 获取新的路由                                                 |
| `query`    | 获取路由上的 `query` 参数                                    |
| `$go`      | 从会话历史记录中加载特定页面。你可以使用它在历史记录中前后移动 （传入一个数值类型） |
| `$to`      | 跳转到特定页面（参数一 路由路径，参数二 query 参数）         |
| `$back`    | 方法会在会话历史记录中向后移动一页。如果没有上一页，则此方法调用不执行任何操作 |
| `$forward` | 在会话历史中向前移动一页                                     |

```jsx
export default function A() {
  return {
    name: 'A',
    render() {
      return (
        <div>
          A
          <button onClick={() => this.Router.$to("/B", {
            title: 'Test'
          })}>Router</button> ... $to
        </div>
      )
    }
  }
}
```

