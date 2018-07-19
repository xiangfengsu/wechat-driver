import req from '../../utils/request.js';
Page({
  data: {
    sellerList: [],
    currentRadio: -1,
    timePicker: [{
      key:1,
      value:'11:00'
  },{
      key:2,
      value:'12:00'
  },{
      key:3,
      value:'13:00'
  },{
      key:4,
      value:'14:00'
  },{
      key:5,
      value:'15:00'
  },{
      key:6,
      value:'半小时内'
  }],
    currentTime: 6,
  },
  onLoad(){
    // this.testStorage();
    this.fetchSellerList();
  },
  handleRadioChange({ detail = {} }) {
    this.setData({
      currentRadio: detail.value
    });
  },
  handleTimePicker(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      currentTime: index,
    });
  },
  handleOrderFood(){
     const { currentRadio, sellerList,timePicker, currentTime} = this.data;
     const sellerInfo = sellerList.find(item=>{
       return item.key == currentRadio
     }) || {};
     const timeInfo = timePicker.find(item=>{
      return item.key == currentTime
    }) || {};
     Object.assign(sellerInfo,{
      orderTime:currentTime,
      orderTimeValue:timeInfo.value || ''
     });
     wx.setStorageSync('sellerInfo',sellerInfo);
     wx.navigateTo({
       url:'/pages/pay/index'
     });
  },
  testStorage(){
    const product = {
      "thumb": [
          "http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg", 
          "http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg", 
          "http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg"
      ], 
      "info": [
          "主菜：主菜", 
          "配菜：配菜", 
          "主食：主食", 
          "例汤：例汤"
      ], 
      "price": "99", 
      "mealId": "001", 
      "orderStatus": "0", 
      "mealType": "1", 
      "dataTime":"2018-06-20",
      "orderDate": "6月20日"
  };
    wx.setStorageSync('product', product)
  },
  fetchSellerList(){
    const fetchHandle = (geo)=>{
      const { mealType,dataTime } = wx.getStorageSync('product') || {}; 
      const mobile =  wx.getStorageSync('token') || ''; 
      const data={
        form:{
          interNumber: "20000002",
          mySelfGeo:geo,
          mobile,
          orderDate:dataTime,
          mealType
        }
      };
      req.post('/mealOrder',data)
      .then(data=>{
        const { body:{ sellerList=[] } } = data;
        const newSellerList = sellerList.map(item=>{
          return {
            ...item,
            key:item.sellerId
          }
        });
        this.setData({
          sellerList:newSellerList,
          currentRadio:newSellerList.length > 0 ? newSellerList[0].key : -1
        });
  
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
    
    
  }
})