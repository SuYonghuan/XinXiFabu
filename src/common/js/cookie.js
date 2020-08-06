const USER_TOKEN = 'USER_TOKEN'

//设置cookie
export function setCookie(value, name = USER_TOKEN, day = 1) {
  let date = new Date()
  date.setDate(date.getDate() + day)
  document.cookie = name + '=' + value + ';expires=' + date
}

//获取cookie
export function getCookie(name = USER_TOKEN) {
  let reg = RegExp(name + '=([^;]+)')
  let arr = document.cookie.match(reg)
  if (arr) {
    return arr[1]
  } else {
    return ''
  }
}

//删除cookie
export function delCookie(name = USER_TOKEN) {
  setCookie( null, name,  -1)
}
