async function deletedPopconfirm (confirm, message, requestMethod, url, fn) {
  // 弹窗询问用户是否删除数据
  const confirmResult = await confirm('此操作将永久删除数据, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).catch(err => err)

  // 如果用户确认删除，测返回字符串confirm
  // 如果用户取消了删除, 则返回值为字符串cancel
  // console.log(confirmResult)
  if (confirmResult !== 'confirm') {
    return message.info('已取消删除')
  }
  // 调用删除接口
  const { data: res } = await requestMethod(url)
  if (res.meta.status !== 200) return message.error('删除失败')
  message.success('删除成功')
  // 删除后刷新当前页面数据
  fn()
}

async function getCateList (get, message) {
  const { data: res } = await get('categories')
  if (res.meta.status !== 200) return message.error('请求商品分类失败')
  return res.data
}

export {
  deletedPopconfirm,
  getCateList
}
