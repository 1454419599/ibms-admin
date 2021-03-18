import request from '@/utils/request'

/**
 * 获取模型列表
 * @param {number} page 第几页(从1开始)
 * @param {number} size 每页大小
 */
export function getModelList(page, size = 30) {
  return request({
    url: '/model',
    method: 'get',
    params: {
      page,
      size
    }
  })
}

/**
 * 创建模型
 * @param {string} name 模型名字
 * @param {number} buildingId 所属楼宇id
 * @param {string} iotId iotId
 * @param {string} productKey productKey
 * @param {string} deviceName deviceName
 */
export function createModel( name, buildingId, iotId, productKey, deviceName) {
  return request({
    url: '/model',
    method: 'post',
    customParam: {
      requestDataType: 'json'
    },
    data: {
      name,
      buildingId,
      iotId,
      productKey,
      deviceName,
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
 * @param {string} name 模型名字
 * @param {number} buildingId 所属楼宇id
 * @param {string} iotId iotId
 * @param {string} productKey productKey
 * @param {string} deviceName deviceName
 */
export function updateModel(id, name, buildingId, iotId, productKey, deviceName) {
  return request({
    url: '/model',
    method: 'PUT',
    customParam: {
      requestDataType: 'json'
    },
    data: {
      id,
      name,
      buildingId,
      iotId,
      productKey,
      deviceName,
    }
  })
}
