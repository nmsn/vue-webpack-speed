const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
  configureWebpack: {
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: "server",
        openAnalyzer: true,
        analyzerHost: "localhost",
        analyzerPort: 8888,
      }),
    ],
  },
};
