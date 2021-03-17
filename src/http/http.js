import axios from 'axios'
import router from 'router'
import store from 'store'
import { ERR_OK, ERR_LOGIN, ERR_AUTH } from './config'
import { encrypt, decrypt } from 'common/js/utils'
import { Message } from 'element-ui'
import { delCookie, getCookie, setCookie } from 'common/js/cookie'
import { timeStamp } from '../common/js/utils'

axios.defaults.timeout = 40000
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
  if (typeof (response.data) == "object") {
    return response
  }

  //更新后台token
  if (response.headers.refreshtoken) {
    let user = JSON.parse(getCookie("userInfo"))
    user.jwtToken = response.headers.refreshtoken
    setCookie(JSON.stringify(user), 'userInfo', 30)
    store.dispatch('setUser', user);
  }

  const data = JSON.parse(decrypt(response.data))

  //401 重新登录
  if (data.code === ERR_LOGIN) {
    // Message.error(data.msg)
    //清除存储在cookie和store中的用户信息 重新跳转到登陆页
    store.dispatch('delUser')
    delCookie('userInfo')
    delCookie('presentMenu')
    router.replace('/login')
    return
  }

  return Promise.resolve(data)
})

//封装post方法
export function post(url, params, flag = true) {
  let jwtToken = getCookie("userInfo") ? JSON.parse(getCookie("userInfo")).jwtToken : ''
  return new Promise((resolve, reject) => {
    axios
      .post(url, encrypt(JSON.stringify(params)), {
        withCredentials: flag,
        headers: {
          Authorization: "Bearer " + jwtToken
        }
      })
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}

export const cPost = url => async params => {
  const timestamp = timeStamp();
  const res = await post(
    `${store.state.config.url}${url}?token=${encodeURIComponent(
      encrypt(url + timestamp)
    )}&time=${timestamp}`,
    params
  );
  console.group('%curl:' + url, 'background:#282c34;color:#7cc370;');
  console.info('params:', params,)
  console.info('response:', res)
  console.groupEnd();
  return res;
};

//封装get方法
export function get(url, params) {
  let jwtToken = getCookie("userInfo") ? JSON.parse(getCookie("userInfo")).jwtToken : ''
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params,
        headers: {
          Authorization: "Bearer " + jwtToken
        }
      })
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}
