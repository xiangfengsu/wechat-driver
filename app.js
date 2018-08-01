//app.js

import req from './utils/request.js';
const config = {
  // serverUrl: 'http://118.190.154.11:3000/mock/18/wx'
  serverUrl:'https://api.1soche.com/wx'
  // serverUrl:'http://192.168.2.230:8080/wx'
};
App({
  onLaunch: function () {
    // 登录
    this.configReq();
    wx.login({
      success: res => {
        console.log(res);
        const { code } = res;
        const data = {
          form:{
            interNumber:'10000009',
            code
          }
        };
        req.post('/wxLogin',data)
        .then(data=>{
          const { resultCode,businessResult='',openid } = data.body;
          if(resultCode === '000000'){
            wx.setStorageSync('openid',openid);
          }else{
            wx.showToast({
              title:`授权失败-${businessResult}`
            });
          }
        })
       
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              console.log(this.globalData.userInfo);
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    
  },
  configReq() {
    // wx.setStorageSync('token','18516602043');
    req.baseUrl(config.serverUrl)
      .interceptor(res => {
        switch(res.data.code-0){
          case 200:
            const { resultCode,businessResult='' } = res.data.body;
            if(resultCode!=='000000'){
              wx.showToast({
                title:businessResult,
                icon:'none'
              });
            }
            return true;
          default:
            wx.showToast({
              title: '操作失败',
            })
            return false;
        }
      })
  },
  globalData: {
    userInfo: null
  }
})