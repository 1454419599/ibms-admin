import request from '@/utils/request'

/**
 * 获取产品列表
 * @param {number} page 第几页(从1开始)
 * @param {number} size 每页大小
 */
export function getModelList(page, size = 30) {
  return request({
    url: '/device/product',
    method: 'get',
    params: {
      page,
      size
    }
  })
}

/**
 * 创建模型
 * @param {string} parentId 上级id
 * @param {string} name 模型名字
 * @param {number} buildingId 所属楼宇
 * @param {string} createTime 创建时间
 */
export function createModel( name, buildingId, createTime) {
  return request({
    url: '/model',
    method: 'post',
    data: {
      name,
      type,
      comment,
    }
  })
}

/**
 * 删除模型
 * @param {number} id 模型id
 */
export function deleteModel(id) {
  return request({
    url: '/model',
    method: 'delete',
    data: {id}
  })
}

/**
 * 更新模型
 * @param {number} id id
 * @param {number} name 名称
 * @param {string} comment 备注
 */
export function updateModel(id, name, comment) {
  return request({
    url: '/model',
    method: 'PUT',
    data: {
      id,
      name,
      comment,
    }
  })
}
