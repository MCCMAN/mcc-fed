<template>
  <div class="login">
    <el-form
      class="login-form"
      ref="form"
      :model="form"
      label-width="80px"
      label-position="top"
      :rules="rules"
    >
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="form.password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          class="login-btn"
          type="primary"
          @click="onSubmit"
          :loading="isLoginLoading"
        >登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// import request from '@/utils/request'
// import qs from 'qs'
import { Form } from 'element-ui'
import { login } from '@/services/user'

export default Vue.extend({
  name: 'LoginIndex',
  data () {
    return {
      form: {
        phone: '18201288771',
        password: '111111'
      },
      rules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在6到18个字符', trigger: 'blur' }
        ]
      },
      isLoginLoading: false
    }
  },
  methods: {
    async onSubmit () {
      try {
        // 1.表单验证 await成功了继续执行，失败了后续代码不执行
        await (this.$refs.form as Form).validate()
        this.isLoginLoading = true
        // 2.验证通过，提交表单 //axios 默认发送的是application/json格式数据
        const { data } = await login(this.form)
        // const { data } = await request({
        //   method: 'post',
        //   url: '/front/user/login',
        //   headers: { 'content-type': 'application/x-www-form-urlencoded' },
        //   data: qs.stringify(this.form)
        // })
        // 失败给出提示
        if (data.state !== 1) {
          this.$message.error(data.message)
        } else {
          // 登陆成功，记录登陆状态，状态需要能够全局访问（放到vuex容器中）
          this.$store.commit('setUser', data.content)
          // 然后在访问需要登录的页面的时候判断有没有登陆状态（路由拦截器）
          // 成功跳转到首页
          this.$router.push(this.$route.query.redirect as string || '/')
          // this.$router.push({
          //   name: 'home'
          // })
          this.$message.success('登录成功')
        }
      } catch (err) {
        console.log('登录失败')
      }
      // 3.处理请求结果
      this.isLoginLoading = false
    }
  }
})
</script>

<style lang="scss" scoped>
.login {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  .login-form {
    width: 300px;
    background: #fff;
    padding: 20px;
    border-radius: 5px;
    .login-btn {
      width: 100%;
    }
  }
}
</style>
