const { defineConfig } = require("@vue/cli-service");
const CompressionPlugin = require("compression-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

const swcConfig = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  outputDir: "dist-swc",
  configureWebpack: (config) => {
    // 添加插件
    config.plugins.push(
      new CompressionPlugin({
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      })
    );

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
          reportFilename: "../reports/swc-bundle-report.html",
        })
      );
    }

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
            test: /[\\\/]node_modules[\\\/]/,
            name: "vendors",
            priority: -10,
            chunks: "all",
          },
          elementUI: {
            name: "element-ui",
            test: /[\\\/]node_modules[\\\/]element-ui[\\\/]/,
            chunks: "all",
            priority: 20,
          },
          lodash: {
            name: "lodash",
            test: /[\\\/]node_modules[\\\/]lodash[\\\/]/,
            chunks: "all",
            priority: 20,
          },
          fabric: {
            name: "fabric",
            test: /[\\\/]node_modules[\\\/]fabric[\\\/]/,
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
    // 使用 SWC 替换 Babel
    config.module
      .rule("js")
      .test(/\.m?jsx?$/)
      .exclude.add(/node_modules/)
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

    // 优化 Terser - 安全检查
    if (config.optimization.minimizers.has("terser")) {
      config.optimization.minimizer("terser").tap((args) => {
        args[0].terserOptions.compress.drop_console = true;
        args[0].terserOptions.compress.drop_debugger = true;
        args[0].terserOptions.compress.pure_funcs = ["console.log"];
        return args;
      });
    }
  },
});

// 导出配置
module.exports = swcConfig;
