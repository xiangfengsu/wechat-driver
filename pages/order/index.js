const Dialog = require('../../components/dialog/dialog');
import req from '../../utils/request.js';
const mealType = {
  1:'午餐',
  2:'晚餐'
};
const orderStatus = {
  "-1":"支付失败",
  "-3":"已退款",
  "-4":"取消支付",
  0:"未支付",
  1:"支付中",
  2:"已完成",


};
Page({
  data: {
    isLogin:wx.getStorageSync('token') === "" ? false : true,
    mealType,
    orderStatus,
    orderList:[],
    isFailed: false,
    qrCodeImage:'',
    refundActionsheet: {
      show: false,
      cancelWithMask: true,
      actions: [{
        subname: `您确定需要申请退款吗？\n
        退还的款项将会自动扣除优惠金额，请知悉.`,
        loading: false
      }, {
        name: '申请退款',
        loading: false
      }],
      cancelText: '取消'
    }
  },
  onLoad() {
  },
  onShow() {
    const token = wx.getStorageSync('token');
    this.setData({
      isLogin:token!==''?true:false
    });
    token!=='' && this.fetchOrderList();
    
  },
  fetchOrderList(){
    const fetchHandle = (geo)=>{
      const mobile = wx.getStorageSync('token') || '';
      const data={
        form:{
          interNumber: "30000001",
          mySelfGeo:geo,
          mobile
        }
      };
      wx.showNavigationBarLoading();
      req.post('/getOrderList',data)
      .then(data=>{
        const { code,body:{ orderList=[],businessResult,resultCode } } = data;
        wx.hideNavigationBarLoading();
        if(resultCode === '000000'){
        
          this.setData({
            orderList
          });
        }
      });
    };
    wx.getLocation({
      type: 'gcj02',
      success:(res)=>{
        const { latitude,longitude} = res;
        const geo = `${latitude},${longitude}`;
        fetchHandle(geo);
      }
    });
    
  },
  fetchRefund(cb){
    const data={
      form:{
        "interNumber": "30000001",
      }
    };
    req.post('/refundMeal',data)
    .then(data=>{
      const { body:{flag} } = data;
      const status =  flag - 0;
      if(status === 0 || status === 1){
        cb && cb();
      }else{
        wx.showToast({
          title:'申请退款失败',
          duration:2500,
          mask:true
        });
      }
    });
  },
  // 退款
  handleRefund () {
    this.setData({
      [`refundActionsheet.show`]: true
    });
  },
  closeRefundActionsheet() {
    this.setData({
      [`refundActionsheet.show`]: false
    });
  },
  // 申请退款
  clickRefundAction ({detail}) {
    const { index } = detail;
    if (index === 1) {
      console.log("申请退款")
      // this.setData({
      //   [`refundActionsheet.actions[${index}].loading`]: true
      // });
      this.closeRefundActionsheet()
      this.fetchRefund(()=>{
        Dialog({
          title: '确认申请退款',
          message: '您的退款系统将在24小时内退还到你支付的账号上，请注意查收。',
          selector: '#zan-dialog-refund'
        }).then((res) => {
          console.log(1, res);
          this.setData({
            [`refundActionsheet.actions[${index}].loading`]: false
          });
        })
      });
      
    }
  },
  // 二维码
  handleQR (e) {
    console.log(e);
    const qrCodeImage = e.currentTarget.dataset.qrcodeurl;
    this.setData({
      qrCodeImage
    });
    Dialog({
      title: '二维码取餐',
      selector: '#zan-dialog-qr'
    }).then((res) => {
      this.fetchOrderList();
      // console.log(2, res);

    })
  },
  handleLogin(){
    wx.navigateTo({
      url:'/pages/login/index'
    });
  }
})