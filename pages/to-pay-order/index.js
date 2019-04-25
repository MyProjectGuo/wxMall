//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    goodsList:[],
    isNeedLogistics:0, // 是否需要物流信息
    allGoodsPrice:0,
    yunPrice:0,
    allGoodsAndYunPrice:0,
    goodsJsonStr:"",
    hasNoCoupons: true,
    coupons: [],
    districtList: [],
    couponId: 0,
    youhuijine:0, //优惠券金额 
    curCoupon:null, // 当前选择使用的优惠券
    districtId: 0,
    districtPrice: 0, //优惠券金额
    curDistrict: null ,// 当前选择使用的优惠券
    distributionId: 0,
    distributionName: '',
    distributionPrice: '',
    defaultDis: true
  },
  onShow : function () {
    var that = this;
    var shopList = [];
    that.setData({
      goodsList: wx.getStorageSync('buyNowInfo'),
    });
    console.log(that.data.goodsList);
    var allPrice = 0;
    for(var i = 0;i<that.data.goodsList.length;i++){
      allPrice = allPrice + that.data.goodsList[i].goodNum * that.data.goodsList[i].goodPrice
    }
    that.setData({
      allGoodsAndYunPrice: allPrice
    });
    that.getAddrByOpenId();
    that.getMyCoupons(that.data.allGoodsAndYunPrice);
    if(that.data.defaultDis){
      that.getDistrictId();
    }
  },

  onLoad: function (e) {
    var that = this;
    //显示收货地址标识
    // var distributionId = e.distributionId;
    that.setData({
      isNeedLogistics: 1,
    });
  },
  getMyCoupons:function(orderPrice){
    var  that = this;
    var params = {
      "busiInfo": {
        "openId": wx.getStorageSync('openId'),
        "orderPrice": orderPrice
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'order/getCouponWhenOrder.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          // wx.setStorageSync('coupons', res.data.data)
          if (res.data.data.length > 0) {
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
  getAddrByOpenId:function(){
    var that = this;
    var curAddressData = wx.getStorageSync('curAddressData')
    if (curAddressData == ''){
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
        url: app.globalData.webAdderss + 'acc/getAddrByOpenId.bz',
        data: { inParam: JSON.stringify(params) },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        success: function (res) {
          if (res.data.statusCode == 200) {
            wx.setStorageSync('curAddressData', res.data.data[0])
            that.setData({
              curAddressData: res.data.data[0]
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
    }else{
      that.setData({
        curAddressData: curAddressData
      });
    }
  },
  getDistrictId : function (){
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
      url: app.globalData.webAdderss + 'order/getDistribution.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          that.setData({
            distributionId: res.data.data[0].distributionId,
            distributionPrice: res.data.data[0].distributionPrice,
            distributionName: res.data.data[0].distributionName,
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
    value = new Date(value).getFullYear() +
      ((new Date(value).getMonth() + 1) < 10 ? '0' + (new Date(value).getMonth() + 1) : (new Date(value).getMonth() + 1)) +
      (new Date(value).getDate() < 10 ? '0' + new Date(value).getDate() : new Date(value).getDate())  +
      (new Date(value).getHours() < 10 ? '0' + new Date(value).getHours() : new Date(value).getHours()) +
      (new Date(value).getMinutes() < 10 ? '0' + new Date(value).getMinutes() : new Date(value).getMinutes()) +
      (new Date(value).getSeconds() < 10 ? '0' + new Date(value).getSeconds() : new Date(value).getSeconds());
    return value
  },
  createOrder:function (e) {
    var that = this;
    var Num = "";
    for (var i = 0; i < 6; i++) {
      Num += Math.floor(Math.random() * 10);
    }
    var orderNum = that.formatAllDate(new Date().getTime()) + Num;
    var remark;
    if (that.data.youhuijine == 0){
      remark = e.detail.value.remark
    }else{
      remark = e.detail.value.remark + ' 使用优惠券：' + that.data.youhuijine + "元"
    }
    var list = [];
    for (var i = 0; i < that.data.goodsList.length; i++) {
      list.push({ goodId: that.data.goodsList[i].goodId, goodNum: that.data.goodsList[i].goodNum, specSizeId: that.data.goodsList[i].specSizeId, specColorId: that.data.goodsList[i].specColorId})
    }
    console.log(list);
    var params = {
      "busiInfo": {
        list:list 
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'good/getStockIsEnough.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          var params = {
            "busiInfo": {
              "openId": wx.getStorageSync('openId'),
              "orderNum": orderNum,
              "address": that.data.curAddressData.provinceId + that.data.curAddressData.cityId + that.data.curAddressData.districtId + that.data.curAddressData.loco,
              "contactName": that.data.curAddressData.contactName,
              "contactNum": that.data.curAddressData.contactNum,
              "orderPrice": that.data.allGoodsAndYunPrice,
              "payPrice": that.data.allGoodsAndYunPrice - that.data.youhuijine + that.data.distributionPrice,
              "remark": remark,
              "distributionId": that.data.distributionId,
              "couponId": that.data.couponId,
              "list": wx.getStorageSync('buyNowInfo')
            },
            "pubInfo": {
              "channelId": "web",
              "opId": "1"
            }
          };
          wx.request({
            url: app.globalData.webAdderss + 'order/addOrder.bz',
            data: { inParam: JSON.stringify(params) },
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: 'POST',
            success: function (res) {
              if (res.data.statusCode == 200) {
                if (that.data.goodsList[0].cartId == undefined){
                  wx.redirectTo({
                     url: "/pages/order-list/index"
                  });
                }else{
                  var cartIds = [];
                  for (let i = 0; i < that.data.goodsList.length; i++) {
                    cartIds.push(that.data.goodsList[i].cartId)
                  }
                  var params = {
                    "busiInfo": {
                      "cartIds": cartIds
                    },
                    "pubInfo": {
                      "channelId": "web",
                      "opId": "1"
                    }
                  };
                  wx.request({
                    url: app.globalData.webAdderss + 'order/deleteCart.bz',
                    data: { inParam: JSON.stringify(params) },
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    method: 'POST',
                    success: function (res) {
                      if (res.data.statusCode == 200) {
                        wx.redirectTo({
                          url: "/pages/order-list/index"
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
              } else {
                wx.showToast({
                  title: '请求失败',
                  image: '../../images/tip.png',
                  duration: 2000
                })
              }
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel:false
          })
        }
      }
    })

  },
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/user/shipping-address/default',
      data: {
        token:app.globalData.token
      },
      success: (res) =>{
        if (res.data.code == 0) {
          that.setData({
            curAddressData:res.data.data
          });
        }else{
          that.setData({
            curAddressData: null
          });
        }
        that.processYunfei();
      }
    })
  },
  processYunfei: function () {
    var that = this;
    var goodsList = this.data.goodsList;
    var goodsJsonStr = "[";
    var isNeedLogistics = 0;
    var allGoodsPrice = 0;

    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      if (carShopBean.logistics) {
        isNeedLogistics = 1;
      }
      allGoodsPrice += carShopBean.price * carShopBean.number;

      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ",";
      }


      let inviter_id = 0;
      let inviter_id_storge = wx.getStorageSync('inviter_id_' + carShopBean.goodsId);
      if (inviter_id_storge) {
        inviter_id = inviter_id_storge;
      }


      goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number + ',"propertyChildIds":"' + carShopBean.propertyChildIds + '","logisticsType":0, "inviter_id":' + inviter_id +'}';
      goodsJsonStr += goodsJsonStrTmp;


    }
    goodsJsonStr += "]";
    that.setData({
      isNeedLogistics: isNeedLogistics,
      goodsJsonStr: goodsJsonStr
    });
    that.createOrder();
  },
  addAddress: function () {
    wx.navigateTo({
      url:"/pages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url:"/pages/select-address/index"
    })
  },
  
  bindChangeCoupon: function (e) {
    const selIndex = e.detail.value[0] - 1;
    if (selIndex == -1) {
      this.setData({
        youhuijine: 0,
        curCoupon:null,
        couponId:0
      });
      return;
    }
    this.setData({
      youhuijine: this.data.coupons[selIndex].couponPrice,
      couponId: this.data.coupons[selIndex].couponId,
      curCoupon: this.data.coupons[selIndex]
    }); 
  },
  bindChangeDistrict: function (e) {
    const selIndex = e.detail.value[0];
    this.setData({
      districtPrice: this.data.districtList[selIndex].distributionPrice,
      districtId: this.data.districtList[selIndex].distributionId,
      curDistrict: this.data.districtList[selIndex]
    });
    console.log(this.data.districtId)
  },
  goWay:function(){
    wx.navigateTo({
      url: "/pages/select-way/index" 
    })
  },
  goCou: function () {
    wx.navigateTo({
      url: `/pages/select-coupon/index?orderPrice=${this.data.allGoodsAndYunPrice}`
    })
  }
})
