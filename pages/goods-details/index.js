//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail:{},
    picModels: {},
    detailPicModels: {},
    swiperCurrent: 0,  
    hasMoreSelect:false,
    selectSize:"选择：",
    selectSizePrice:0,
    shopNum:0,
    hideShopPopup:true,
    buyNumber:1,
    buyNumMin:1,
    buyNumMax:100,
    propertyChildIds:"",
    propertyChildNames:"",
    canSubmit:false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo:{},
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
    size:'',
    color:'',
    sizename:'',
    colorname:'',
    buyNum:0,
    getEvaluation:0,
    colorList:[],
    sizeList: [],
    hiddenSize:false,
    hiddenColor:false,
    noGoods:false,

    colorVal:'-1',
    sizeVal: '-1',
  },

  //事件处理函数
  swiperchange: function(e) {
      //console.log(e.detail.current)
       this.setData({  
        swiperCurrent: e.detail.current  
    })  
  },
  onLoad: function (e) {
    this.getShopCarInfo();
    this.getGoodDetails(e.id)
    this.getGoodsNum(e.id);
    this.getEvaluation(e.id);
  },
  // 获取商品详情
  getGoodDetails: function (goodId) {
    var that = this;
    var params = {
      "busiInfo": {
        "goodId": goodId
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'good/getGoodById.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          var selectSizeTemp1 = ""; var selectSizeTemp2 = "";
          if (res.data.data.goodModelParamBean.stockModels.length>0){
            for (var j = 0; j <= res.data.data.goodModelParamBean.stockModels.length; j++) {
              if (res.data.data.goodModelParamBean.stockModels[j].sizeName == undefined || res.data.data.goodModelParamBean.stockModels[j].sizeName == 'undefined' || res.data.data.goodModelParamBean.stockModels[j].sizeName == '') {
                selectSizeTemp1 = ''
              } else {
                selectSizeTemp1 = '尺寸'
              }
              if (res.data.data.goodModelParamBean.stockModels[j].color == undefined || res.data.data.goodModelParamBean.stockModels[j].color == 'undefined' || res.data.data.goodModelParamBean.stockModels[j].color == '') {
                selectSizeTemp2 = ''
              } else {
                selectSizeTemp2 = '颜色'
              }
              if (selectSizeTemp1 == '' && selectSizeTemp2 == '') {
                that.setData({
                  hasMoreSelect: false,
                  selectSize: that.data.selectSize + selectSizeTemp1 + ' ' + selectSizeTemp2,
                  selectSizePrice: res.data.data.goodModelParamBean.goodModel.minPrice,
                });
              } else {
                that.setData({
                  hasMoreSelect: true,
                  selectSize: that.data.selectSize + selectSizeTemp1 + '' + selectSizeTemp2,
                  selectSizePrice: res.data.data.goodModelParamBean.goodModel.minPrice,
                });
              }
              break;
            }
            
            var colorList = [];
            var sizeList = [];
            for (var i = 0, j = res.data.data.goodModelParamBean.stockModels.length; i < j; i++) {
                colorList.push({colorName: res.data.data.goodModelParamBean.stockModels[i].colorName, color: res.data.data.goodModelParamBean.stockModels[i].color});
                sizeList.push({ sizeName: res.data.data.goodModelParamBean.stockModels[i].sizeName, size: res.data.data.goodModelParamBean.stockModels[i].size });
            }
            var hash = {};
            colorList = colorList.reduce(function (item, next) {
              hash[next.colorName] ? '' : hash[next.colorName] = true && item.push(next);
              return item
            }, [])
            sizeList = sizeList.reduce(function (item, next) {
              hash[next.sizeName] ? '' : hash[next.sizeName] = true && item.push(next);
              return item
            }, [])
          
            that.setData({
              colorList: colorList,
              sizeList: sizeList
            })

            if (that.data.colorList[0] == null || that.data.colorList[0] == '') {
              // console.log(that.data.colorList.length + 'colorList的值')
              that.setData({
                hiddenColor: true
              })
            }
            if (that.data.sizeList[0] == null || that.data.sizeList[0] == '') {
              // console.log(that.data.sizeList.length + 'sizeList的值')
              that.setData({
                hiddenSize: true
              })
            }
          }else{
            that.setData({
              noGoods:true
            })
          }
          that.setData({
            goodsDetail: res.data.data.goodModelParamBean,
            selectSizePrice: res.data.data.goodModelParamBean.goodModel.minPrice,
            picModels: res.data.data.picModels,
            detailPicModels: res.data.data.detailPicModels
          });
          // WxParse.wxParse('article', 'html', res.data.data.goodModelParamBean.goodModel.content, that, 5);
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
  viewGoodImage:function(e){
    var detailPic = e.currentTarget.dataset.index;
    wx.previewImage({
      urls: detailPic.split(',') // 需要预览的图片http链接列表
    })
  },
  // 获取购物车信息
  getShopCarInfo:function(){
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
      url: app.globalData.webAdderss + 'order/getCartInfo.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          that.setData({
            shopNum: res.data.data.totalGoodNum
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
  //获取商品的购买数量
  getGoodsNum: function (goodId) {
    var that = this;
    var params = {
      "busiInfo": {
        "goodId": goodId
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'order/getGoodsNum.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          that.setData({
            buyNum:res.data.data
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
  //获取评价
  getEvaluation: function (goodId) {
    var that = this;
    var params = {
      "busiInfo": {
        "goodId": goodId
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'good/getEvaluation.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          that.setData({
            evaluationNum: res.data.data.goodGradeNum,
            reputation: res.data.data.evaluationParamBean
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
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
  },  
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function() {
     this.setData({  
        hideShopPopup: false 
    })  
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function() {
     this.setData({  
        hideShopPopup: true 
    })  
  },
  numJianTap: function() {
     if (this.data.buyNumber > 1) {
       var currentNum = this.data.buyNumber;
       currentNum--;
       this.setData({
         buyNumber: currentNum
       })
     }
     console.log('减号' + this.data.buyNumber)
  },
  numJiaTap: function() {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++ ;
      this.setData({
        buyNumber: currentNum
      })  
    }
    console.log('加号' + this.data.buyNumber)
  },
  /**
   * 选择商品规格
   * @param {Object} e
   */
  getGoodStock:function(){
    var that = this;
    if (that.data.size == '' || that.data.color == ''){
      return false
    }else{
      var params = {
        "busiInfo": {
          // "categoryId": that.data.goodsDetail.goodModel.categoryId,
          "size": that.data.size,
          "color": that.data.color,
          "goodId": that.data.goodsDetail.goodModel.goodId
        },
        "pubInfo": {
          "channelId": "web",
          "opId": "1"
        }
      };
      wx.request({
        url: app.globalData.webAdderss + 'good/getGoodStock.bz',
        data: { inParam: JSON.stringify(params) },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        success: function (res) {
          if (res.data.statusCode == 200) {
            if (res.data.data[0].stock == 0) {
              wx.showModal({
                title: '提示',
                content: '库存不足，请重新选择商品！',
                showCancel: false
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
    }
  },
  labelItemTap1: function (e) {
    var that = this;
    var cla = e.currentTarget.id;
    that.setData({
      color: e.currentTarget.dataset.color,
      colorname: e.currentTarget.dataset.colorname,
      colorVal: cla
    })

    that.getGoodStock();
  },
  labelItemTap: function(e) {
    var that = this;
    var cla = e.currentTarget.id;
    that.setData({
      size: e.currentTarget.dataset.size,
      sizename: e.currentTarget.dataset.sizename,
      sizeVal: cla
    })
    that.getGoodStock();
  },
  /**
  * 加入购物车
  */
  addShopCar:function(){
    var that = this;
    if(that.data.noGoods){
      wx.showModal({
        title: '提示',
        content: '商品库存为空！',
        showCancel: false
      })
      return;
    }
    if ( that.data.size == '' || that.data.color == ''){
      wx.showModal({
        title: '提示',
        content: '请选择规格！',
        showCancel: false
      })
      return;
    }
    var params = {
      "busiInfo": {
        // "categoryId": that.data.goodsDetail.goodModel.categoryId,
        "size": that.data.size,
        "color": that.data.color,
        "goodId": that.data.goodsDetail.goodModel.goodId
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'good/getGoodStock.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          var flag = false;
          for (var i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].color == that.data.color && res.data.data[i].size == that.data.size) {
              if (that.data.buyNumber > res.data.data[i].stock) {
                wx.showModal({
                  title: '提示',
                  content: '库存不足，请重新选择商品！',
                  showCancel: false
                })
                flag = true;
                break
              }
            }
          }
          if (!flag) {
            var params = {
              "busiInfo": {
                // "categoryId": that.data.goodsDetail.goodModel.categoryId,
                "openId": wx.getStorageSync('openId'),
                "specSizeId": that.data.size,
                "specColorId": that.data.color,
                "goodNum": that.data.buyNumber,
                "goodId": that.data.goodsDetail.goodModel.goodId
              },
              "pubInfo": {
                "channelId": "web",
                "opId": "1"
              }
            };
            wx.request({
              url: app.globalData.webAdderss + 'order/addCart.bz',
              data: { inParam: JSON.stringify(params) },
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              method: 'POST',
              success: function (res) {
                if (res.data.statusCode == 200) {
                  wx.showToast({
                    title: '加入购物车成功',
                    icon: 'success',
                    duration: 2000
                  })
                  that.setData({
                    hideShopPopup: true
                  })
                  that.getShopCarInfo();
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
  },
	/**
	  * 立即购买
	  */
  buyNow:function(){
    var that = this;
    if (that.data.noGoods) {
      wx.showModal({
        title: '提示',
        content: '商品库存为空！',
        showCancel: false
      })
      return;
    }
    if (that.data.size == '' || that.data.color == '') {
      wx.showModal({
        title: '提示',
        content: '请选择规格！',
        showCancel: false
      })
      return;
    }
    var params = {
      "busiInfo": {
        // "categoryId": that.data.goodsDetail.goodModel.categoryId,
        "size": that.data.size,
        "color": that.data.color,
        "goodId": that.data.goodsDetail.goodModel.goodId
      },
      "pubInfo": {
        "channelId": "web",
        "opId": "1"
      }
    };
    wx.request({
      url: app.globalData.webAdderss + 'good/getGoodStock.bz',
      data: { inParam: JSON.stringify(params) },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.statusCode == 200) {
          var flag = false;
         for(var i=0;i<res.data.data.length;i++){
           if (res.data.data[i].color == that.data.color && res.data.data[i].size == that.data.size){
              if (that.data.buyNumber > res.data.data[i].stock) {
                wx.showModal({
                  title: '提示',
                  content: '库存不足，请重新选择商品！',
                  showCancel: false
                })
                flag = true;
                break
              }
            }
         }
           if(!flag) {
            var spec = '';
            spec = '尺寸: '+that.data.sizename +'    颜色: '+ that.data.colorname;
            var buyNowInfo = [];
            buyNowInfo.push({ goodName: that.data.goodsDetail.goodModel.goodName, goodNum: that.data.buyNumber, goodPrice: that.data.goodsDetail.goodModel.minPrice, spec: spec, specSizeId: that.data.size, specColorId: that.data.color, goodId: that.data.goodsDetail.goodModel.goodId, picture: that.data.picModels[0].picture})
          
            wx.setStorageSync('buyNowInfo', buyNowInfo);
            wx.navigateTo({
              url: "/pages/to-pay-order/index?orderType=buyNow"
            }) 
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.goodsDetail.goodModel.goodName,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.goodModel.goodId,
      success: function (res) {
        // 转发成功
        console.log("转发成功")
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败")
      }
    }
  }
})
