import request from '@/utils/request'

/**
 * 获取设备列表
 * @param {string} productKey 产品的ProductKey。创建产品时，物联网平台为该产品颁发的全局唯一标识。
 * @param {number} page 第几页(从1开始)
 * @param {number} size 每页大小
 */
export function getDeviceList(productKey, page, size = 30) {
  return request({
    url: '/device/list',
    method: 'get',
    params: {
      productKey,
      page,
      size
    }
  })
}

/**
 * 获取产品列表
 * @param {number} page 第几页(从1开始)
 * @param {number} size 每页大小
 */
 export function getProductList(page, size = 30) {
  return request({
    url: '/device/product',
    method: 'get',
    params: {
      page,
      size
    }
  })
}
