//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    coupons:[]
  },
  onLoad: function () {
  },
  onShow : function () {
    this.getMyCoupons();
  },
  getMyCoupons: function () {
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
      url: app.globalData.webAdderss + 'acc/getCouponByOpenId.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          var end = '', now = '';  //起止日期
          res.data.data.forEach((ele) => {
            if (ele.couponModel.validateType == 2) {
              now = that.timestampToTime(ele.couponModel.validateDate);
              end = that.timestampToTime(ele.couponModel.expireDate);
              ele.now = now, ele.end = end;
            }
          })
          
          if (res.data.data.length > 0) {
            that.setData({
              coupons: res.data.data
            });
          }
        }else{
          wx.showToast({
            title: '请求失败',
            image: '../../images/tip.png',
            duration: 2000
          })
        }
      }
    })
  },
  //日期处理函数(n天后)
  addByTransDate: function (dateParameter, num) {
    var translateDate = "", dateString = "", monthString = "", dayString = "";
    translateDate = dateParameter.replace("-", "/").replace("-", "/");;
    var newDate = new Date(translateDate);
    newDate = newDate.valueOf();
    newDate = newDate - num * 24 * 60 * 60 * 1000; //备注 如果是往前计算日期则为减号 否则为加号
    newDate = new Date(newDate);
    //如果月份长度少于2，则前加 0 补位 
    if ((newDate.getMonth() + 1).toString().length == 1) {
      monthString = 0 + "" + (newDate.getMonth() + 1).toString();
    } else {
      monthString = (newDate.getMonth() + 1).toString();
    }
    //如果天数长度少于2，则前加 0 补位 
    if (newDate.getDate().toString().length == 1) {
      dayString = 0 + "" + newDate.getDate().toString();
    } else {
      dayString = newDate.getDate().toString();
    }
    dateString = newDate.getFullYear() + "-" + monthString + "-" + dayString;
    return dateString;
  },
  //时间戳-正常格式
  timestampToTime: function (timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() + ' ';
    return Y + M + D;
  },
  goBuy:function(){
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }

})
