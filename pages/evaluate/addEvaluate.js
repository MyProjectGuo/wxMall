// pages/evaluate/addEvaluate.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:'',
    orderNum:'',
    content:'',
    list:[],
    grade:0
  },
  onLoad: function (e) {
    var orderId = e.id;
    this.data.orderId = orderId;
    this.data.orderNum = e.index;
    this.setData({
      orderId: orderId,
      orderNum: e.index
    });
    // console.log(e.index)
  },
  onShow: function () {
    var that = this;
    var params = {
      "busiInfo": {
        "orderId": that.data.orderId
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'order/getOrderInfo.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          that.setData({
            orderDetail: res.data.data.orderDetailsModels
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
  },
  radioChange: function (e) {
    var that = this;
    that.setData({
      grade: e.detail.value
    })
  },
  bindTextAreaBlur: function (e) {
    var that = this;
    that.setData({
      content: e.detail.value
    })
  },
  addEvaluation:function(e){
    var that = this;
    var goodId = e.currentTarget.dataset.id;
    var spec = e.currentTarget.dataset.index;
    
    if (that.data.content == ''){
      wx.showModal({
        title: '提示',
        content: '请填写评价！',
        showCancel: false
      })
      return
    }
    console.log(that.data.list + 'bu')
      for(var i =0;i<that.data.list.length;i++){
        if (that.data.list[i].goodId == goodId){
          wx.showModal({
            title: '提示',
            content: '该商品评论已添加',
            showCancel:false
          })
          return
        }
      } 
      that.data.list.push({ goodId: goodId, grade: that.data.grade, content: that.data.content, openId: wx.getStorageSync('openId'), spec: spec })
    
    },
  confirmEvaluation:function(){
    var that = this;
    var orderDetailsModels = that.data.orderDetail
    if (orderDetailsModels.length == 1){
      that.data.list.push({ goodId: orderDetailsModels[0].goodId, grade: that.data.grade, content: that.data.content, openId: wx.getStorageSync('openId'), spec: orderDetailsModels[0].spec })
    }
    console.log(that.data.list)
    if (that.data.list.length == that.data.orderDetail.length){
      var params = {
        "busiInfo": {
          "orderNum": that.data.orderNum,
          "list": that.data.list
        },
        "pubInfo": {
          "channelId": "web",
          "opId": "1"
        }
      };
      wx.request({
        url: app.globalData.webAdderss + 'good/addEvaluation.bz',
        data: { inParam: JSON.stringify(params) },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        success: function (res) {
          if (res.data.statusCode == 200) {
            wx.showToast({
              title: '评价成功',
              icon: 'success',
              duration: 2000
            })
            wx.navigateBack({})
          } else {
            wx.showToast({
              title: '请求失败',
              image: '../../images/tip.png',
              duration: 2000
            })
          }
        }
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '请先添加所有评价',
        showCancel:false
      })
    }
  }
})