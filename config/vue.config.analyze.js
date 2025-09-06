const { defineConfig } = require("@vue/cli-service");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: true,
  outputDir: "dist-analyze",
  configureWebpack: smp.wrap({
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
        reportFilename: "../reports/bundle-report.html",
        statsFilename: "../reports/bundle-stats.json",
        generateStatsFile: true,
      }),
    ],
    optimization: {
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: -10,
            chunks: "all",
          },
          elementUI: {
            name: "element-ui",
            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
            chunks: "all",
            priority: 20,
          },
          lodash: {
            name: "lodash",
            test: /[\\/]node_modules[\\/]lodash[\\/]/,
            chunks: "all",
            priority: 20,
          },
          fabric: {
            name: "fabric",
            test: /[\\/]node_modules[\\/]fabric[\\/]/,
            chunks: "all",
            priority: 20,
          },
        },
      },
    },
  }),
  chainWebpack: (config) => {
    // 详细的构建信息
    config.stats({
      colors: true,
      modules: true,
      chunks: true,
      chunkModules: true,
      chunkOrigins: true,
      assets: true,
      assetsSort: "size",
      modulesSort: "size",
      chunksSort: "size",
    });
  },
});
