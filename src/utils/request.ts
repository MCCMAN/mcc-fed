import axios from 'axios'
import store from '@/store'
import { Message } from 'element-ui'
import router from '@/router'
import qs from 'qs'

const request = axios.create({
  // 配置选项
})

function redirectLogin () {
  router.push({
    name: 'login',
    query: {
      redirect: router.currentRoute.fullPath
    }
  })
}

function refreshToken () {
  return axios.create()({ // 新创建axios实例 没有拦截器
    method: 'POST',
    url: '/front/user/refresh_token',
    data: qs.stringify({
      // refresh_token只能使用一次
      refreshtoken: store.state.user.refresh_token
    })
  })
}

// 请求拦截器
request.interceptors.request.use(function (config) {
  // 通过改写config配置信息来实现业务宫娥能的统一处理
  const { user } = store.state
  if (user && user.access_token) {
    config.headers.Authorization = user.access_token
  }
  // 一定要返回config,否则氢气发不出去
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

// 响应拦截器
let isRefreshing = false // 控制刷新的状态
let requests: any[] = [] // 存储刷新 token 期间过来的401 请求
request.interceptors.response.use(function (response) {
  // 对http状态码2xx进入这里，对响应数据做点什么
  // 如果是自定义错误状态码，错误处理写到这里
  return response
}, async function (error) {
  // http状态码超出2xx范围的 对响应错误做点什么
  if (error.response) {
    // 请求收到相应了，但是状态码超出了 2xx 范围
    const { status } = error.response
    if (status === 400) {
      Message.error('请求参数错误')
    } else if (status === 401) {
      // token无效（没提供，无效，过期了）
      // 如果有refresh_token 则尝试使用 refresh_token 获取新的access_token
      if (!store.state.user) {
        redirectLogin()
        return Promise.reject(error)
      }

      if (!isRefreshing) {
        isRefreshing = true
        // 尝试刷新获取新的 token
        return refreshToken().then(res => {
          if (!res.data.success) {
            throw new Error('刷新 Token 失败')
            // 然后执行catch内的代码
          }
          // 刷新token成功
          store.commit('setUser', res.data.content)
          // 把requests队列请求发出去
          requests.forEach(cb => cb())
          // 重置requests数组
          requests = []
          return request(error.config)
        }).catch(err => {
          console.log(err)
          // 清除用户登录信息
          store.commit('setUser', null)
          // 失败了 -> 跳转到登录页重新登录获取新的token
          redirectLogin()
          return Promise.reject(error)
        }).finally(() => {
          isRefreshing = false // 重置刷新状态
        })
      }

      // 刷新状态下 ,把请求挂起放在 requests数组中
      return new Promise(resolve => {
        requests.push(() => {
          resolve(request(error.config))
        })
      })
      // try {
      //   const { data } = await refreshToken()
      //   // 成功了 -> 把本次失败的请求重新发送
      //   // 把刷新拿到的新的 access_token 更新到容器和本地存储中
      //   store.commit('setUser', data.content)
      //   // 把本次失败的请求发出去 error.config:失败请求的配置信息
      //   return request(error.config)
      // } catch (err) {
      //   // 清除用户登录信息
      //   store.commit('setUser', null)
      //   // 失败了 -> 跳转到登录页重新登录获取新的token
      //   redirectLogin()
      //   return Promise.reject(error)
      // }
    } else if (status === 403) {
      Message.error('没有权限，请联系管理员')
    } else if (status === 404) {
      Message.error('请求资源不存在')
    } else if (status >= 500) {
      Message.error('服务端错误，请联系管理员')
    }
  } else if (error.messagerror.request) {
    // 请求发出去了 相应没有收到，
    Message.error('请求超时，请刷新重试')
  } else {
    // 在设置请求时发生了一些错误
    Message.error(`请求失败：${error.message}`)
  }
  // 把请求失败的错误对象继续抛出，扔给下一个调用者
  return Promise.reject(error)
})

export default request
