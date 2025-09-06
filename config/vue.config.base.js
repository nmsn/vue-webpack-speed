const { defineConfig } = require("@vue/cli-service");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

const baseConfig = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  outputDir: "dist",
  configureWebpack: (config) => {
    // 添加分析插件
    if (process.env.ANALYZE === "true") {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          openAnalyzer: true,
          reportFilename: "../reports/base-bundle-report.html",
        })
      );
    }

    // 优化配置
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    };
  },
  chainWebpack: (config) => {
    // 基础配置
    config.optimization.minimize(true);
  },
});

// 导出配置 - SpeedMeasurePlugin 与 Vue CLI 有兼容性问题，暂时禁用
module.exports = baseConfig;
