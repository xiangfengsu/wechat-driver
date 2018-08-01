import config from './config.js';
import req from '../../utils/request.js';
const imgList = [{
  key:'driverFrontUrl',
  url: '../../img/img_tip_0.jpg',
  title:'请上传本人驾驶证照片，要求清晰完整',
  order:0
},{
  key:'travelFrontUrl',
  url: '../../img/img_tip_1.jpg',
  title:'请上传行驶证照片，要求清晰完整',
  order:1
},{
  key:'certificateUrl',
  url: '../../img/img_tip_2.jpg',
  title:'请上传运营许可证，要求清晰完整',
  order:2
},{
  key:'carPhotoUrl',
  url: '../../img/img_tip_3.jpg',
  title:'请上传本人于车辆合照，要求清晰，无PS',
  order:3
}];
const regionData = [{
  value: '上海',
  label: '上海',
  children: [{
    value: '上海市',
    label: '上海市',
  }]
}, {
  value: '河南',
  label: '河南',
  children: [{
    value: '郑州',
    label: '郑州'
  }, {
    value: '开封',
    label: '开封'
  }]
}];

Page({
  data: {
    config,
    regionData,
    imgList,
    provinceIndex: -1,
    cityIndex: -1
  },
  onLoad(){
    // type 为 create 注册   update 修改
    // wx.setStorageSync('registerType','create');
    this.type = wx.getStorageSync('registerType');
    if(this.type === 'update'){
      wx.setNavigationBarTitle({
        title:'信息编辑'
      });
      this.initFormValue();
    }
  },
  initFormValue(){
    const formateList = (obj)=>{
      const imgList = this.data.imgList.slice(0);
      const regionData = this.data.regionData.slice(0);
      let provinceIndex = this.data.provinceIndex;
      let cityIndex = this.data.cityIndex;
      let province = '';
      let city = '';
      const newImgList = [];
      for(let key in obj){
        if(key === 'province'){
          province = obj[key];
        }
        if(key === 'city'){
          city = obj[key];
        }
        this.updateFormValue(key,obj[key]);
        imgList.forEach(item=>{
          if(item.key === key){
            newImgList[item.order] = {
              ...item,
              url:obj[key]
            };
           
          }
        });
      }
      provinceIndex = regionData.findIndex(item=>{
        return item.value === province;
      });
      cityIndex = provinceIndex !==-1 ? regionData[provinceIndex].children.findIndex(item=>{
        return item.value === city;
      }):-1;
      this.setData({
        imgList:newImgList,
        provinceIndex,
        cityIndex
      });
    }
    this.getUserInfo(data=>{
      formateList(data);
    });
  },
  regionChange(e) {
    const key = e.currentTarget.dataset.type;
    const value = e.detail.value - 0;
    const regionData = this.data.regionData;
    if (key === 'province') {
      this.setData({
        provinceIndex: value,
        cityIndex:0
      });
      this.updateFormValue('province',regionData[value].value);
      this.updateFormValue('city',regionData[value].children[0].value);
    } else {
      this.setData({
        cityIndex: value
      });
      const provinceIndex = this.data.provinceIndex;
      this.updateFormValue('city',regionData[provinceIndex].children[value].value);
    }
    
  },
  handleFieldChange(e){
    const key = e.currentTarget.dataset.key;
    const value = e.detail.detail.value;
    this.updateFormValue(key,value);
  },
  chooseImageHandle(e) {
    const self = this;
    const {
      currentTarget: {
        dataset: {
          type
        }
      }
    } = e;

    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const tempFilePaths = res.tempFilePaths;
        self.uploadFile(tempFilePaths[0],type);
      },
      fail: function () {
      },
    })
  },
  uploadFile(filestream,type){
    const self = this;
    self.showLoading('图片上传中...');
    wx.uploadFile({
      url: `${req.getBaseUrl()}/uploadImg`,
      // url:'http://127.0.0.1:7001/form',
      filePath: filestream,
      formData: {
        interNumber: 10000007,
        type
      },
      name: 'imageStream',
      header: {
        'Content-Type': 'multipart/form-data'
      },
      success: function (res) {
        // console.log('##',res)
        const { statusCode ,data } = res;
        if(statusCode === 200){
          const { body:{ imageUrl } } = JSON.parse(data);
          const imgList = self.data.imgList.slice(0);
          // console.log('imgList',imgList,type);
          const newImgList = imgList.map(item=>{
            if(item.key === type){
              return {
                ...item,
                url:imageUrl
              }
            }else{
              return item;
            }
          });
          // console.log('newImgList',newImgList);
          self.setData({
            imgList:newImgList
          });
          self.updateFormValue(type,imageUrl);
        }else if(statusCode === 413){
          wx.showToast({
            title:'文件太大，上传失败',
            icon:'none',
            mask:true
          });
        }else{
          wx.showToast({
            title:'上传失败',
            mask:true
          });
        }
        
      },
      fail: function (res) {
        wx.showToast({
          title:'上传失败',
          mask:true
        });
      },
      complete:function(){
        self.hideLoading();
      }
    });
  },
  previewImageHandle(e){
    const self = this;
    const {
      currentTarget: {
        dataset: {
          url
        }
      }
    } = e;
    const urls = [url];
    wx.previewImage({
      urls
    });
  },
  showLoading(title=''){
    wx.showLoading({
      title,
      mask:true
    });
  },
  hideLoading(){
    setTimeout(()=>{
      wx.hideLoading()
    },500);
  },
  fetchRegisterOrUpdate(formValue){
    Object.assign(formValue,{
      platenumber:formValue.platenumber.toUpperCase()
    });
    const type = this.type;
    const dic = {
      create:{
        interNumber:'10000001',
        url:'/registerUser'
      },
      update:{
        interNumber:'10000006',
        url:'/editUser'
      }
    };
    const mobile = type === 'create' ? wx.getStorageSync('mobile') : wx.getStorageSync('token');
    const url = dic[type].url;
    const interNumber = dic[type].interNumber;
    const data = {
      form:{
        interNumber,
        mobile,
        ...formValue
      }
    };
    this.showLoading('信息提交中...');
    req.post(url,data)
    .then(data=>{
      setTimeout(()=>{
        this.hideLoading();
      },500);
      const { body:{resultCode,businessResult}} = data;
      if(resultCode === '000000'){
        wx.setStorageSync('token',mobile);
        wx.reLaunch({
          url: '/pages/mine/index'
        })
      }else{
        wx.showToast({
          title:businessResult,
          mask:true,
          icon:'none'
        });
      }
    })
  },
  getUserInfo(cb){
    const token = wx.getStorageSync('token') || '';
    const data = {
      form:{
        interNumber:'10000005',
        mobile:token
      }
    };
    this.showLoading('数据加载中...');
    req.post('/queryUserInfo',data)
    .then(data=>{
      const { code , body } = data;
      if(code == 200){
        this.hideLoading();
        cb && cb(body);
      }
    })
  },
  updateFormValue(key,value){
    const self  = this;
    const configBase = self.data.config.base.slice(0);
    const newConfigBase = configBase.map(item=>{
      if(item.key === key){
        return {
          ...item,
          value
        }
      }else{
        return item;
      }
    });
    self.setData({
      config:{
        base:newConfigBase
      }
    });

  },
  validateFormValue(form){
    const self = this;
    Object.assign(form,{
      'service':form['service'].length > 0 ? form['service'][0] : ''
    });
    const formBaseArray = self.data.config.base.slice(0);
    formBaseArray.push({
      key:'service'
    });
    let flag = false;
    for(let key in form){
      if(form[key] === ''){
        const filterArray = formBaseArray.filter(item=>{
          return item.key === key;
        });
        const title = key === 'service' ? `必须同意用户服务协议` : `${filterArray[0].title}不能为空`;
        wx.showToast({
          title,
          mask:false,
          icon:'none'
        });
        flag = false;
        break;
      }else{
        flag = true;
      }
    }
    return flag;
  },
  formSubmit(e) {
    console.log(e);
    const formValue = e.detail.value;
    if(this.validateFormValue(formValue)){
      console.log('formValue',formValue);
      this.fetchRegisterOrUpdate(formValue)

    }
    
  }
})