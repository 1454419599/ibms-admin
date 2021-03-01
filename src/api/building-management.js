import request from '@/utils/request'

/**
 * 获取楼宇列表
 * @param {number} parentId 上级id，如果不传就返回当前部门管理的楼宇
 * @param {number} page 第几页(从1开始)
 * @param {number} size 每页大小
 */
export function getBuildingList(parentId, page, size = 30) {
  return request({
    url: '/building/list',
    method: 'get',
    params: {
      parentId,
      page,
      size
    }
  })
}

/**
 * 删除楼宇
 * @param {number} id 楼宇id
 */
export function deleteBuilding(id) {
  return request({
    url: '/building',
    method: 'delete',
    data: {id}
  })
}

/**
 * 创建楼宇
 * @param {string} parentId 上级id
 * @param {string} name 名称
 * @param {string} type 类型{1:楼宇,2:楼层,3:房间}
 * @param {string} comment 备注
 */
export function createBuilding(parentId, name, type, comment) {
  return request({
    url: '/building',
    method: 'post',
    customParam: {
      requestDataType: 'json'
    },
    data: {
      parentId,
      name,
      type,
      comment,
    }
  })
}

/**
 * 修改楼宇的信息
 * @param {number} id id
 * @param {number} name 名称
 * @param {string} comment 备注
 */
export function updateBuilding(id, name, comment) {
  return request({
    url: '/building',
    method: 'PUT',
    customParam: {
      requestDataType: 'json'
    },
    data: {
      id,
      name,
      comment,
    }
  })
}
