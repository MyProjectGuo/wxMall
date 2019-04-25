//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false, // loading
    userInfo: {},
    swiperCurrent: 0,
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
    scrollTop: "0",
    loadingMoreHidden: true,
    hasNoCoupons: true,
    coupons: [],
    searchInput: '',
    pageVal:2
  },
  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id
    });
    this.getGoodsList(this.data.activeCategoryId,1);
  },
  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  bindTypeTap: function (e) {
    this.setData({
      selectCurrent: e.index
    })
  },
  scroll: function (e) {
    var that = this, scrollTop = that.data.scrollTop;
    that.setData({
      scrollTop: e.detail.scrollTop
    })
  },
  onLoad: function () {
    var that = this
    //获取分类列表
    var params = {
      "busiInfo": {

      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'config/getCategory.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        var categories = [{ categoryId: 0, categoryName: "全部" }];
        if (res.data.statusCode == 200) {
          for (var i = 0; i < res.data.data.length; i++) {
            categories.push(res.data.data[i]);
          }
          that.setData({
            categories: categories,
            activeCategoryId: 0
          });
        }
      }
    })
    that.getBanner();
    that.getAllGoodsList(1);
    that.getCoupons();
    that.getNotice();
  },
  getBanner:function(){
    var that = this;
    var params = {
      "busiInfo": {
        
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'good/getBanner.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          if (res.data.data == 0){
            // wx.showModal({
            //   title: '提示',
            //   content: '还没有商品信息哦~',
            //   showCancel: false
            // })
          }else{
            that.setData({
              banners: res.data.data
            });
          }
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
  //获取全部商品列表
  getAllGoodsList: function (pageNum) {
    var that = this;
    var params = {
      "busiInfo": {
        "searchCond": that.data.searchInput,
        "pageSize": 20,
        "pageNum": pageNum
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'good/getGoodByCond.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          that.setData({
            goods: that.data.goods.concat(res.data.data.goodModels),
          });
        } else {
          wx.showToast({
            title: '加载商品信息失败！',
            image: '../../images/tip.png',
            duration: 2000
          })
        }
      }
    })
  },
  getGoodsList: function (categoryId, pageNum) {
    var that = this;
    that.data.goods = [];    //每次点击清空上次的列表
    if (categoryId == 0){
      this.getAllGoodsList(pageNum);
    }else{
      console.log(1)
      var params = {
        "busiInfo": {
          "categoryId": categoryId,
          "pageSize": 20,
          "pageNum": pageNum
        },
        "pubInfo": {
          "channelId": "web",
          "opId": "1"
        }
      };
      wx.request({
        url: app.globalData.webAdderss + 'good/getGoodByCategory.bz',
        data: { inParam: JSON.stringify(params) },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        success: function (res) {
          if (res.data.statusCode == 200) {
            that.setData({
              // goods: that.data.goods.concat(res.data.data.goodModels)
              goods: res.data.data.goodModels
            }); 
            if (res.data.data.goodModels.length == 0) {
              that.setData({
                loadingMoreHidden: false,
              });
              return;
            }
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
  getCoupons: function () {
    var that= this;
    var params = {
      "busiInfo": {
        
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'config/getCoupon.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          var end = '', now = '';  //起止日期
          res.data.data.forEach((ele) => {
            if (ele.validateType == 2){
              now = that.timestampToTime(ele.validateDate);
              end = that.timestampToTime(ele.expireDate);
              ele.now = now, ele.end = end;
            }
          })
          if (res.data.data.length>0){
            that.setData({
              hasNoCoupons: false,
              coupons: res.data.data
            });
          }
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
  gitCoupon: function (e) {
    var that = this;
    var params = {
      "busiInfo": {
        "openId":wx.getStorageSync('openId'),
        "couponId": e.currentTarget.dataset.id,
        "validityTime": e.currentTarget.dataset.index
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    console.log(e.currentTarget.dataset.id + '测试' + e.currentTarget.dataset.index)
    wx.request({
      url: app.globalData.webAdderss + 'acc/receiveCoupon.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        wx.showModal({
          title: '提示',
          content: res.data.msg,
          showCancel: false
        })
      }
    })
  },
  getNotice: function () {
    var that = this;
    var params = {
      "busiInfo": {

      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'good/getNotice.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          that.setData({
            noticeList: res.data.data
          });
        }
      }
    })
  },
  listenerSearchInput: function (e) {
    this.setData({
      searchInput: e.detail.value
    })
  },
  toSearch: function () {
    // this.getGoodsList(this.data.activeCategoryId);
    this.data.goods = [];
    this.getAllGoodsList(1);
  },
  onReachBottom: function () {
    var pageIndex = this.data.pageVal++
    this.getAllGoodsList(pageIndex);
    // this.getGoodsList(this.data.activeCategoryId, pageIndex);
    console.log("到底了" + pageIndex)
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '快来买，快来买，快来买',
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
        console.log("转发成功")
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败")
      }
    }
  },
})
