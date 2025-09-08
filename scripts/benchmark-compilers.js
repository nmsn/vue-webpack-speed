#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 编译器性能基准测试\n");

const configs = [
  {
    name: "Performance (Babel)",
    command: "npm run build:performance",
    dir: "dist-performance",
  },
  { name: "SWC", command: "npm run build:swc", dir: "dist-swc" },
  { name: "ESBuild", command: "npm run build:esbuild", dir: "dist-esbuild" },
];

const results = [];

for (const config of configs) {
  console.log(`📦 测试 ${config.name}...`);

  // 清理输出目录
  try {
    execSync(`rm -rf ${config.dir}`, { stdio: "ignore" });
  } catch (e) {}

  // 记录开始时间
  const startTime = Date.now();

  try {
    // 执行构建
    execSync(config.command, { stdio: "pipe" });

    // 记录结束时间
    const endTime = Date.now();
    const buildTime = (endTime - startTime) / 1000;

    // 获取构建大小
    const sizeOutput = execSync(`du -sh ${config.dir}`, { encoding: "utf8" });
    const size = sizeOutput.split("\t")[0];

    results.push({
      name: config.name,
      buildTime: buildTime.toFixed(2),
      size: size.trim(),
    });

    console.log(
      `✅ ${config.name}: ${buildTime.toFixed(2)}s, ${size.trim()}\n`
    );
  } catch (error) {
    console.log(`❌ ${config.name}: 构建失败\n`);
    results.push({
      name: config.name,
      buildTime: "Failed",
      size: "N/A",
    });
  }
}

// 输出结果表格
console.log("📊 构建性能对比结果:");
console.log("┌─────────────────────┬─────────────┬─────────────┐");
console.log("│ 编译器              │ 构建时间    │ 输出大小    │");
console.log("├─────────────────────┼─────────────┼─────────────┤");

results.forEach((result) => {
  const name = result.name.padEnd(19);
  const time = result.buildTime.padEnd(11);
  const size = result.size.padEnd(11);
  console.log(`│ ${name} │ ${time} │ ${size} │`);
});

console.log("└─────────────────────┴─────────────┴─────────────┘");

// 计算性能提升
if (results.length >= 2 && results[0].buildTime !== "Failed") {
  const babelTime = parseFloat(results[0].buildTime);

  results.slice(1).forEach((result) => {
    if (result.buildTime !== "Failed") {
      const currentTime = parseFloat(result.buildTime);
      const improvement = (
        ((babelTime - currentTime) / babelTime) *
        100
      ).toFixed(1);
      console.log(`\n⚡ ${result.name} 相比 Babel 提升: ${improvement}%`);
    }
  });
}

console.log("\n🎯 基准测试完成！");
