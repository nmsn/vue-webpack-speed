# Vue Webpack 多配置打包方案使用指南

## 📋 概述

本项目提供了 5 种不同的 webpack 打包配置，用于测试和对比不同优化策略的效果：

1. **Base（基础配置）** - 标准的 Vue CLI 配置，用作基准对比
2. **Performance（性能优化）** - 针对运行时性能优化的配置
3. **Size（体积优化）** - 针对打包体积最小化的配置
4. **Development（开发模式）** - 保留调试信息的开发友好配置
5. **Analyze（分析模式）** - 集成分析工具的配置

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 单独构建
```bash
# 基础配置构建
npm run build:base

# 性能优化构建
npm run build:performance

# 体积优化构建
npm run build:size

# 开发模式构建
npm run build:dev

# 分析模式构建
npm run build:analyze
```

### 批量构建和对比
```bash
# 构建所有配置
npm run build:all

# 对比构建结果
npm run compare

# 清理构建文件
npm run clean
```

## 📊 配置详解

### 1. Base 配置 (`config/vue.config.base.js`)
**目标**: 提供标准的基准配置
**输出目录**: `dist/`

**特性**:
- 标准的代码分割
- 基础的 vendor chunk 分离
- 标准压缩设置

**适用场景**: 作为其他配置的对比基准

### 2. Performance 配置 (`config/vue.config.performance.js`)
**目标**: 优化运行时性能和加载速度
**输出目录**: `dist-performance/`

**特性**:
- 智能代码分割（按库分离 Element UI、Lodash、Fabric.js）
- Gzip 压缩
- 预加载和预获取优化
- Runtime chunk 分离
- 移除 console 和 debugger

**适用场景**: 生产环境，注重用户体验和加载速度

### 3. Size 配置 (`config/vue.config.size.js`)
**目标**: 最小化打包体积
**输出目录**: `dist-size/`

**特性**:
- 外部化大型依赖（使用 CDN）
- 多种压缩格式（Gzip + Brotli）
- 最大化 Terser 压缩
- Tree Shaking 优化
- 移除所有注释和调试信息

**适用场景**: 带宽受限环境，需要最小打包体积

**注意**: 需要在 HTML 中引入 CDN 资源

### 4. Development 配置 (`config/vue.config.dev.js`)
**目标**: 保持开发友好性
**输出目录**: `dist-development/`

**特性**:
- 保留 Source Map
- 保留 console 和调试信息
- 美化输出代码
- 保留注释
- 不进行过度压缩

**适用场景**: 开发环境调试，生产环境问题排查

### 5. Analyze 配置 (`config/vue.config.analyze.js`)
**目标**: 详细分析打包结果
**输出目录**: `dist-analyze/`

**特性**:
- 集成 Bundle Analyzer
- 构建速度分析
- 详细的构建统计
- 生成分析报告

**适用场景**: 性能分析，依赖优化决策

## 📈 构建结果对比

运行 `npm run compare` 后，会生成详细的对比报告：

```
📊 构建结果对比:

┌─────────────────┬──────────────┬──────────────┬──────────────┐
│ 构建模式        │ 总大小       │ JS 大小      │ CSS 大小     │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ Base            │    1.2 MB    │    980 KB    │    220 KB    │
│ Performance     │    1.1 MB    │    890 KB    │    210 KB    │
│ Size Optimized  │    450 KB    │    320 KB    │    130 KB    │
│ Development     │    1.8 MB    │   1.4 MB     │    400 KB    │
│ Analyze         │    1.1 MB    │    900 KB    │    200 KB    │
└─────────────────┴──────────────┴──────────────┴──────────────┘

🏆 最小构建: Size Optimized (450 KB)
```

## 🔧 自定义配置

### 添加新的配置模式

1. 在 `config/` 目录下创建新的配置文件：
```javascript
// config/vue.config.custom.js
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: "dist-custom",
  // 你的自定义配置
});
```

2. 创建对应的环境文件：
```bash
# .env.custom
NODE_ENV=production
VUE_APP_MODE=custom
VUE_APP_TITLE=Custom Build Mode
```

3. 在 `package.json` 中添加构建脚本：
```json
{
  "scripts": {
    "build:custom": "vue-cli-service build --mode custom"
  }
}
```

### 修改现有配置

直接编辑 `config/` 目录下的对应配置文件即可。

## 📁 目录结构

```
vue-webpack-speed/
├── config/                    # Webpack 配置文件
│   ├── vue.config.base.js
│   ├── vue.config.performance.js
│   ├── vue.config.size.js
│   ├── vue.config.dev.js
│   └── vue.config.analyze.js
├── scripts/                   # 构建脚本
│   └── compare-builds.js
├── reports/                   # 分析报告（构建后生成）
├── dist/                      # 基础配置构建输出
├── dist-performance/          # 性能优化构建输出
├── dist-size/                 # 体积优化构建输出
├── dist-development/          # 开发模式构建输出
├── dist-analyze/              # 分析模式构建输出
├── .env.performance           # 性能模式环境变量
├── .env.size                  # 体积模式环境变量
├── .env.analyze               # 分析模式环境变量
└── vue.config.js              # 主配置文件（动态加载）
```

## 🎯 使用建议

### 开发阶段
- 使用 `npm run serve` 进行开发
- 使用 `npm run build:dev` 构建调试版本

### 性能测试
- 使用 `npm run build:all` 构建所有版本
- 使用 `npm run compare` 对比结果
- 使用 `npm run build:analyze` 进行详细分析

### 生产部署
- 一般情况使用 `npm run build:performance`
- 带宽受限使用 `npm run build:size`（需配置 CDN）
- 需要调试使用 `npm run build:dev`

## 🔍 分析工具

### Bundle Analyzer
运行 `npm run build:analyze` 后，在 `reports/` 目录下会生成：
- `bundle-report.html` - 可视化分析报告
- `bundle-stats.json` - 详细统计数据

### 构建对比
运行 `npm run compare` 会生成：
- 控制台输出的对比表格
- `reports/build-comparison.json` - 详细对比数据

## ⚡ 性能优化建议

1. **代码分割**: 合理使用动态 import 和路由懒加载
2. **依赖优化**: 考虑使用 CDN 外部化大型依赖
3. **压缩策略**: 根据服务器支持选择 Gzip 或 Brotli
4. **缓存策略**: 利用 chunk 分离实现更好的缓存效果
5. **Tree Shaking**: 确保只导入需要的模块

## 🐛 常见问题

### Q: Size 配置构建后页面空白？
A: Size 配置使用了 CDN 外部化，需要确保 CDN 资源可访问，或在 HTML 中手动引入相关库。

### Q: 如何查看详细的构建分析？
A: 运行 `npm run build:analyze`，然后打开 `reports/bundle-report.html`。

### Q: 构建速度太慢怎么办？
A: 可以关闭 source map，减少压缩级别，或使用并行构建。

### Q: 如何添加新的优化策略？
A: 在对应的配置文件中修改 `configureWebpack` 或 `chainWebpack` 部分。

## 📚 相关资源

- [Vue CLI 配置参考](https://cli.vuejs.org/config/)
- [Webpack 配置文档](https://webpack.js.org/configuration/)
- [Bundle Analyzer 使用指南](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [性能优化最佳实践](https://web.dev/performance/)

---

通过这套多配置方案，您可以深入了解不同 webpack 优化策略的效果，为项目选择最适合的构建配置。