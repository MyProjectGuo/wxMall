var commonCityData = require('../../utils/city.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    linkMan:'',
    mobile:"",
    address:'',
    code:'',
    provinces:[],
    citys:[],
    districts:[],
    selProvince:'请选择',
    selCity:'请选择',
    selDistrict:'请选择',
    selProvinceIndex:0,
    selCityIndex:0,
    selDistrictIndex:0,
    addressId:''
  },
  bindCancel:function () {
    wx.navigateBack({})
  },
  bindSave: function(e) {
    console.log('测试' + this.data.addressId)
    var that = this;
    var linkMan = e.detail.value.linkMan;
    var address = e.detail.value.address;
    var mobile = e.detail.value.mobile;
    var code = e.detail.value.code;
    if (linkMan == ""){
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel:false
      })
      return
    }
    if (mobile == ""){
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel:false
      })
      return
    }
    if (!/^[1][3,4,5,7,8][0-9]{9}$/.test(mobile)) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号码！',
        showCancel: false
      })
      return
    }
    if (that.data.selProvince == "请选择"){
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel:false
      })
      return
    }
    if (that.data.selCity == "请选择"){
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel:false
      })
      return
    }
    if (address == ""){
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel:false
      })
      return
    }
    if (code == ""){
      wx.showModal({
        title: '提示',
        content: '请填写邮编',
        showCancel:false
      })
      return
    }
    if (that.data.addressId == undefined){
      var cityId = commonCityData.cityData[that.data.selProvinceIndex].cityList[that.data.selCityIndex].name;
      var districtId;
      if (that.data.selDistrict == "请选择" || !that.data.selDistrict) {
        districtId = '';
      } else {
        districtId = commonCityData.cityData[that.data.selProvinceIndex].cityList[that.data.selCityIndex].districtList[that.data.selDistrictIndex].name;
      }
      var params = {
        "busiInfo": {
          "openId": wx.getStorageSync('openId'),
          "contactName": linkMan,
          "contactNum": mobile,
          "provinceId": commonCityData.cityData[that.data.selProvinceIndex].name,
          "cityId": cityId,
          "districtId": districtId,
          "loco": address,
          "code": code
        },
        "pubInfo": {
          "channelId": "web",
          "opId": "1"
        }
      };
      wx.request({
        url: app.globalData.webAdderss + 'acc/addAddr.bz',
        data: { inParam: JSON.stringify(params) },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        success: function (res) {
          if (res.data.statusCode == 200) {
            wx.hideLoading();
            wx.showToast({
              title: '添加成功',
              icon: 'success',
              duration: 2000
            })
            // 跳转到结算页面
            wx.navigateBack({})
          } else {
            wx.showModal({
              title: '提示',
              content: '请求失败，请稍后重试',
              showCancel: false
            })
          }
        }
      })
    } else{
      var cityId = commonCityData.cityData[that.data.selProvinceIndex].cityList[that.data.selCityIndex].name;
      if (cityId == '东城区'){
        var params = {
        "busiInfo": {
          "addressId": that.data.addressId,
          "contactName": linkMan,
          "contactNum": mobile,
          "provinceId": that.data.selProvince,
          "cityId": that.data.selCity,
          "districtId": that.data.selDistrict,
          "loco": address,
          "code": code
        },
        "pubInfo": {
          "channelId": "web",
          "opId": "1"
        }
      };
      wx.request({
        url: app.globalData.webAdderss + 'acc/updateAddr.bz',
        data: { inParam: JSON.stringify(params) },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        success: function (res) {
          if (res.data.statusCode == 200) {
            wx.showToast({
              title: '修改成功',
              icon: 'success',
              duration: 2000
            })
            // 跳转到结算页面
            wx.navigateBack({})
          } else {
            wx.showModal({
              title: '提示',
              content: '请求失败，请稍后重试',
              showCancel: false
            })
          }
        }
      })
      }else{
        var districtId;
        if (that.data.selDistrict == "请选择" || !that.data.selDistrict) {
          districtId = '';
        } else {
          districtId = commonCityData.cityData[that.data.selProvinceIndex].cityList[that.data.selCityIndex].districtList[that.data.selDistrictIndex].name;
        }
        var params = {
          "busiInfo": {
            "addressId": that.data.addressId,
            "contactName": linkMan,
            "contactNum": mobile,
            "provinceId": commonCityData.cityData[that.data.selProvinceIndex].name,
            "cityId": cityId,
            "districtId": districtId,
            "loco": address,
            "code": code
          },
          "pubInfo": {
            "channelId": "web",
            "opId": "1"
          }
        };
        wx.request({
          url: app.globalData.webAdderss + 'acc/updateAddr.bz',
          data: { inParam: JSON.stringify(params) },
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          method: 'POST',
          success: function (res) {
            if (res.data.statusCode == 200) {
              wx.showToast({
                title: '修改成功',
                icon: 'success',
                duration: 2000
              })
            // 跳转到结算页面
              wx.navigateBack({})
            } else {
              wx.showModal({
                title: '提示',
                content: '请求失败，请稍后重试',
                showCancel: false
              })
            }
          }
        })
      }
      
    }
    
  },
  initCityData:function(level, obj){
    if(level == 1){
      var pinkArray = [];
      for(var i = 0;i<commonCityData.cityData.length;i++){
        pinkArray.push(commonCityData.cityData[i].name);
      }
      this.setData({
        provinces:pinkArray
      });
    } else if (level == 2){
      var pinkArray = [];
      var dataArray = obj.cityList
      for(var i = 0;i<dataArray.length;i++){
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        citys:pinkArray
      });
    } else if (level == 3){
      var pinkArray = [];
      var dataArray = obj.districtList
      for(var i = 0;i<dataArray.length;i++){
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        districts:pinkArray
      });
    }
    
  },
  bindPickerProvinceChange:function(event){
    var selIterm = commonCityData.cityData[event.detail.value];
    this.setData({
      selProvince:selIterm.name,
      selProvinceIndex:event.detail.value,
      selCity:'请选择',
      selCityIndex:0,
      selDistrict:'请选择',
      selDistrictIndex: 0
    })
    this.initCityData(2, selIterm)
  },
  bindPickerCityChange:function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
    this.setData({
      selCity:selIterm.name,
      selCityIndex:event.detail.value,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(3, selIterm)
  },
  bindPickerChange:function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[event.detail.value];
    if (selIterm && selIterm.name && event.detail.value) {
      this.setData({
        selDistrict: selIterm.name,
        selDistrictIndex: event.detail.value
      })
    }
  },
  onLoad: function (e) {
    var that = this;
    this.initCityData(1);
    that.setData({
      addressId:e.id
    })
    var id = e.id;
    if (id) {
      // 初始化原数据
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
            that.setData({
              id:id,
              addressData: res.data.data,
              selProvince: res.data.data.provinceId,
              selCity: res.data.data.cityId,
              selDistrict: res.data.data.districtId
              });
            that.setDBSaveAddressId(res.data.data);
          } else {
            wx.showModal({
              title: '提示',
              content: '无法获取快递地址数据',
              showCancel: false
            })
          }
        }
      })
    }
  },
  setDBSaveAddressId: function(data) {
    var retSelIdx = 0;
    for (var i = 0; i < commonCityData.cityData.length; i++) {
      if (data.provinceId == commonCityData.cityData[i].id) {
        this.data.selProvinceIndex = i;
        for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
          if (data.cityId == commonCityData.cityData[i].cityList[j].id) {
            this.data.selCityIndex = j;
            for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
              if (data.districtId == commonCityData.cityData[i].cityList[j].districtList[k].id) {
                this.data.selDistrictIndex = k;
              }
            }
          }
        }
      }
    }
   },
  selectCity: function () {
    
  },
  deleteAddress: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    console.log(id)
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          var params = {
            "busiInfo": {
              "addressId": id
            },
            "pubInfo": {
              "channelId": "web",
              "opId": "1"
            }
          };
          wx.request({
            url: app.globalData.webAdderss + 'acc/deleteAddr.bz',
            data: { inParam: JSON.stringify(params) },
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: 'POST',
            success: function(res){
              if (res.data.statusCode == 200){
                wx.showToast({
                  title: '已删除',
                  icon: 'success',
                  duration: 2000
                })
                wx.navigateBack({})
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  readFromWx : function () {
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        let provinceName = res.provinceName;
        let cityName = res.cityName;
        let diatrictName = res.countyName;
        let retSelIdx = 0;
        for (var i = 0; i < commonCityData.cityData.length; i++) {
          if (provinceName == commonCityData.cityData[i].name) {
            that.data.selProvinceIndex = i;
            for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
              if (cityName == commonCityData.cityData[i].cityList[j].id) {
                that.data.selCityIndex = j;
                for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                  if (diatrictName == commonCityData.cityData[i].cityList[j].districtList[k].id) {
                    that.data.selDistrictIndex = k;
                  }
                }
              }
            }
          }
        }

        that.setData({
          wxaddress: res,
          selProvince: provinceName,
          selCity: cityName,
          selDistrict: diatrictName
        });
      }
    })
  }
})
