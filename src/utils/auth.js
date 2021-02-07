import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'
const UserNameKey = 'user_name'
const PasswordKey = 'password'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getUserName() {
  return Cookies.get(UserNameKey) || ""
}

export function setUserName(userName) {
  return Cookies.set(UserNameKey, userName)
}

export function removeUserName() {
  return Cookies.remove(UserNameKey)
}

export function getPassword() {
  return Cookies.get(PasswordKey) || ""
}

export function setPassword(password) {
  return Cookies.set(PasswordKey, password)
}

export function removePassword() {
  return Cookies.remove(PasswordKey)
}
