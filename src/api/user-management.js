import request from '@/utils/request'

/**
 * 获取所有用户信息
 * @param {number} page 第几页(从1开始)
 * @param {number} size 每页大小
 */
export function getUserList(page, size = 30) {
  return request({
    url: '/user/all',
    method: 'get',
    params: {
      page,
      size
    }
  })
}

/**
 * 删除用户
 * @param {number} id 用户id
 */
export function deleteUser(id) {
  return request({
    url: '/user',
    method: 'delete',
    data: {id}
  })
}

/**
 * 注册用户
 * @param {string} name 姓名
 * @param {string} username 用户名、账号
 * @param {string} telephone 电话
 * @param {string} password 密码
 */
export function registerUser(name, username, telephone, password) {
  return request({
    url: '/common/register',
    method: 'post',
    data: {
      name,
      username,
      telephone,
      password
    }
  })
}

/**
 * 更新用户，支持跟新密码
 * @param {number} id 用户id
 * @param {string} name 姓名
 * @param {string} username 用户名、账号
 * @param {string} telephone 电话
 * @param {string} password 密码
 */
export function updateUser(id, name, username, telephone, password) {
  return request({
    url: '/user',
    method: 'PUT',
    customParam: {
      requestDataType: 'json'
    },
    data: {
      id,
      name,
      username,
      telephone,
      password
    }
  })
}
