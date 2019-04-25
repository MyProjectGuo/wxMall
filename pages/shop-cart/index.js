//index.js
var app = getApp()
Page({
  data: {
    goodsCartList:{},
    goodsList:{
      saveHidden:true,
      totalPrice:0,
      allSelect:true,
      noSelect:false,
      list:[]
    },
    delBtnWidth:120,    //删除按钮宽度单位（rpx）
  },
 //获取元素自适应后的实际宽度
  getEleWidth:function(w){ 
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750/2)/(w/2);  //以宽度750px设计稿做宽度的自适应
      real = Math.floor(res/scale);
      return real;
    } catch (e) {
      return false;
    }
  },
  initEleWidth:function(){
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth:delBtnWidth
    });
  },
  onShow: function () {
      this.initEleWidth();
      this.getShopCarInfo();
  },
  // 获取购物车信息
  getShopCarInfo: function () {
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
          var shopList = [];
          var shopCarInfoMem = res.data.data;
          console.log(shopCarInfoMem);
          if (shopCarInfoMem && shopCarInfoMem.list) {
            shopList = shopCarInfoMem.list
          }
          that.data.goodsList.list = shopList;
          that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), shopList);
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
  toIndexPage:function(){
      wx.switchTab({
            url: "/pages/index/index"
      });
  },

  touchS:function(e){
    if(e.touches.length==1){
      this.setData({
        startX:e.touches[0].clientX
      });
    }
  },
  touchM:function(e){
  var index = e.currentTarget.dataset.index;

    if(e.touches.length==1){
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if(disX == 0 || disX < 0){//如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      }else if(disX > 0 ){//移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-"+disX+"px";
        if(disX>=delBtnWidth){
          left = "left:-"+delBtnWidth+"px";
        }
      }
      var list = this.data.goodsList.list;
      if(index!="" && index !=null){
        list[parseInt(index)].left = left; 
        this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);
      }
    }
  },


  touchE:function(e){
    var index = e.currentTarget.dataset.index;    
    if(e.changedTouches.length==1){
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth/2 ? "margin-left:-"+delBtnWidth+"px":"margin-left:0px";
      var list = this.data.goodsList.list;
     if(index!=="" && index != null){
        list[parseInt(index)].left = left; 
        this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);

      }
    }
  },
  delItem:function(e){
    var index = e.currentTarget.dataset.index;
    var cartIds = [];
    cartIds.push(index)
    var that = this;
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
          wx.showToast({
            title: '已删除',
            icon: 'success',
            duration: 2000
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
  },
  selectTap:function(e){
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if(index!=="" && index != null){
        list[parseInt(index)].active = !list[parseInt(index)].active ; 
        this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);
      }
    var buyNowInfo = [];
    for(var i =0 ;i<list.length;i++){
      if(list[i].active == true){
        console.log(list[i].specModel)
        var spec = '';
        if (list[i].cartModel == undefined){
          buyNowInfo.push({ goodName: list[i].goodName, goodNum: list[i].cartModel.goodNum, goodPrice: list[i].minPrice, spec: spec, specColorId: '',specSizeId:'', goodId: list[i].cartModel.goodId, cartId: list[i].cartModel.cartId, picture: list[i].image })
        wx.setStorageSync('buyNowInfo', buyNowInfo);
        }else{
          spec = "尺寸："+list[i].specColorName + "   颜色："+list[i].specSizeName;
          buyNowInfo.push({ goodName: list[i].goodName, goodNum: list[i].cartModel.goodNum, goodPrice: list[i].minPrice, spec: spec, specColorId: list[i].specColorId, specSizeId: list[i].specSizeId,goodId: list[i].cartModel.goodId, cartId: list[i].cartModel.cartId, picture: list[i].image})
          wx.setStorageSync('buyNowInfo', buyNowInfo);
        }
        // var spec = '';
        // spec = list[i].specModel.color + list[i].specModel.size;
        // buyNowInfo.push({ goodName: list[i].goodName, goodNum: list[i].cartModel.goodNum, goodPrice: list[i].minPrice, spec: spec, specId: list[i].specModel.specId, goodId: list[i].cartModel.goodId, cartId: list[i].cartModel.cartId, picture: list[i].image})
        // wx.setStorageSync('buyNowInfo', buyNowInfo); 
      }
    }
   },
   totalPrice:function(){
      var list = this.data.goodsList.list;
      var total = 0;
      for(var i = 0 ; i < list.length ; i++){
          var curItem = list[i];
          if(curItem.active){
            total += parseFloat(curItem.totalPrice);
          }
      }
      total = parseFloat(total.toFixed(2));//js浮点计算bug，取两位小数精度
      return total;
   },
   allSelect:function(){
      var list = this.data.goodsList.list;
      var allSelect = false;
      for(var i = 0 ; i < list.length ; i++){
          var curItem = list[i];
          if(curItem.active){
            allSelect = true;
          }else{
             allSelect = false;
             break;
          }
      }
      return allSelect;
   },
   noSelect:function(){
      var list = this.data.goodsList.list;
      var noSelect = 0;
      for(var i = 0 ; i < list.length ; i++){
          var curItem = list[i];
          if(!curItem.active){
            noSelect++;
          }
      }
      if(noSelect == list.length){
         return true;
      }else{
        return false;
      }
   },
   setGoodsList:function(saveHidden,total,allSelect,noSelect,list){
      this.setData({
        goodsList:{
          saveHidden:saveHidden,
          totalPrice:total,
          allSelect:allSelect,
          noSelect:noSelect,
          list:list
        }
      });
      var shopCarInfo = {};
      var tempNumber = 0;
      shopCarInfo.shopList = list;
      for(var i = 0;i<list.length;i++){
        tempNumber = tempNumber + list[i].number
      }
      shopCarInfo.shopNum = tempNumber;
      // wx.setStorage({
      //   key:"shopCarInfo",
      //   data:shopCarInfo
      // })
   },
   bindAllSelect:function(){
      var currentAllSelect = this.data.goodsList.allSelect;
      var list = this.data.goodsList.list;
      if(currentAllSelect){
        for(var i = 0 ; i < list.length ; i++){
            var curItem = list[i];
            curItem.active = false;
            wx.removeStorageSync('buyNowInfo')
        }
      }else{
        var buyNowInfo = [];
        for (var i = 0; i < list.length; i++) {
          var curItem = list[i];
            curItem.active = true;
            var spec = '';
            if (list[i].specModel == undefined) {
              buyNowInfo.push({ goodName: list[i].goodName, goodNum: list[i].cartModel.goodNum, goodPrice: list[i].minPrice, spec: spec, specId: '', goodId: list[i].cartModel.goodId, cartId: list[i].cartModel.cartId, picture: list[i].image })
              wx.setStorageSync('buyNowInfo', buyNowInfo);
            } else {
              spec = list[i].specModel.color + list[i].specModel.size;
              buyNowInfo.push({ goodName: list[i].goodName, goodNum: list[i].cartModel.goodNum, goodPrice: list[i].minPrice, spec: spec, specId: list[i].specModel.specId, goodId: list[i].cartModel.goodId, cartId: list[i].cartModel.cartId, picture: list[i].image })
              wx.setStorageSync('buyNowInfo', buyNowInfo);
            }
        }
      }
      this.setGoodsList(this.getSaveHide(),this.totalPrice(),!currentAllSelect,this.noSelect(),list);
   },
   jiaBtnTap:function(e){
    var index = e.currentTarget.dataset.index;
    var cartId = e.currentTarget.dataset.key;
    var list = this.data.goodsList.list;
    if(index!=="" && index != null){
      if (list[parseInt(index)].cartModel.goodNum<100){
        list[parseInt(index)].cartModel.goodNum++; 
        console.log(list[parseInt(index)].cartModel.goodNum)
        this.updateCartCount(cartId, list[parseInt(index)].cartModel.goodNum)
      }
    } 
   },
   jianBtnTap:function(e){
    var index = e.currentTarget.dataset.index;
    var cartId = e.currentTarget.dataset.key;
    console.log('购物车Id' + cartId)
    var list = this.data.goodsList.list;
    if(index!=="" && index != null){
      if (list[parseInt(index)].cartModel.goodNum>1){
        list[parseInt(index)].cartModel.goodNum-- ;
        console.log(list[parseInt(index)].cartModel.goodNum)
        this.updateCartCount(cartId, list[parseInt(index)].cartModel.goodNum)
      }
    }
   },
   updateCartCount: function (cartId, goodNum) {
     var that = this;
     var params = {
       "busiInfo": {
         "cartId": cartId,
         "goodNum": goodNum
       },
       "pubInfo": {
         "channelId": "web",
         "opId": "1"
       }
     };
     wx.request({
       url: app.globalData.webAdderss + 'order/updateCartCount.bz',
       data: { inParam: JSON.stringify(params) },
       header: {
         "Content-Type": "application/x-www-form-urlencoded"
       },
       method: 'POST',
       success: function (res) {
         if (res.data.statusCode == 200) {
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
   },
   editTap:function(){
     var list = this.data.goodsList.list;
     for(var i = 0 ; i < list.length ; i++){
            var curItem = list[i];
            curItem.active = false;
     }
     this.setGoodsList(!this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);
   },
   saveTap:function(){
     var list = this.data.goodsList.list;
     for(var i = 0 ; i < list.length ; i++){
            var curItem = list[i];
            curItem.active = true;
     }
     this.setGoodsList(!this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);
   },
   getSaveHide:function(){
     var saveHidden = this.data.goodsList.saveHidden;
     return saveHidden;
   },
   deleteSelected:function(){
      var list = this.data.goodsList.list;
      var cartIds = [];
      for(let i = 0 ; i < list.length ; i++){
            let curItem = list[i];
            if(curItem.active){
              cartIds.push(curItem.cartModel.cartId)
            }
      }
      var that = this;
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
            wx.showToast({
              title: '已删除',
              icon: 'success',
              duration: 2000
            })
            wx.removeStorageSync('buyNowInfo')
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
    },
    toPayOrder:function(){
      wx.showLoading();
      var that = this;
      if (that.data.goodsList.noSelect) {
        wx.hideLoading();
        return;
      }
      this.navigateToPayOrder();
    },
    navigateToPayOrder:function () {
      wx.hideLoading();
      wx.navigateTo({
        url:"/pages/to-pay-order/index"
      })
    }
})
