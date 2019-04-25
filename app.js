App({
  onShow: function () {
    // 获取用户信息
    var that = this;
    //判断是否已经授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            //已授权后从后台获取openId
            success(res){
              wx.checkSession({
                success: function () {
                  console.log('没有过期')
                  //session 未过期，并且在本生命周期一直有效
                },
                fail: function () {
                  console.log('已经过期')
                  setTimeout(() => {
                    wx.login({
                      success: function (res1) {
                        if (res1.code) {
                          var params = {
                            "busiInfo": {
                              "nickName": res.userInfo.nickName,
                              "avatarUrl": res.userInfo.avatarUrl,
                              "code": res1.code
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
                              wx.setStorageSync("openId", res.data.data.openId)
                              setTimeout(() => {
                                //用户拒绝授权后的跳转
                                wx.switchTab({
                                  url: '/pages/index/index'
                                })
                                console.log("app.js已授权")
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
                    wx.switchTab({
                      url: '/pages/index/index'
                    })
                    console.log("app.js已授权")
                  })
                }
              })
            },
            //未授权跳转去授权页面
            fail(){
              console.log("app.js未授权")
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/authoSetting/index'
                })
              }, 500)    
            }
          })
        }else{ 
            console.log("app.js未授权")
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/authoSetting/index'
              })
            }, 500)    
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    subDomain: "tz", 
    webAdderss: "https://wxmall.baizitech.com/wxmall/",
    version: "2.1.1",
  }
})

