import req from '../../utils/request.js';
const app = getApp();
const statusDic = [{
  key:-1,
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
  onLoad(options) {
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
      const { name,platenumber,checkStatus,mobile } = data.body;
      const statusTextObj = statusDic.find(item=>{
        return item.key === checkStatus-0;
      });
      console.log('checkStatus',checkStatus);
      this.showUserInfo();
      this.setData({
        name,
        mobile,
        platenumber,
        checkStatus,
        statusText:statusTextObj['value'],
        loginStatus:true
      })
    })
  },
  showUserInfo(){
    if (app.globalData.userInfo) {
      this.setData({
        avatar: app.globalData.userInfo.avatarUrl,
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          avatar: app.globalData.userInfo.avatarUrl,
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            avatar: app.globalData.userInfo.avatarUrl,
          })
        }
      })
    }
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