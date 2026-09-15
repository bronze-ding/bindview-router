## bindview-router

`bindview-router` 是基于 `bindview` 的路由组件库，内部提供了两个路由组件 `Link` 和 `Switch`（以及一个全局属性 `Router`），用来帮助用户构建单页面应用（SPA）。

- 支持两种模式：`hash`（`#/path`）与 `history`（`/path`）
- 两种模式的**配置与使用完全一致**，差异只在地址形态与底层监听事件（见「hash 与 history 的差异」）
- 当前版本：v1.2.0

## 安装

使用 `npm` 包管理器

```npm
npm i bindview-router
```

## 使用

因为 `hash` 和 `history` 路由模式的配置和使用完全一样所以下面的例子将以 `hash` 的模式下演示，下面的演示都将在 `Bindview` 的<a href="https://github.com/bronze-ding/bindview-Template">webpack 模板</a> 环境下进行

### 1. 导入并使用

通过 `use` 使用插件后，插件会自动完成三件事：注册全局组件 `Link` / `Switch`、追加全局属性 `Router`、监听地址变化（并打印版本横幅）。

```jsx
import Bindview from "bindview"
import { hash, history } from "bindview-router" //导入并解构出路由插件

import App from "./App";

Bindview.use(hash) // 在 use 中使用

new Bindview({
  el: "#Root",
  render: () => (<App />),
  components: { App }
})
```

<span style="color:red">！！！</span> 路由插件**只能安装一次**：插件内部有 `if (vm.constructor.Router) return` 守卫（见 [`hash/index.js`](bindview-router/src/hash/index.js:18)、[`history/index.js`](bindview-router/src/history/index.js:18)）。重复调用 `use(hash)`、或先 `use(hash)` 再 `use(history)`，**第二次会被静默忽略**（也不会再打印横幅）。因此「两种模式同时生效」是不支持的。

> `use` 也支持数组形式：`Bindview.use([hash])`。

### 2. `Switch` 组件

| 配置项       | 必要性 | 说明                 |
| ------------ | ------ | -------------------- |
| `rank`       | ✅      | 标识路由级别         |
| `components` | ❎      | 给 `Switch` 注册组件 |
| `className`  | ❎      | 给 `Switch` 包裹层设置类名 |
| `defend`     | ❎      | `Switch` 路由守卫    |
| `async`      | ❎      | 注册异步组件         |
| `wait`       | ❎      | 异步等待时样式       |

`Switch` 是基于动态组件创建的，组件需要一个属性 `rank` 路由级别这是必须的，组件使用了函数插槽，函数接收一个参数的是当前路由级别的路由字符串，通过这个字符串配合 `switch` 语句返回对应的组件，因为是基于动态组件的每个组件都需要一个唯一的 `UUID` 可使用 `bindview` 提供的 `createID` 函数创建

```jsx
import { createID } from "bindview"
import A from "./Components/A"
import B from "./Components/B"

export default function App() {
  const [a, b] = createID(2)
  return {
    name: 'App',
    render() {
      return (
        <div id="App">
          <Switch rank={1} components={{ A, B }}>{(path) => {
            switch (path) {
              case "":
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

> <span style="color:yellow">*** </span> 插槽**必须是函数插槽**（`{(path) => ...}`）。若写成普通插槽，`path` 参数会被忽略，导致无论路由怎么变都渲染同一份内容。

#### 关于 `rank`

`rank` 表示「取路径的前几段」（见 [`initSwitch.js`](bindview-router/src/hash/initSwitch.js:57)）：

| 地址 | `rank={1}` | `rank={2}` |
| --- | --- | --- |
| `#/A` | `/A` | `/A` |
| `#/Pag/B` | `/Pag` | `/Pag/B` |

上级 `Switch` 用 `rank={1}` 匹配第一段、子级 `Switch` 用 `rank={2}` 匹配前两段，即可构成嵌套路由。`rank` 超过实际段数时**不会报错**，只会命中更短的路径。

#### ⚠️ 首帧 `path` 为空字符串

`Switch` 的 `data.path` 初始值是 `""`（见 [`initSwitch.js`](bindview-router/src/hash/initSwitch.js:22)），而真正的路由字符串是在 `created` 中 `Bus.emit(...)` 之后才写入的，并且要等到**微任务**里才会重新渲染（`bindview` 的更新是批处理的）。

因此**首帧会以 `path === ""` 命中你的 `default` 分支**（通常表现为闪一下 404）。建议：

- 在 `switch` 中把 `case ""` 与 `case "/"` 合并处理；或
- 让 `default` 返回空内容 / 骨架屏，而不要直接返回 404 页面。

#### 路由守卫

`Switch` 组件路由守卫, 组件上有一个 `defend` 属性它需要一个函数参数，函数会接到3个参数，为 `oldURL` `newURL` `next` 分别为 旧的路由，新的路由，和 `next` 用来对路由放行和定向重,当使用了路由守卫 `defend` 必须调用 `next`

```jsx
import { createID } from "bindview"
import A from "./Components/A"
import B from "./Components/B"

export default function App() {
  const [a, b] = createID(2)
  return {
    name: 'App',
    render() {
      const { methods: f } = this
      return (
        <div id="App">
          <Switch rank={1} components={{ A, B }} defend={f.defend}>{(path) => {
            switch (path) {
              case "":
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
        defend(oldURL, newURL, next){
            if (needLogin(newURL)) {
              next("/Login")   // 定向重(会重新走一遍守卫!)
              return
            }
            next()             // 放行
        }
    }
  }
}
```

- `next()`：放行到本次目标路由；
- `next(to)` / `next(to, query)`：**定向重**（内部再次调用 `Bus.to`），见 [`initSwitch.js`](bindview-router/src/hash/initSwitch.js:70)。

<span style="color:red">！！！</span> 重定向会**再次触发所有 `Switch` 的守卫**，如果目标路由同样被拦截就会形成**死循环**。请在守卫里先判断目标路径，确保重定向的目标能被放行。

#### 异步组件

`异步组件` 它允许开发者在需要时才加载组件，而不是在应用启动时就立即加载所有组件。这种方式可以避免页面加载时加载全部组件，从而减少页面加载时间，提高应用程序的性能和加载速度。异步组件通过 `import()` 进行导入，它们不会立即被解析和加载，只有在实际需要时才会进行加载。这种延迟加载的特性使得异步组件适用于那些需要按需加载的场景，例如与路由系统配合使用时，可以实现动态加载组件，进一步提升用户体验和响应速度

需要异步导入的 组件 在 `async` 中配置以对象的形式配置属性名是组件名，属性是一个函数返回一个 `import()`

`wait` 是在异步加载组件等待过程中展示的，通过一个函数返回一个组件 (!!! 组件需要在 `components` 中注册,组件需要一个唯一不变的 `UUID` ) 或通过函数返回一段 `虚拟dom` 结构

```jsx
import { createID } from "bindview"
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

异步加载的行为细节（见 [`initSwitch.js`](bindview-router/src/hash/initSwitch.js:32)）：

- `async` 的键名必须与插槽中使用的**标签名完全一致**（即 `async` 里写 `B`，插槽里写 `<B />`）；
- 已经注册过的组件（含全局注册的组件）会直接复用，**不会**再次 `import`；
- 同一个组件的 `import` **只会发起一次**（内部用 `asyncLoading` / `asyncLoaded` 标记），避免 `render → import → $mupdate → render` 形成死循环；
- 加载成功后通过 `$appendComponent` 注册到 `Switch`，再 `$mupdate()` 触发渲染（属于微任务更新，见下文）;
- 加载失败会 `console.error` 并**释放占位**，允许后续重试。

#### 路由表 `CreateRouterTable`

在 `Switch` 中可以使用路由表来代替 `switch` 语句，路由表还提供了一些 API 来进行路由管理。

```jsx
import { CreateRouterTable } from "bindview-router"
import { createID } from "bindview"

import A from "@/Components/A"
import B from "@/Components/B"

export default function App() {
  const [a, b] = createID(2)

  const Router = CreateRouterTable([
    { path: ["/", "/Home"], component: <A id={a} /> }, // 多个路径复用同一个组件
    { path: "/B", component: <B id={b} /> },
    { path: "ErrorPage", component: "404" }           // 未匹配到路由时渲染的兜底组件(键名固定为 ErrorPage)
  ])

  const result = Router.result.bind(Router) // 改变 Router 中 result 的 this 指向

  return {
    name: 'App',
    render() {
      return (
        <div>
          <Link to="/">/</Link>|
          <Link to="/A">A</Link>
          <Switch rank={1} components={{ A, B }}>{result}</Switch>
        </div>
      )
    }
  }
}
```

| 成员 | 说明 |
| --- | --- |
| `result(path)` | 路由匹配：命中返回对应 `component`；**所有路径都不匹配时**返回 `ErrorPage` 对应的组件（即「未匹配到的路由」所渲染的兜底组件） |
| `append(route \| routes)` | 追加一条路由或一张路由表数组 |
| `deletePath(path)` | 删除指定路径的路由 |
| `RouterTable` | 内部的 `Map`（`path → component`） |

追加和删除：

```jsx
Router.append({ path: "/B", component: <div>B</div> })
Router.append([
  { path: "/C", component: <div>C</div> },
  { path: "/D", component: <div>D</div> }
])
Router.deletePath("/B")
```

<span style="color:red">！！！</span> **增删路由不会自动刷新视图**：`Switch` 只在 `data.path` 变化（或父组件联动更新）时才重新渲染，而 `append` / `deletePath` 只改动内部 `Map`。若希望在**当前路由**下立即看到增删效果，需要追加一次手动更新：

```jsx
methods: {
  addRouter() {
    Router.append({ path: "/C", component: <C id={c} /> })
    this.$mupdate() // bindview 的手动更新(微任务中生效)
  },
  delRouter() {
    Router.deletePath("/C")
    this.$mupdate()
  }
}
```

注意事项（见 [`createRouterTable.js`](bindview-router/src/tools/createRouterTable.js:17)）：

- `path` 必须是 `string` 或 `string[]`（数组表示多个路径复用同一个组件）；`component` 必须是 **vnode / number / string**。
- **两类校验的失败后果不同**：
  - `path` / `component` **类型**非法 → `console.error` 后**直接 `return`**，**该条及其之后的所有路由都不会被加入**（之前的条目已写入）；
  - `string[]` 中某个**元素**不是字符串 → 只 `console.error` 并**跳过该元素**（`return` 位于 `forEach` 回调内），同一数组的后续元素与后续条目仍会继续加入。
- **`ErrorPage` 的语义是「未匹配到的路由所渲染的组件」**：`result(path)` 在匹配不到任何路径时，会把 `ErrorPage` 对应的组件作为兜底返回，由 `Switch` 渲染出来。它的键名是**固定字符串 `ErrorPage`**（而**不是** `/ErrorPage`），因此它**不会成为一条可访问的路由**，只作为兜底出口存在。
  - 若未配置该条，`result()` 会 `console.error` 并返回 `undefined`，`Switch` 读取 `undefined` 的 `elementName` 时会**直接抛错**，所以实际项目建议始终配置一个错误页。
- `ErrorPage` 的 `component` 同样支持 vnode / number / string：传字符串（如 `"404"`）或数字时会被当作**文本**渲染；需要复杂页面就传 vnode（如 `<Error id={e} />`，注意 `id` 需唯一稳定）。
- `CreateRouterTable(config)` 的 `config` **必须是数组**；传入 `undefined` 会在读取 `config.length` 时抛 `TypeError`。
- `result` 必须 `bind(Router)`（或用箭头函数包装）后再交给 `Switch`，否则 `this.RouterTable` 丢失会报错。
- 路由表内容是**静态结构**：`component` 里的 vnode 在组件创建时就被闭包捕获（只创建一次），因此不要在路由表中直接引用会变化的响应式数据，需要响应式请在目标组件内部处理。
- 与 `async` 可共存：`Switch` 的异步判定基于插槽 vnode 的 `elementName`（即组件名），路由表返回的组件同样适用。
- 每次构造 / `append` / `deletePath` 都会重新向 DevTools 上报 `router:table` 事件。

### 3. `Link` 组件

| 配置项        | 必要性 | 说明                    |
| ------------- | ------ | ----------------------- |
| `to`          | ✅      | 跳转路径和 `query` 参数 |
| `className`   | ❎      | a 标签类名              |
| `activeName`  | ❎      | 激活时类名默认 `active` |

`Link` 组件是配合 `Switch` 来使用的，组件会创建出一个 `a` 标签并接管点击（内部 `preventDefault` + `Bus.to`）。`to` 支持三种写法：

```jsx
<Link to="/A">/A</Link>
<Link to="/B?title=Test">B(查询串)</Link>
<Link to={{
  to: "/B",
  query: {
    title: "Test"
  }
}}>B(对象)</Link>
```

激活态由 `activeName` 控制（默认 `active`）：激活时输出 `${activeName} ${className}`，未激活时只输出 `className`（都没有类名时输出空字符串）。

<span style="color:red">！！！</span> **`hash` 模式下 `Link` 必须包含子节点**：hash 版实现是 `[slot()]`（见 [`hash/initLink.js`](bindview-router/src/hash/initLink.js:25)），没有子节点时 `slot` 为 `null` 会直接抛错；`history` 版已做空值保护。

```jsx
import { createID } from "bindview"
import A from "./Components/A"
import B from "./Components/B"

export default function App() {
  const [a, b] = createID(2)
  return {
    name: 'App',
    render() {
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

在 `Router` 上有三个属性，四个方法，该属性提供了编程式路由。`Router` 是通过 `vm.proto("Router", newRouter)` 注入的**全局属性**，在所有组件实例上通过 `this.Router` 访问（全局共用一个实例）。

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
      const { Router } = this
      return (
        <div>
          A
          <button onClick={() => Router.$to("/B", {
            title: 'Test'
          })}>Router</button> ... $to
          <button onClick={() => Router.$to({ to: "/B" })}>$to(对象形态)</button>
          <button onClick={() => Router.$back()}>$back</button>
        </div>
      )
    }
  }
}
```

> `$to` 同时兼容对象形态 `$to({ to: '/B', query: { title: 'x' } })`（见 [`hash/Router.js`](bindview-router/src/hash/Router.js:17)）。
>
> `$to` 内部使用 `history.pushState` 且**不会**触发 `hashchange` / `popstate`，因此不会出现「一次跳转派发两次」的问题（见 [`hash/Bus.js`](bindview-router/src/hash/Bus.js:34)）；而 `$go` / `$back` / `$forward` 直接调用 `window.history`，两种模式都可以使用。

## hash 与 history 的差异

| 对比项 | `hash` | `history` |
| --- | --- | --- |
| 地址形态 | `#/A?title=x` | `/A?title=x` |
| 监听事件 | `hashchange` | `popstate` |
| 初始地址来源 | `location.hash` | `location.pathname` + `location.search` |
| `Link` 的 `href` | `#` + 路径 + query | 路径 + query |
| `Link` 子节点 | **必填** | 可省略 |
| 部署要求 | 无需服务端配置 | 需要服务端把任意路径回退到 `index.html` |

使用 `history` 模式时，开发环境需要运行模板提供的 `npm run history` 命令，否则刷新 / 直接访问子路径会 404。

## 与 `bindview` 微任务更新的配合

`bindview` 的视图更新是**微任务批处理**的（同一轮内多次数据写入只执行一次 `render + diff`，`updated` 在微任务中触发）。`Switch` / `Link` 在路由变化时只是写入 `data.path`，真正的重新渲染发生在微任务里。

- 路由跳转后**立即**读 DOM 仍是旧内容；需要等待更新完成请用 `await this.$nextTick()`（或测试中用 `$flush()`）。
- 一次 `Bus.emit` 会**同步**遍历所有监听者（各个 `Switch` / `Link`），它们写入的 `data.path` 会在**同一个微任务批次**里统一渲染，因此不会出现「部分组件已切换、部分还没切换」的中间态布局抖动。
- `Router.oldURL` / `newURL` / `query` 在派发监听者**之前**就已赋值（见 [`hash/Bus.js`](bindview-router/src/hash/Bus.js:16)），因此在 `defend` 或路由回调中同步读取是可靠且最新的。
- 异步组件加载完成后的 `$mupdate()` 同样是异步生效的；若加载完成即读 DOM，需要 `$nextTick`。

## 工具函数

除了 `hash` / `history` 两个路由模式插件，库还导出了以下工具与调试能力（见 [`index.js`](bindview-router/src/index.js)）：

| 导出 | 说明 |
| --- | --- |
| `hash` / `history` | 两种路由模式插件 |
| `CreateRouterTable` | 创建路由表 |
| `utfToString(input)` | 将百分号编码（UTF-8）安全解码为字符串，解码失败时原样返回 |
| `routerDevtools` | DevTools 集成对象（含 Hook 名等常量） |
| `getDevtoolsHook()` | 获取调试插件全局 Hook，未安装返回 `null` |
| `isDevtoolsEnabled()` | 调试插件是否已安装 |
| `emitRouterDevtools(event, payload)` | 向调试插件派发事件 |
| `registerRouteTable(table)` | 注册 / 更新一张路由表 |

### Query 参数的处理规则

- **解析**：[`urlSearchParse()`](bindview-router/src/tools/urlSearchParse.js:6) 基于 `URLSearchParams`，因此 `Router.query` 中的值**全部是字符串**（`?id=1` → `query.id === "1"`）。
- **序列化**：[`objtoquery()`](bindview-router/src/tools/objtoquery.js:6) 只保留 `string` / `number` / `boolean`，**`null` / `undefined` / 数组 / 对象会被静默忽略**（不报错、也不出现在 URL 上）；键与值都会做 `encodeURIComponent`。
- **路径标准化**：[`separateQuery()`](bindview-router/src/tools/separateQuery.js:5) 会去掉 `#` 前缀、查询串与**末尾斜杠**，并把空路径归一为 `/`，因此 `#/A/` 与 `#/A` 视为同一路由。

### DevTools

路由插件会把运行信息抛给全局 Hook `window.__BINDVIEW_DEVTOOLS_GLOBAL_HOOK__`（由浏览器调试插件注入）。未安装调试插件时**全部为空操作**，对业务零影响、零异常：

| 事件 | 触发时机 | 负载 |
| --- | --- | --- |
| `router:init` | 插件安装 | `{ mode, version, oldURL, newURL, query }` |
| `router:navigate` | 每次路由跳转 | `{ oldURL, newURL, query, timestamp }` |
| `router:table` | 路由表创建 / 变更 | `{ tables: [{ paths, size, entries }] }` |

同时会把 `Router` 实例与路由表挂到 Hook 上（`hook.router` / `hook.routeTables`），方便调试器直接读取与控制路由。若调试器**晚于**路由插件加载，会通过 `__BINDVIEW_DEVTOOLS_HOOK_REPLAY__` 重放 `router:init` / `router:table`。

## 注意事项与常见陷阱

1. **插件只能安装一次**：重复 `use` 会被静默忽略，`hash` 与 `history` 不能共存。
2. **`Switch` 首帧 `path` 为空字符串**：会被当作 `default` 处理，建议合并 `case ""` 与 `case "/"`，或让 `default` 返回空 / 骨架屏。
3. **`Switch` 必须使用函数插槽**，普通插槽拿不到 `path`，永远渲染同一份内容。
4. **`rank` 必填**，且要与路径层级对应；`rank` 过大会命中更短的路径而不报错。
5. **动态组件必须有唯一且稳定的 `id`**：用 `createID()` 生成，不要使用会变化的值，否则会出现组件复用 / 卸载异常。
6. **守卫必须调用 `next`**：否则路由被永久挂起；`next(to)` 重定向会再次经过守卫，注意避免死循环。
7. **`Link` 的激活类名属性是 `activeName`**（默认 `active`），不是 `activeClass`。
8. **`hash` 模式的 `Link` 必须写子节点**，否则运行期会抛错。
9. **`ErrorPage` 是「未匹配到的路由」所渲染的兜底组件**：键名固定为字符串 `ErrorPage`（不是 `/ErrorPage`），因此不会成为可访问路由；未配置时 `result()` 返回 `undefined`，`Switch` 读取其 `elementName` 会**直接抛错**，建议始终配置。
10. **路由表的三个坑**：① `path` / `component` **类型**非法会中断**该条及之后**的所有条目；② `string[]` 中非法**元素**只跳过该元素，不影响后续；③ `append` / `deletePath` **不会自动刷新视图**，在当前路由下需配合 `this.$mupdate()`。
11. **`Switch` 里使用的组件需要注册**（写在 `components` 里或全局注册）；`async` 的键名必须与标签名一致。
12. **`Router.query` 的值都是字符串**：需要数字 / 布尔时请自行转换。
13. **`query` 只支持基本类型**：数组 / 对象会被静默忽略，需要传递数组请自行 `JSON.stringify` 或逗号拼接。
14. **不要手动改 URL 与 `$to` 混用**：直接改 `location.hash` 会触发 `hashchange` 而被派发一次；`Router.$to` / `Link` 走 `pushState`，两者叠加会造成多余的跳转记录。
15. **`Switch` / `Link` 卸载时会自动 `Bus.off`**，无需手动注销；但不要在组件外部长期持有它们注册的回调。

## 附录：本次更新要点（v1.2.0）

- **新增路由表**：导出 `CreateRouterTable`，提供 `result` / `append` / `deletePath` / `RouterTable`；通过 `ErrorPage` 配置「未匹配到的路由」所渲染的兜底组件。
- **新增 DevTools 集成**：新增 `router:init` / `router:navigate` / `router:table` 事件与 `getDevtoolsHook` / `isDevtoolsEnabled` / `emitRouterDevtools` / `registerRouteTable` 导出；未安装调试插件时全部短路，对业务零影响。
- **异步组件加载加固**：新增 `asyncLoading` / `asyncLoaded` 标记，同一组件只 `import()` 一次，避免「render → import → `$mupdate` → render」形成死循环；加载失败时释放占位以允许重试。
- **跳转不再双重派发**：`Bus.to` 统一改用 `history.pushState`，不再触发 `hashchange` / `popstate`。
- **`$to` 支持对象形态**：`$to({ to, query })`。
- **工具增强**：`separateQuery` 现在会去掉 `#` 前缀、查询串与末尾斜杠，并把空路径归一为 `/`；`objtoquery` 只序列化基本类型并跳过 `null` / `undefined`；新增 `utfToString` 安全解码。
- **文档修正**：`Link` 的激活类名属性为 `activeName`（原文档误写为 `activeClass`）。
- **匹配 `bindview` 微任务更新**：路由变化写入 `data.path` 后由调度器合并渲染，跳转后读取 DOM 需要 `$nextTick`。
