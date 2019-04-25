var app = getApp()
Page({
  getUserInfo: function (e) {
    //用户允许授权
    if (e.detail.userInfo) {
      wx.showToast({
        title: '正在登录',
        icon: 'loading',
      })
      //获取用户信息，授权id
      wx.getUserInfo({
        success(res) {
          wx.setStorageSync('userInfo', res.userInfo)
          app.globalData.userInfo = res.userInfo
          if (app.userInfoReadyCallback) {
            app.userInfoReadyCallback(res)
          }
          wx.checkSession({
            success: function () {
              console.log('未过期')
              //session 未过期，并且在本生命周期一直有效
              wx.switchTab({
                url: '/pages/index/index'
              })
            },
            fail: function () {
              //登录态过期
              console.log('过期')
              wx.login({
                success: function (res) {
                  console.log(res.code)
                  if (res.code) {
                    var params = {
                      "busiInfo": {
                        "nickName": app.globalData.userInfo.nickName,
                        "avatarUrl": app.globalData.userInfo.avatarUrl,
                        "code": res.code
                      },
                      "pubInfo": {
                        "channelId": "web",
                        "opId": "workshop"
                      }
                    };
                    //发起网络请求
                    wx.request({
                      url: 'https://wxmall.baizitech.com/wxmall/acc/getOpenIdByCode.bz',
                      data: { inParam: JSON.stringify(params) },
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded"
                      },
                      method: 'POST',
                      success: function (res) {
                        console.log(res.data.data)
                        wx, wx.hideLoading()
                        wx.setStorageSync("openId", res.data.data.openId)
                        //授权完成返回首页
                        wx.navigateBack({
                          delta:1
                        })                          
                      },
                      fail: function (res) {
                        wx.hideLoading()
                        wx.showModal({
                          title: '提示',
                          content: '无法获取用户信息，请重新进入！',
                          showCancel: false
                        })
                      }
                    })
                  } else {
                    console.log('获取用户登录态失败！' + res.errMsg)
                    wx.showModal({
                      title: '提示',
                      content: '授权失败，请删除微信小程序之后重新进入！',
                      showCancel: false
                    })
                  }
                },
                fail: function (res) {
                  wx.showModal({
                    title: '提示',
                    content: '授权失败，请删除微信小程序之后重新进入！',
                    showCancel: false
                  })
                }
              });
            }
          })
        }
      })
    } 
    //用户拒绝授权
    else {
      console.log('拒绝授权')
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，无法使用此功能。',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            wx.getSetting({
              success: function success(res) {
                var authSetting = res.authSetting;
                console.log('不是第一次授权', authSetting);
                // 没有授权的提醒
                if (authSetting['scope.userInfo'] === false) {
                  wx.showModal({
                    title: '用户未授权',
                    content: '请按确定并在授权管理中选中“用户信息”，然后点按确定。最后再重新进入小程序即可正常使用。',
                    showCancel: false,
                    success: function (res) {
                      if (res.confirm) {
                        console.log('用户点击确定')
                        wx.openSetting({
                          success: function (res) {
                            console.log('openSetting success', res.authSetting['scope.userInfo']);
                            wx.getUserInfo({
                              success(res) {
                                wx.setStorageSync('userInfo', res.userInfo)
                                app.globalData.userInfo = res.userInfo
                                if (app.userInfoReadyCallback) {
                                  app.userInfoReadyCallback(res)
                                }
                                wx.checkSession({
                                  success: function () {
                                    console.log('未过期')
                                    // session 未过期，并且在本生命周期一直有效
                                  },
                                  fail: function () {
                                    // 登录态过期
                                    console.log('过期')
                                    wx.login({
                                      success: function (res) {
                                        if (res.code) {
                                          var params = {
                                            "busiInfo": {
                                              "nickName": app.globalData.userInfo.nickName,
                                              "avatarUrl": app.globalData.userInfo.avatarUrl,
                                              "code": res.code
                                            },
                                            "pubInfo": {
                                              "channelId": "web",
                                              "opId": "workshop"
                                            }
                                          };
                                          //发起网络请求
                                          wx.request({
                                            url: 'https://wxmall.baizitech.com/wxmall/acc/getOpenIdByCode.bz',
                                            data: { inParam: JSON.stringify(params) },
                                            header: {
                                              "Content-Type": "application/x-www-form-urlencoded"
                                            },
                                            method: 'POST',
                                            success: function (res) {
                                              wx, wx.hideLoading()
                                              wx.setStorageSync("openId", res.data.data.openId);
                                              var currentPage = getCurrentPages()[getCurrentPages().length - 1]
                                              var url = currentPage.route    //当前页面url
                                            },
                                            fail: function (res) {
                                              wx.hideLoading()
                                              wx.showModal({
                                                title: '提示',
                                                content: '无法获取用户信息，请重新进入！',
                                                showCancel: false
                                              })
                                            }
                                          })
                                        } else {
                                          console.log('获取用户登录态失败！' + res.errMsg)
                                          wx.showModal({
                                            title: '提示',
                                            content: '授权失败，请删除微信小程序之后重新进入！',
                                            showCancel: false
                                          })
                                        }
                                      },
                                      fail: function (res) {
                                        wx.showModal({
                                          title: '提示',
                                          content: '授权失败，请删除微信小程序之后重新进入！',
                                          showCancel: false
                                        })
                                      }
                                    });
                                  }
                                })
                              }
                            })
                          }
                        });
                      }
                    }
                  })
                }
              }
            });
          }
        }
      })
    }
  }
})