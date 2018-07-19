import req from '../../utils/request.js';
Page({
  data: {
    cashRedList:[]
  },
  onLoad(options) {
  
  },
  onShow() {
    this.fetchCashRedList();
  },
  fetchCashRedList(){
    const mobile = wx.getStorageSync('token') || '';
    const data={
      form:{
        "interNumber": "10000008",
        mobile
      }
    };
    wx.showNavigationBarLoading();
    req.post('/getCashRedList',data)
    .then(data=>{
      const { code,body:{ cashRedList=[] } } = data;
      if(code-0 === 200){
        wx.hideNavigationBarLoading();
        this.setData({
          cashRedList
        });
      }
    });
  }
})