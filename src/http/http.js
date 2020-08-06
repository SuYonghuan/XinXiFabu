import axios from 'axios'
import router from 'router'
import store from 'store'
import { ERR_OK, ERR_LOGIN, ERR_AUTH } from './config'
import { encrypt, decrypt } from 'common/js/utils'
import { Message } from 'element-ui'
import { delCookie } from 'common/js/cookie'

axios.defaults.timeout = 10000
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

// if (process.env.NODE_ENV === 'development') {
//   axios.defaults.baseURL = store.state.config.url
// } else if (process.env.NODE_ENV === 'production') {
//   axios.defaults.baseURL = store.state.config.url
// }

// 请求拦截器
axios.interceptors.request.use(
  config => {
    return config
  },
  err => {
    return Promise.error(err)
  }
)

// 响应拦截器
axios.interceptors.response.use(response => {
  //兼容config文件
  if ( typeof(response.data) == "object") {
    return response
  }
  const data = JSON.parse(decrypt(response.data))
  //200 请求成功
  // if (data.code === ERR_OK) {
  //   return Promise.resolve(data)
  //   //401 登陆错误
  // } else if (data.code === ERR_LOGIN) {
  //   Message.error(data.msg)
  //   //清除存储在cookie和store中的用户信息 重新跳转到登陆页
  //   store.dispatch('delUser')
  //   delCookie()
  //   router.replace('/login')
  //   //403 无权限
  // } else if (data.code === ERR_AUTH) {
  //   Message.error(data.msg)
  //   router.replace('/')
  // } else {
  //   // Message.error(data.msg)
  // }
  return Promise.resolve(data)
})

//封装post方法
export function post(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .post(url, encrypt(JSON.stringify(params)))
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}

//封装get方法
export function get(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params
      })
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}
