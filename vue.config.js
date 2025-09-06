const { defineConfig } = require("@vue/cli-service");
const path = require("path");

// 根据环境变量选择配置文件
const getConfig = () => {
  const mode = process.env.VUE_APP_MODE || "base";

  try {
    const configPath = path.resolve(__dirname, `config/vue.config.${mode}.js`);
    const config = require(configPath);
    console.log(`🚀 Using webpack config: ${mode}`);
    return config;
  } catch (error) {
    console.warn(
      `⚠️  Config file for mode '${mode}' not found, using base config`
    );
    const baseConfig = require("./config/vue.config.base.js");
    return baseConfig;
  }
};

module.exports = getConfig();
