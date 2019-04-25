const app = getApp()

Page({
	data: {
    balance:0,
    freeze:0,
    showModal: false,
    phone:'',
    showModalUp:false
  },	
  onShow() {
    this.getUserInfo();
    this.setData({
      version: app.globalData.version
    });
    this.getUserApiInfo();
  },	
  getUserInfo: function (cb) {
      var that = this;
      var userInfo = wx.getStorageSync('userInfo');
      if (userInfo == undefined || userInfo == '' || userInfo == {} || userInfo == null){
        wx.login({
          success: function () {
            wx.getUserInfo({
              success: function (res) {
                that.setData({
                  userInfo: res.userInfo
                });
              }
            })
          }
        })
      }else{
        that.setData({
          userInfo: userInfo
        });
      }
      
  },
  showDialogBtn: function () {
    this.setData({
      showModal: true
    })
  },
  showDialogUp:function(){
    this.setData({
      showModalUp: true
    })
  },
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  hideModalUp: function () {
    this.setData({
      showModalUp: false
    });
  },
  onCancel: function () {
    this.hideModal();
  },
  onCancelUp: function () {
    this.hideModalUp();
  },
  onConfirm: function (e) {
    var dosth = e.currentTarget.dataset.do;
    var that = this;
    if (that.data.phone == ''){
      wx.showModal({
        title: '提示',
        content: '手机号不能为空！',
        showCancel: false
      })
    } else if (!/^[1][3,4,5,7,8][0-9]{9}$/.test(that.data.phone)){
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号码！',
        showCancel: false
      })
    }else{
      var params = {
        "busiInfo": {
          "openId": wx.getStorageSync('openId'),
          "phone": that.data.phone
        },
        "pubInfo": {
          "channelId": "web",
          "opId": "1"
        }
      };
      wx.request({
        url: app.globalData.webAdderss + 'acc/alterPhone.bz',
        data: { inParam: JSON.stringify(params) },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        success: function (res) {
          dosth = dosth == "up" ? "修改成功！" : "绑定成功！"
          if (res.data.statusCode == 200) {
            wx.showToast({
              title: dosth,
              icon: 'success',
              duration: 2000
            })
            that.hideModal();
            that.hideModalUp();
            that.getUserApiInfo();
          } else {
            wx.showToast({
              title: '请求失败',
              image: '../../images/tip.png',
              duration: 2000
            })
          }
        }
      })
    }
  },
  inputChange:function(e){
    this.setData({
      phone: e.detail.value
    })
  },
  aboutUs : function () {
    wx.showModal({
      title: '关于我们',
      content: '如想申请自己的小程序商城请联系微信desen-k，祝您体验愉快！',
      showCancel:false
    })
  },
  getUserApiInfo: function () {
    var that = this;
    var params = {
      "busiInfo": {
        "openId": wx.getStorageSync('openId')
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'acc/getPhoneByOpenId.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          that.setData({
            userMobile: res.data.data
          });
        } else {
          wx.showToast({
            title: '请求失败',
            image: '../../images/tip.png',
            duration: 2000
          })
        }
      }
    })
  }
})