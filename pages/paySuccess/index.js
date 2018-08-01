Page({
  data: {
    // thumb: ["http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg","http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg","http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg"],
    // info: ["大米1", "大米2", "大米3", "大米4"],
    // priceRight: "18",
    // descriptions: ["1", "11111", "111111"],
    // coupons: [{
    //   title: '迅羽优惠券立减五元',
    //   price: '立减五元',
    // }],
  },
  onShow() {
    const sellerInfo = wx.getStorageSync('sellerInfo');
    this.renderSellerInfo(sellerInfo);
    const product = wx.getStorageSync('product');
    this.renderProduct(product);
    const payInfo = wx.getStorageSync('payInfo');
    this.renderPayInfo(payInfo);
    this.setData({ sellerInfo })
  },
  renderSellerInfo(data) {
    const descriptions = [];
    descriptions.push(data.address);
    descriptions.push('电话：' + data.mobile);
    this.setData({
      name: data.name,
      orderTimeValue: data.orderTimeValue,
      descriptions,
      addressName:data.name
    });
  },
  renderProduct(data) {
    this.setData({
      thumb: data.thumb,
      info: data.info,
      priceRight: data.price,
    });
  },
  renderPayInfo(data) {
    const coupons = [];
    coupons.push({
      title: data.couponTitle,
      price: data.couponPrice
    })
    this.setData({
      coupons,
      total: data.total
    })
  },
  handleCoupons(e) {
    const { index } = e.currentTarget.dataset;
    const coupons = this.data.coupons.map((item, itemIndex) => {
      if (itemIndex === index) {
        item.current = true;
      } else {
        item.current = false;
      }
      return item;
    });
    this.setData({ coupons });
    // this.setData({
    //   [`coupons[${index}].current`]: true
    // });
  },
  handleBack(){
    wx.switchTab({
      url:'/pages/home/index'
    })
  }
})