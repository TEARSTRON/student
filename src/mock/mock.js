import Mock from 'mockjs';

// 模拟商品列表接口
Mock.mock('/prod-api/inst/detail/all', 'get', {
  code: 20000,
  data: {
    'detail|1': [{}],
    'charts|1': [{
      'param': {},
      'data|50': [[
        // 随机生成日期 2024-01-01 16:22:41格式
        '@datetime("yyyy-MM-dd HH:mm:ss")',
        // 随机生成数字，一百以内,9位小数点
        '@float(100, 10000, 9, 2)',
      ]]
    }]
  },
});