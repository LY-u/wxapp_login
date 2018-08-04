import YX from './sdk'
const api = new YX()

export function checkLogin() {
  var userId = wx.getStorageSync('userId')
  var token = wx.getStorageSync('accessToken')
  let { promise } = api.checkToken(userId)
  return promise.then(res => {
    if (res && (res == token)) {
      getApp().globalData.userId = userId
      return true
    }
    return false
  }).catch(e => {
    console.log(e)
    return false
  })
}

function login(avatarUrl, nickName, callback) {
  wx.login({
    success(res) {
      if (res.code) {
        let { promise } = api.getSession('impressword', res.code)
        promise.then(res => {
          signIn(res.OpenID, avatarUrl, nickName, callback)
        })

      } else {
        // 否则弹窗显示，showToast需要封装
        showToast()
      }
    },
    fail() {
      showToast()
    }
  })
}

// 获取用户信息
export function getInfo(res, callback) {
  wx.showLoading()
  let userInfo = res
  wx.setStorage({
    key: 'userInfo',
    data: userInfo
  })
  login(userInfo.avatarUrl, userInfo.nickName, callback)
}
export function getUserInfo(res, callback) {
  wx.showLoading()
  wx.getUserInfo({
    success(res) {
      let userInfo = res.userInfo
      wx.setStorage({
        key: 'userInfo',
        data: userInfo
      })
      login(userInfo.avatarUrl, userInfo.nickName, callback)

    },
    fail(e) {
      wx.hideLoading()
      showToast()
      console.log('getUserInfo error: ', e)
      // 获取用户信息失败，清楚全局存储的登录状态
      // 获取不到用户信息，说明用户没有授权或者取消授权。弹窗提示一键登录
      // showLoginModal()
    }
  })
}

// 开发者服务端登录
function signIn(openId, headImgUrl, nickName, callback) {
  let loginData = {
    openId,
    headImgUrl,
    nickName,
    // id:12,
    // unionId: "tt1ooYW_t7NpZEB01tRc70r9974uz0g",
    // phone: "18868801234",
    // DeviceId:"tt7NpZEB01tRc70r"//设备标识
  }
  let { promise } = api.login(loginData)
  promise.then((res) => {
    wx.hideLoading()
    console.log(res)
    if (res.accessToken) {
      wx.setStorage({
        key: 'userId',
        data: res.id
      })
      wx.setStorage({
        key: 'accessToken',
        data: res.accessToken
      })
    }
    callback && callback()
  }).catch(e => {
    console.log(e)
    showToast()
  })
}

// 显示toast弹窗
export function showToast(content = '登录失败，请重试') {
  wx.showToast({
    title: content,
    icon: 'none'
  })
}