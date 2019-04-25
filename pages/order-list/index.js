var wxpay = require('../../utils/pay.js')
var app = getApp()
Page({
  data:{
    statusType: ["待付款", "待发货", "待收货", "待评价", "已完成"],
    currentType:0,
    tabClass: ["", "", "", "", ""]
  },
  statusTap:function(e){
     var curType =  e.currentTarget.dataset.index;
     this.data.currentType = curType
     this.setData({
       currentType:curType
     });
     this.onShow();
  },
  orderDetail : function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId
    })
  }, 
  toEvaluate: function (e) {
    var orderId = e.currentTarget.dataset.id;
    var orderNum = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: "/pages/evaluate/addEvaluate?id=" + orderId + "&index=" + orderNum
    })
  }, 
  conformGoods:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: function (res) {
        if (res.confirm) {
          var params = {
            "busiInfo": {
              "orderId": orderId,
              "status":3
            },
            "pubInfo": {
              "channelId": "web",
              "opId": "1"
            }
          };
          wx.request({
            url: app.globalData.webAdderss + 'order/updateOrderStatus.bz',
            data: { inParam: JSON.stringify(params) },
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: 'POST',
            success: function (res) {
              if (res.data.statusCode == 200) {
                wx.showToast({
                  title: '已收货',
                  icon: 'success',
                  duration: 2000
                })
                that.onShow();
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
      }
    })
  },
  cancelOrderTap:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.id;
     wx.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: function(res) {
        if (res.confirm) {
          var params = {
            "busiInfo": {
              "orderId": orderId
            },
            "pubInfo": {
              "channelId": "web",
              "opId": "1"
            }
          };
          wx.request({
            url: app.globalData.webAdderss + 'order/deleteOrder.bz',
            data: { inParam: JSON.stringify(params) },
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: 'POST',
            success: function (res) {
              if (res.data.statusCode == 200) {
                wx.showToast({
                  title: '已取消！',
                  icon: 'success',
                  duration: 2000
                })
                that.onShow();
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
      }
    })
  },
  toPayTap:function(e){
    var that = this;
    var orderNum = e.currentTarget.dataset.id;
    var money = (e.currentTarget.dataset.money * 100).toFixed(0);
    var couponId = e.currentTarget.dataset.index;
    console.log(money)
    var params = {
      "busiInfo": {
        "orderNum": orderNum,
        "price":money,
        "openId": wx.getStorageSync('openId')
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'sys/wxPay.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          wx.requestPayment({
            "timeStamp": res.data.data.timeStamp,
            "nonceStr": res.data.data.nonceStr,
            "package": res.data.data.package,
            "signType": "MD5",
            "paySign": res.data.data.paySign,
            "success": function (res) {
              if (couponId == 0) {
                return false
              } else {
                var params = {
                  "busiInfo": {
                    "openId": wx.getStorageSync('openId'),
                    "couponId": couponId
                  },
                  "pubInfo": {
                    "channelId": "web",
                    "opId": "1"
                  }
                };
                wx.request({
                  url: app.globalData.webAdderss + 'acc/alterUserCouponStatus.bz',
                  data: { inParam: JSON.stringify(params) },
                  header: {
                    "Content-Type": "application/x-www-form-urlencoded"
                  },
                  method: 'POST',
                  success: function (res) {
                    if (res.data.statusCode == 200) {

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
            "fail": function (res) {
              wx.showModal({
                title: '提示',
                content: res.errMsg,
              })
            }
          })
        } else {
          wx.showToast({
            title: '请求失败',
            image: '../../images/tip.png',
            duration: 2000
          })
        }
      }
    })   
  },
  formatAllDate: function (value) {
    if (!value) return '';
    value = new Date(value).getFullYear() + '-' +
      ((new Date(value).getMonth() + 1) < 10 ? '0' + (new Date(value).getMonth() + 1) : (new Date(value).getMonth() + 1)) + '-' +
      (new Date(value).getDate() < 10 ? '0' + new Date(value).getDate() : new Date(value).getDate()) + ' ' +
      (new Date(value).getHours() < 10 ? '0' + new Date(value).getHours() : new Date(value).getHours()) + ':' +
      (new Date(value).getMinutes() < 10 ? '0' + new Date(value).getMinutes() : new Date(value).getMinutes()) + ':' +
      (new Date(value).getSeconds() < 10 ? '0' + new Date(value).getSeconds() : new Date(value).getSeconds());
    return value
  },
  getOrderList: function (status){
    var that = this;
    var params = {
      "busiInfo": {
        "openId": wx.getStorageSync('openId'),
        "status": status
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'order/getOrderByOpenId.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          that.setData({
            orderList: res.data.data
          });
          console.log(that.data.orderList)
          
        } else {
          wx.showToast({
            title: '请求失败',
            image: '../../images/tip.png',
            duration: 2000
          })
        }
      }
    })
  },
  onShow: function (){
    // 获取订单列表
    this.getOrderList(this.data.currentType)
  }
})