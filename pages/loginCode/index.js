import req from '../../utils/request.js';
const number = 5;
Page({
  data: {
    codeText:'获取验证码',
    iphone:'',
    verifyCode:-1
  },
  onLoad(option){
    const { iphone="18516602043" } = option;
    this.codeFlag = false;
    this.codeNum = number;
    this.setData({
      iphone,
      codeText:`${this.codeNum}秒后获取`
    });
    this.achieveCode();
  },
  onHide(){
    this.resetArauments();
  },
  onUnload(){
    this.resetArauments();
  },
  resetArauments(){
    this.odeFlag = false;
    this.codeNum = number;
		this.setData({
			codeText: '获取验证码'
		});
    this.timer && clearInterval(this.timer);
  },
  achieveCode(){
    const self = this;
    if(!this.codeFlag){
      this.codeFlag = true;
      this.timer = setInterval(()=> {
        if (this.codeNum === 1) {
          this.codeFlag = false;
          this.codeNum = number;
          this.setData({
            codeText: '获取验证码'
          });
          this.timer && clearInterval(this.timer);
          return;
        } else {
          this.codeNum--;
          this.setData({
            codeText: `${this.codeNum}秒后获取`
          });
        }
      }, 1000);
      this.fetchCode();
    }
  },
  fetchCode(){
    const data = {
      form:{
        interNumber:'10000002',
        mobile:this.data.iphone
      }
    };
    req.post('/sendMessage',data)
    .then(data=>{
      const { verifyCode,source,resultCode,businessResult } = data.body;

      if(resultCode == '000000'){
        wx.showToast({
          title:`验证码告诉你-${verifyCode}`,
          duration:2500,
          icon:'none'
        });
        this.verifyCode = verifyCode;
        this.source = source - 0;
      }
      
    });
  },
  loginIn(){
    const mobile = this.data.iphone;
    const data = {
      form:{
        interNumber:'10000003',
        mobile,
        smsVerifyCode:this.verifyCode
      }
    };
    req.post('/login',data)
    .then(data=>{
      const { loginToken } = data.body;
      if(loginToken !== ''){
        wx.setStorageSync('token',mobile);
        wx.reLaunch({
          url: '/pages/mine/index'
        })
      }else{
        this.showToast('登录失败');
      }
    });
  },
  showLoading(title=''){
    wx.showLoading({
      title,
      mask:true
    });
  },
  hideLoading(){
    wx.hideLoading()
  },
  showToast(title){
    wx.showToast({
      title,
      icon:'none'
    })
  },
  formSubmit(e){
    const { smsVerifyCode, mobile } = e.detail.value;
    if(smsVerifyCode === ''){
      this.showToast('验证码不能为空');
    }else if(smsVerifyCode !== this.verifyCode){
      this.showToast('验证码错误');
    }else{
      if(this.source === 1){
        // 注册
        wx.setStorageSync('mobile',mobile);
        wx.setStorageSync('registerType','create');
        wx.navigateTo({
          url: `/pages/register/index`
        })
      }else{
        this.loginIn();
      }
    }
  }
})