const { defineConfig } = require("@vue/cli-service");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

const cacheConfig = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  outputDir: "dist-cache",
  configureWebpack: (config) => {
    // 开启文件系统缓存
    config.cache = {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      },
    };

    // 添加 SpeedMeasurePlugin 测量各阶段耗时
    config.plugins.push(
      new SpeedMeasurePlugin({
        exclude: ["MiniCssExtractPlugin"],
      })
    );

    // 添加分析插件
    if (process.env.ANALYZE === "true") {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          openAnalyzer: true,
          reportFilename: "../reports/cache-bundle-report.html",
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

module.exports = cacheConfig;
