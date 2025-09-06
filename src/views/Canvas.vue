<template>
  <div class="canvas-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>Canvas 画板</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="clearCanvas"
          >清空画板</el-button
        >
      </div>

      <div class="toolbar">
        <el-row :gutter="10">
          <el-col :span="4">
            <el-button-group>
              <el-button
                :type="drawingMode === 'select' ? 'primary' : ''"
                @click="setMode('select')"
                >选择</el-button
              >
              <el-button
                :type="drawingMode === 'draw' ? 'primary' : ''"
                @click="setMode('draw')"
                >绘制</el-button
              >
            </el-button-group>
          </el-col>
          <el-col :span="3">
            <el-color-picker
              v-model="brushColor"
              @change="setBrushColor"
            ></el-color-picker>
          </el-col>
          <el-col :span="4">
            <el-slider
              v-model="brushWidth"
              :min="1"
              :max="50"
              @change="setBrushWidth"
              show-input
              :show-input-controls="false"
              input-size="mini"
            ></el-slider>
          </el-col>
          <el-col :span="6">
            <el-button-group>
              <el-button @click="addRect">矩形</el-button>
              <el-button @click="addCircle">圆形</el-button>
              <el-button @click="addText">文字</el-button>
            </el-button-group>
          </el-col>
          <el-col :span="4">
            <el-button-group>
              <el-button @click="saveCanvas">保存</el-button>
              <el-button @click="loadCanvas">加载</el-button>
            </el-button-group>
          </el-col>
        </el-row>
      </div>

      <div class="canvas-wrapper">
        <canvas id="fabricCanvas" width="800" height="600"></canvas>
      </div>

      <div class="canvas-info">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-statistic
              title="画布对象数量"
              :value="objectCount"
            ></el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic
              title="画布尺寸"
              :value="`${canvasWidth} x ${canvasHeight}`"
            ></el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic
              title="当前模式"
              :value="drawingMode === 'draw' ? '绘制模式' : '选择模式'"
            ></el-statistic>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
import { fabric } from "fabric";
import _ from "lodash";

export default {
  name: "Canvas",
  data() {
    return {
      canvas: null,
      drawingMode: "select",
      brushColor: "#000000",
      brushWidth: 5,
      objectCount: 0,
      canvasWidth: 800,
      canvasHeight: 600,
    };
  },
  mounted() {
    this.initCanvas();
  },
  beforeDestroy() {
    if (this.canvas) {
      this.canvas.dispose();
    }
  },
  methods: {
    initCanvas() {
      this.canvas = new fabric.Canvas("fabricCanvas", {
        width: this.canvasWidth,
        height: this.canvasHeight,
        backgroundColor: "#ffffff",
      });

      // 设置画笔属性
      this.canvas.freeDrawingBrush.color = this.brushColor;
      this.canvas.freeDrawingBrush.width = this.brushWidth;

      // 监听画布事件
      this.canvas.on("object:added", () => {
        this.updateObjectCount();
      });

      this.canvas.on("object:removed", () => {
        this.updateObjectCount();
      });

      this.canvas.on("selection:created", (e) => {
        console.log("选中对象:", e.selected);
      });

      // 初始化对象计数
      this.updateObjectCount();
    },
    setMode(mode) {
      this.drawingMode = mode;
      this.canvas.isDrawingMode = mode === "draw";

      if (mode === "select") {
        this.canvas.selection = true;
        this.canvas.forEachObject((obj) => {
          obj.selectable = true;
        });
      } else {
        this.canvas.selection = false;
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
      }
    },
    setBrushColor(color) {
      this.brushColor = color;
      this.canvas.freeDrawingBrush.color = color;
    },
    setBrushWidth(width) {
      this.brushWidth = width;
      this.canvas.freeDrawingBrush.width = width;
    },
    addRect() {
      const rect = new fabric.Rect({
        left: _.random(50, 300),
        top: _.random(50, 200),
        width: 100,
        height: 80,
        fill: this.brushColor,
        stroke: "#000000",
        strokeWidth: 2,
      });
      this.canvas.add(rect);
      this.canvas.setActiveObject(rect);
      this.canvas.renderAll();
    },
    addCircle() {
      const circle = new fabric.Circle({
        left: _.random(50, 300),
        top: _.random(50, 200),
        radius: 50,
        fill: this.brushColor,
        stroke: "#000000",
        strokeWidth: 2,
      });
      this.canvas.add(circle);
      this.canvas.setActiveObject(circle);
      this.canvas.renderAll();
    },
    addText() {
      this.$prompt("请输入文字内容", "添加文字", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValue: "Hello World",
      })
        .then(({ value }) => {
          const text = new fabric.Text(value, {
            left: _.random(50, 300),
            top: _.random(50, 200),
            fontSize: 24,
            fill: this.brushColor,
            fontFamily: "Arial",
          });
          this.canvas.add(text);
          this.canvas.setActiveObject(text);
          this.canvas.renderAll();
        })
        .catch(() => {
          this.$message.info("已取消添加文字");
        });
    },
    clearCanvas() {
      this.$confirm("确定要清空画板吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.canvas.clear();
          this.canvas.backgroundColor = "#ffffff";
          this.canvas.renderAll();
          this.$message.success("画板已清空");
        })
        .catch(() => {
          this.$message.info("已取消清空");
        });
    },
    saveCanvas() {
      const canvasData = JSON.stringify(this.canvas.toJSON());
      localStorage.setItem("fabricCanvasData", canvasData);

      // 同时保存为图片
      const dataURL = this.canvas.toDataURL({
        format: "png",
        quality: 1,
      });

      // 创建下载链接
      const link = document.createElement("a");
      link.download = `canvas_${Date.now()}.png`;
      link.href = dataURL;
      link.click();

      this.$message.success("画板已保存到本地存储和下载文件夹");
    },
    loadCanvas() {
      const canvasData = localStorage.getItem("fabricCanvasData");
      if (canvasData) {
        this.canvas.loadFromJSON(canvasData, () => {
          this.canvas.renderAll();
          this.updateObjectCount();
          this.$message.success("画板数据已加载");
        });
      } else {
        this.$message.warning("没有找到保存的画板数据");
      }
    },
    updateObjectCount() {
      this.objectCount = this.canvas.getObjects().length;
    },
  },
};
</script>

<style scoped>
.canvas-container {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.canvas-wrapper {
  text-align: center;
  margin-bottom: 20px;
}

#fabricCanvas {
  border: 2px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.canvas-info {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
</style>