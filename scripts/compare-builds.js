const fs = require("fs");
const path = require("path");

// 获取文件大小（字节）
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// 格式化文件大小
function formatSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 获取目录下所有文件的总大小
function getDirSize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;

  let totalSize = 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      totalSize += getDirSize(filePath);
    } else {
      totalSize += getFileSize(filePath);
    }
  }

  return totalSize;
}

// 分析构建结果
function analyzeBuild(buildName, distPath) {
  if (!fs.existsSync(distPath)) {
    return {
      name: buildName,
      exists: false,
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      files: {},
    };
  }

  const jsDir = path.join(distPath, "js");
  const cssDir = path.join(distPath, "css");

  const result = {
    name: buildName,
    exists: true,
    totalSize: getDirSize(distPath),
    jsSize: getDirSize(jsDir),
    cssSize: getDirSize(cssDir),
    files: {},
  };

  // 分析 JS 文件
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir);
    jsFiles.forEach((file) => {
      if (file.endsWith(".js")) {
        result.files[file] = getFileSize(path.join(jsDir, file));
      }
    });
  }

  return result;
}

// 主函数
function compareBuilds() {
  console.log("🔍 分析构建结果...\n");

  const builds = [
    { name: "Base", path: "dist" },
    { name: "Performance", path: "dist-performance" },
    { name: "Size Optimized", path: "dist-size" },
    { name: "Development", path: "dist-development" },
    { name: "Analyze", path: "dist-analyze" },
  ];

  const results = builds.map((build) => analyzeBuild(build.name, build.path));

  // 生成对比报告
  console.log("📊 构建结果对比:\n");
  console.log(
    "┌─────────────────┬──────────────┬──────────────┬──────────────┐"
  );
  console.log(
    "│ 构建模式        │ 总大小       │ JS 大小      │ CSS 大小     │"
  );
  console.log(
    "├─────────────────┼──────────────┼──────────────┼──────────────┤"
  );

  results.forEach((result) => {
    if (result.exists) {
      const name = result.name.padEnd(15);
      const total = formatSize(result.totalSize).padStart(12);
      const js = formatSize(result.jsSize).padStart(12);
      const css = formatSize(result.cssSize).padStart(12);
      console.log(`│ ${name} │ ${total} │ ${js} │ ${css} │`);
    } else {
      const name = result.name.padEnd(15);
      console.log(`│ ${name} │ 未构建       │ 未构建       │ 未构建       │`);
    }
  });

  console.log(
    "└─────────────────┴──────────────┴──────────────┴──────────────┘\n"
  );

  // 找出最小的构建
  const validResults = results.filter((r) => r.exists);
  if (validResults.length > 0) {
    const smallest = validResults.reduce((min, current) =>
      current.totalSize < min.totalSize ? current : min
    );
    console.log(
      `🏆 最小构建: ${smallest.name} (${formatSize(smallest.totalSize)})\n`
    );
  }

  // 生成详细报告文件
  const reportPath = "reports/build-comparison.json";
  if (!fs.existsSync("reports")) {
    fs.mkdirSync("reports", { recursive: true });
  }

  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        results: results,
      },
      null,
      2
    )
  );

  console.log(`📄 详细报告已保存到: ${reportPath}`);
}

// 运行对比
compareBuilds();
