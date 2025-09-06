const { defineConfig } = require("@vue/cli-service");
const CompressionPlugin = require("compression-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

const sizeConfig = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  outputDir: "dist-size",
  configureWebpack: (config) => {
    // 外部化大型依赖
    config.externals = {
      vue: "Vue",
      "vue-router": "VueRouter",
      "element-ui": "ELEMENT",
      lodash: "_",
    };

    // 添加压缩插件
    config.plugins.push(
      new CompressionPlugin({
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 1024,
        minRatio: 0.8,
      }),
      new CompressionPlugin({
        algorithm: "brotliCompress",
        test: /\.(js|css|html|svg)$/,
        threshold: 1024,
        minRatio: 0.8,
        filename: "[path][base].br",
      })
    );

    // 添加分析插件
    if (process.env.ANALYZE === "true") {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          openAnalyzer: true,
          reportFilename: "../reports/size-bundle-report.html",
        })
      );
    }

    // 优化配置
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        minSize: 10000,
        maxSize: 200000,
        cacheGroups: {
          default: false,
          vendors: false,
          // 只保留必要的 chunk
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            enforce: true,
          },
        },
      },
      usedExports: true,
      sideEffects: false,
    };
  },
  chainWebpack: (config) => {
    // 最大化压缩 - 安全检查
    if (config.optimization.minimizers.has("terser")) {
      config.optimization.minimizer("terser").tap((args) => {
        const terserOptions = args[0].terserOptions;
        terserOptions.compress = {
          ...terserOptions.compress,
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.info", "console.warn"],
          passes: 2,
          unsafe: true,
          unsafe_comps: true,
          unsafe_math: true,
          unsafe_proto: true,
        };
        terserOptions.mangle = {
          ...terserOptions.mangle,
          safari10: true,
        };
        terserOptions.output = {
          ...terserOptions.output,
          comments: false,
        };
        return args;
      });
    }

    // 移除注释和空白 - 安全检查
    if (config.optimization.minimizers.has("css")) {
      config.optimization.minimizer("css").tap((args) => {
        if (args[0] && args[0].options) {
          args[0].options.cssProcessorOptions = {
            ...args[0].options.cssProcessorOptions,
            discardComments: { removeAll: true },
          };
        }
        return args;
      });
    }

    // Tree shaking 优化
    config.optimization.usedExports(true);
    config.optimization.sideEffects(false);
  },
});

// 导出配置 - SpeedMeasurePlugin 与 Vue CLI 有兼容性问题，暂时禁用
module.exports = sizeConfig;
