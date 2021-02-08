import request from '@/utils/request'

/**
 * 获取所有单位信息
 * @param {number} page 第几页(从1开始)
 * @param {number} size 每页大小
 */
export function getUnitList(page, size = 30) {
  return request({
    url: '/unit/all',
    method: 'get',
    params: {
      page,
      size
    }
  })
}

/**
 * 删除单位
 * @param {number} id 单位id
 */
export function deleteUnit(id) {
  return request({
    url: '/unit',
    method: 'delete',
    data: {id}
  })
}

/**
 * 创建单位
 * @param {string} site 单位地址
 * @param {number} userId 用户id(负责人id)
 * @param {string} name 单位名字
 */
export function registerUnit(site, userId, name) {
  return request({
    url: '/unit',
    method: 'post',
    customParam: {
      requestDataType: 'json'
    },
    data: {
      site,
      userId,
      name
    }
  })
}

/**
 * 更新单位
 * @param {number} id 单位id
 * @param {string} site 单位地址
 * @param {number} userId 用户id(负责人id)
 * @param {string} name 单位名字
 */
export function updateUnit(id, site, userId, name) {
  return request({
    url: '/unit',
    method: 'PUT',
    customParam: {
      requestDataType: 'json'
    },
    data: {
      id,
      site,
      userId,
      name,
    }
  })
}
