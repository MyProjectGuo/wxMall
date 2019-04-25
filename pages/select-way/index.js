//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
    districtList: [],
    distributionId:0
  },
  onShow: function () {
    
  },

  onLoad: function (e) {
    var that = this;
    this.getDistribution()
   },
  getDistribution: function () {
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
          res.data.data.forEach((ele) => {
            ele.active = false
          })
          that.setData({
            districtList: res.data.data,
          })
    
          console.log(that.data.districtList)
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
  choose:function(e){
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    var price = e.currentTarget.dataset.price;
    this.data.districtList.forEach((ele)=>{
      if (ele.distributionId == id){
        ele.active = !ele.active;
      }
    })
    this.setData({
      districtList: this.data.districtList
    })
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面
    prevPage.setData({//直接给上一页面赋值
      defaultDis :false,
      distributionId: id,
      distributionName:name,
      distributionPrice:price
    });
    wx.navigateBack({
      url: `/pages/to-pay-order/index`
    })
  }
})

