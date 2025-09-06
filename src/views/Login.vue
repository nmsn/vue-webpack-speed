<template>
  <div class="login-container">
    <el-card class="login-card">
      <div slot="header" class="clearfix">
        <span>用户登录</span>
      </div>
      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginForm"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading"
            >登录</el-button
          >
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  name: "Login",
  data() {
    return {
      loading: false,
      loginForm: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 20,
            message: "长度在 3 到 20 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 20,
            message: "长度在 6 到 20 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    handleLogin: _.debounce(function () {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          // 模拟登录请求
          setTimeout(() => {
            this.loading = false;
            this.$message.success("登录成功！");
            this.$router.push("/products");
          }, 1500);
        } else {
          this.$message.error("请检查输入信息");
          return false;
        }
      });
    }, 300),
    resetForm() {
      this.$refs.loginForm.resetFields();
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.login-card {
  width: 400px;
}
</style>