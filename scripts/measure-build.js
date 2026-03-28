// 独立测试脚本 - 直接用 webpack 测量各阶段耗时
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

const config = require("../config/vue.config.thread.js");

const wrappedConfig = smp.wrap(config);

// 模拟 webpack 编译
const webpack = require("webpack");
webpack(wrappedConfig, (err, stats) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stats.toString({
    colors: true,
    modules: false,
    children: false,
  }));
});
