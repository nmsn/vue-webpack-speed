# Vue2 Webpack 打包测试项目

这是一个用于测试 webpack 打包效果的 Vue2 项目，包含了多个功能模块和依赖库。

## 项目特性

- **Vue 2.6.14** - 使用 Vue2 最新版本
- **Element UI** - 完整的 UI 组件库
- **Vue Router** - 动态路由配置
- **Lodash** - 实用工具库
- **Fabric.js** - Canvas 绘图库
- **Webpack Bundle Analyzer** - 打包分析工具

## 项目结构

```
src/
├── main.js          # 应用入口文件
├── App.vue          # 根组件
├── router/          # 路由配置
│   └── index.js
└── views/           # 页面组件
    ├── Login.vue    # 登录页面
    ├── Products.vue # 产品列表页面
    └── Canvas.vue   # Canvas 画板页面
```

## 功能模块

### 1. 登录模块 (`/login`)
- 用户名密码验证
- 表单验证
- 使用 Lodash 防抖功能
- Element UI 组件

### 2. 产品列表模块 (`/products`)
- 数据表格展示
- 搜索和筛选功能
- 分页功能
- 使用 Lodash 工具函数生成模拟数据

### 3. Canvas 画板模块 (`/canvas`)
- 基于 Fabric.js 的绘图功能
- 支持自由绘制、添加图形和文字
- 画布保存和加载功能
- 丰富的工具栏

## 安装和运行

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run serve
```

### 生产构建
```bash
npm run build
```

### 打包分析
```bash
npm run analyze
```

## Webpack 打包分析

项目配置了 webpack-bundle-analyzer 来分析打包结果：

1. **开发环境分析**：运行 `npm run serve` 后访问应用
2. **生产环境分析**：运行 `npm run analyze` 生成分析报告
3. **手动分析**：设置环境变量 `ANALYZE=true` 后构建

## 依赖说明

### 生产依赖
- `vue`: Vue.js 核心库
- `vue-router`: Vue 路由管理
- `element-ui`: UI 组件库
- `lodash`: JavaScript 实用工具库
- `fabric`: Canvas 操作库

### 开发依赖
- `@vue/cli-service`: Vue CLI 服务
- `webpack-bundle-analyzer`: 打包分析工具
- `babel` 相关: JavaScript 编译工具
- `eslint` 相关: 代码检查工具

## 测试场景

这个项目适合测试以下 webpack 打包场景：

1. **代码分割**：不同路由的懒加载效果
2. **依赖分析**：第三方库的打包大小
3. **Tree Shaking**：未使用代码的清除效果
4. **资源优化**：图片、字体等静态资源处理
5. **缓存策略**：文件名 hash 和缓存效果

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 开发说明

- 项目使用 Vue2 + Vue CLI 5
- 代码风格遵循 ESLint 规范
- 支持 ES6+ 语法
- 使用 Babel 进行代码转换