const { defineConfig } = require("@vue/cli-service");
const CompressionPlugin = require("compression-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ThreadLoader = require("thread-loader");

// thread-loader 配置
const threadLoaderOptions = {
  workers: require("os").cpus().length - 1,
  poolTimeout: Infinity,
};

const threadConfig = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  outputDir: "dist-thread",
  configureWebpack: (config) => {
    // 开启文件系统缓存
    config.cache = {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      },
    };

    // 添加插件
    config.plugins.push(
      new CompressionPlugin({
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      })
    );

    // 添加分析插件
    if (process.env.ANALYZE === "true") {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          openAnalyzer: true,
          reportFilename: "../reports/thread-bundle-report.html",
        })
      );
    }

    // 添加 SpeedMeasurePlugin 测量各阶段耗时
    config.plugins.push(
      new SpeedMeasurePlugin({
        exclude: ["MiniCssExtractPlugin"],
      })
    );

    // 替换 minimizer 为支持并行的版本
    config.optimization.minimizer = [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ["console.log"],
          },
        },
      }),
      new CssMinimizerPlugin({
        parallel: true,
      }),
    ];

    // 优化配置
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        minSize: 20000,
        maxSize: 244000,
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
      runtimeChunk: {
        name: "runtime",
      },
    };
  },
  chainWebpack: (config) => {
    // 配置 thread-loader + swc-loader
    config.module
      .rule("js")
      .test(/\.m?jsx?$/)
      .exclude.add(/node_modules/)
      .end()
      .use("thread-loader")
      .loader("thread-loader")
      .options(threadLoaderOptions)
      .end()
      .use("swc-loader")
      .loader("swc-loader")
      .options({
        jsc: {
          parser: {
            syntax: "ecmascript",
            jsx: true,
            dynamicImport: true,
            decorators: false,
          },
          transform: {
            react: {
              pragma: "h",
              pragmaFrag: "Fragment",
              throwIfNamespace: false,
              development: false,
              useBuiltins: false,
            },
          },
          target: "es2015",
          loose: false,
          externalHelpers: false,
        },
        module: {
          type: "es6",
        },
        minify: process.env.NODE_ENV === "production",
        sourceMaps: false,
      });

    // 移除默认的 babel-loader
    config.module.rule("js").uses.delete("babel-loader");

    // 预加载和预获取 - 安全检查插件是否存在
    if (config.plugins.has("preload")) {
      config.plugin("preload").tap((options) => {
        options[0] = {
          rel: "preload",
          include: "initial",
          fileBlacklist: [/\.map$/, /hot-update\.js$/],
        };
        return options;
      });
    }

    if (config.plugins.has("prefetch")) {
      config.plugin("prefetch").tap((options) => {
        options[0].fileBlacklist = options[0].fileBlacklist || [];
        options[0].fileBlacklist.push(/runtime\..*\.js$/);
        return options;
      });
    }
  },
});

module.exports = threadConfig;
