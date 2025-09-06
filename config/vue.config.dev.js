const { defineConfig } = require("@vue/cli-service");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

const devConfig = defineConfig({
  transpileDependencies: true,
  productionSourceMap: true,
  outputDir: "dist-development",
  configureWebpack: (config) => {
    config.devtool = "source-map";

    // 添加分析插件
    if (process.env.ANALYZE === "true") {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          openAnalyzer: true,
          reportFilename: "../reports/dev-bundle-report.html",
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
    // 保持可读性，不进行过度压缩
    config.optimization.minimizer("terser").tap((args) => {
      args[0].terserOptions.compress.drop_console = false;
      args[0].terserOptions.compress.drop_debugger = false;
      args[0].terserOptions.mangle = false;
      args[0].terserOptions.output = {
        ...args[0].terserOptions.output,
        beautify: true,
        comments: true,
      };
      return args;
    });

    // 保留 CSS 注释
    config.optimization.minimizer("css").tap((args) => {
      args[0].options.cssProcessorOptions = {
        ...args[0].options.cssProcessorOptions,
        discardComments: { removeAll: false },
      };
      return args;
    });
  },
  css: {
    sourceMap: true,
  },
});

// 导出配置 - SpeedMeasurePlugin 与 Vue CLI 有兼容性问题，暂时禁用
module.exports = devConfig;
