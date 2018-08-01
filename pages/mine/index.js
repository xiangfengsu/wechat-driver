import req from '../../utils/request.js';
const app = getApp();
const statusDic = [{
  key:2,
  value:'审核失败'
},{
  key:0,
  value:'待审核'
},{
  key:1,
  value:'审核通过'
}];
Page({
  data: {
    avatar:'',
    loginStatus:false,
    phoneNumber:'400-820-5151'
  },
  onShow(options) {
    const token = wx.getStorageSync('token');
    token!=='' && this.getUserInfo();
  },
  
  getUserInfo(){
    const token = wx.getStorageSync('token') || '';
    const data = {
      form:{
        interNumber:'10000005',
        mobile:token
      }
    };
    req.post('/queryUserInfo',data)
    .then(data=>{
      const { name,platenumber,checkStatus,checkMessage,mobile } = data.body;
      const statusTextObj = statusDic.find(item=>{
        return item.key === checkStatus-0;
      });
      // console.log('checkStatus',checkStatus);
      this.setData({
        name,
        mobile,
        platenumber:platenumber.toUpperCase(),
        checkStatus,
        checkMessage,
        statusText:statusTextObj['value'],
        loginStatus:true
      })
    })
  },
  callTelHandle(e){
    const phoneNumber = this.data.phoneNumber;
    wx.makePhoneCall({
      phoneNumber
    })
  },
  goLoginPageHandle(){
    wx.navigateTo({
      url: '/pages/login/index'
    })
  },
  reeditHandle(){
    wx.setStorageSync('registerType','update');
    wx.reLaunch({
      url: '/pages/register/index'
    })
  },
  loginOutHandle(){
    const token = wx.getStorageSync('token') || '';
    const data = {
      form:{
        interNumber:'10000004',
        mobile:token
      }
    };
    req.post('/loginOut',data)
    .then(data=>{
      const { code } = data;
      if(code-0 === 200){
        this.setData({
          loginStatus:false
        });
        wx.clearStorageSync();
      }
    });
  }
  
})