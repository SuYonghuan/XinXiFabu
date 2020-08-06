import CryptoJS from 'crypto-js'

const ENCRYPT_KEY = '0123456789QMSaas'

//时间戳
export const timeStamp = () => {
  return parseInt(new Date().getTime() / 1000)
}

export const mergeWordAndTimeStamp = word => {
  return encrypt(word + timeStamp())
}

//加密
export const encrypt = (word, keyStr = ENCRYPT_KEY) => {
  const key = CryptoJS.enc.Utf8.parse(keyStr)
  const srcs = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

//解密
export const decrypt = (word, keyStr = ENCRYPT_KEY) => {
  const key = CryptoJS.enc.Utf8.parse(keyStr)
  const decrypt = CryptoJS.AES.decrypt(word, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return CryptoJS.enc.Utf8.stringify(decrypt).toString()
}

//验证手机号
export const checkingPhone = phone => {
  const exp = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/
  if (exp.test(phone)) {
    return true
  } else {
    return false
  }
}
