<template>
  <div id="app">
    <el-container>
      <el-header>
        <el-menu
          :default-active="$route.path"
          class="el-menu-demo"
          mode="horizontal"
          router
        >
          <el-menu-item index="/login">登录</el-menu-item>
          <el-menu-item index="/products">产品列表</el-menu-item>
          <el-menu-item index="/canvas">Canvas 画板</el-menu-item>
          <el-menu-item index="/request-demo">请求演示</el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  min-height: calc(100vh - 60px);
}
</style>