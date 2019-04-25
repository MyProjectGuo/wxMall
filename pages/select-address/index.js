//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    addressList:[]
  },

  selectTap: function (e) {
    var id = e.currentTarget.dataset.id;
    console.log(id)
    var params = {
      "busiInfo": {
        "addressId": id
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.showLoading();
    wx.request({
      url: app.globalData.webAdderss + 'acc/getAddrById.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        if (res.data.statusCode == 200) {
          // res.data.data.push({isDefault:true})
          wx.setStorageSync('curAddressData', res.data.data);
          wx.navigateBack({})
        } else {
          wx.showModal({
            title: '提示',
            content: '无法获取快递地址数据',
            showCancel: false
          })
        }
      }
    })
    // wx.request({
    //   url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/user/shipping-address/update',
    //   data: {
    //     token:app.globalData.token,
    //     id:id,
    //     isDefault:'true'
    //   },
    //   success: (res) =>{
    //     wx.navigateBack({})
    //   }
    // })
  },

  addAddess : function () {
    wx.navigateTo({
      url:"/pages/address-add/index"
    })
  },
  
  editAddess: function (e) {
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
    })
  },
  onShow : function () {
    this.getAddrByOpenId();
  },
  getAddrByOpenId: function () {
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
      url: app.globalData.webAdderss +'acc/getAddrByOpenId.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function(res){
        if (res.data.statusCode == 200) {
          that.setData({
            addressList:res.data.data
          });
        } else{
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
