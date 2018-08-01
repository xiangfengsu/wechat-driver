import req from '../../utils/request.js';
import { wechatLogoin } from '../../utils/util.js';

Page({
  data: {
    // thumb: ["http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg","http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg","http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg"],
    // info: ["大米1", "大米2", "大米3", "大米4"],
    // priceRight: "18",
    thumb: [],
    info: [],
    priceRight: "",

    // name: "小红帽麻辣香锅",
    // descriptions: ["云南省 西双版纳傣族自治州 其它区", "电话：1111"],
    name: "",
    descriptions: [],
    orderTimeValue: "",

    // coupons: [{
    //   title: '迅羽优惠券',
    //   priceText: '立减五元',
    //   price: '10',
    //   current: false
    // }, {
    //   title: '迅羽优惠券',
    //   priceText: '立减十五元',
    //   price: '5',
    //   current: true
    // }],

    total: '13',
  },
  onShow() {
    // wx.setStorageSync('sellerInfo', {
    //   "sellerId": 1,
    //   "name": "小红帽麻辣香锅",
    //   "address": "云南省 西双版纳傣族自治州 其它区",
    //   "jingWeiDu": "",
    //   "mobile": "18090120912",
    //   "orderTime": "11:00"
    // })
    const sellerInfo = wx.getStorageSync('sellerInfo');
    this.renderSellerInfo(sellerInfo);
    const product = wx.getStorageSync('product');
    this.renderProduct(product);
    this.getCoupons(sellerInfo, product);
    this.setData({
      sellerInfo,
      product
    })
    // wx.getStorage({
    //   key: 'sellerInfo',
    //   success: ({ data }) => {
    //     this.renderSellerInfo(data);
    //   }
    // });
    // wx.getStorage({
    //   key: 'product',
    //   success: ({ data }) => {
    //     this.renderProduct(data);
    //   }
    // });
    // this.getCoupons(sellerInfo, product);
  },
  renderSellerInfo(data) {
    const descriptions = [];
    descriptions.push(data.address);
    descriptions.push('电话：' + data.mobile);
    this.setData({
      name: data.name,
      orderTimeValue: data.orderTimeValue,
      descriptions
    });
  },
  renderProduct(data) {
    this.setData({
      thumb: data.thumb,
      info: data.info,
      priceRight: data.price,
    });
  },
  getCoupons(sellerInfo, product) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    const mobile = wx.getStorageSync('token') || '';
    const params = {
      form: {
        interNumber: "20000003",
        mobile,
        orderDate: product.dataTime,
        mealType: product.mealType,
        sellerId: sellerInfo.sellerId,
        mealId: product.mealId
      }
    };
    wx.showNavigationBarLoading();
    req.post('/mealToPay', params)
      .then(res => {
        wx.hideLoading()
        const {
          code,
          body: {
            cashRedList=[],
            monthCardList=[],
            resultCode
          }
        } = res;
        if (resultCode === '000000') {
          wx.hideNavigationBarLoading();
          this.renderCoupons(cashRedList, monthCardList)
        }
      });
  },
  renderCoupons(cashRedList, monthCardList) {
    const coupons = [];
    let cashRed = {} ;
    let monthCard = {};
    let total = this.data.priceRight;
    const cashRedIdDict = {
      '1': '注册红包',
      '2': '推荐红包'
    };
    if(cashRedList.length>0){
      cashRed = Object.assign(cashRedList[0],{
        accountCashId:cashRedList[0].id
      });
      coupons.push({
        title: cashRedIdDict[`${cashRed.cashRedId}`],
        priceText: `立减${cashRed.totalCash}元`,
        price: `${cashRed.totalCash}`,
        current: true,
        accountCashId: cashRed.accountCashId,
      });
      total = this.data.priceRight - cashRed.totalCash;
    }
    if(monthCardList.length>0){
      monthCard = monthCardList[0];
      coupons.push({
        title: monthCard.groupName,
        priceText: `立减${monthCard.totalCash}元`,
        price: `${monthCard.totalCash}`,
        current: false,
        monthCardId: monthCard.monthCardId
      });
    }
    this.setData({
      coupons,
      total,
      paramId: {
        accountCashId: cashRed.accountCashId
      },
      currentCouponIndex: 0,
    });
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

    // 当前选中的优惠券
    const currentCoupon = coupons[index];
    // 合计金额
    const total = this.data.priceRight - currentCoupon.price;
    const paramId = {};
    console.log(currentCoupon)
    if (currentCoupon.accountCashId) {
      paramId.accountCashId = currentCoupon.accountCashId;
    } else {
      paramId.monthCardId = currentCoupon.monthCardId;
    }
    console.log(paramId)
    this.setData({
      coupons,
      total,
      paramId,
      currentCouponIndex: index,
    });
    // this.setData({
    //   [`coupons[${index}].current`]: true
    // });
  },
  handlePay() {
    const { product, sellerInfo, paramId, total } = this.data;
    
    // 存使用的优惠券信息
    const currentCoupon = this.data.coupons.length > 0 ? this.data.coupons[this.data.currentCouponIndex] : { title:'无优惠券',price:0};
    wx.setStorageSync('payInfo', {
      couponTitle: currentCoupon.title,
      couponPrice: currentCoupon.price,
      total,
    });
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    wechatLogoin(req,()=>{
      const mobile = wx.getStorageSync('token') || '';
      const params = {
        form: {
          "interNumber": "20000004",
          mobile,
          orderDate: product.dataTime,
          mealType: product.mealType,
          orderTime:sellerInfo.orderTime,
          sellerId: sellerInfo.sellerId,
          mealId: product.mealId,
          ...paramId,
          amount: total
        }
      };
      wx.showNavigationBarLoading();
      req.post('/mealPay', params)
        .then(res => {
          wx.hideLoading()
          const {
            code,
            body:{ businessResult, openid, resultCode, nonceStr, prepayId, timeStamp, paySign }
          } = res;
          if(resultCode === '000000'){
            wx.requestPayment({
              openid,
              timeStamp,
              nonceStr,
              paySign,
              package: `prepay_id=${prepayId}`,
              signType: 'MD5',
              success:(res)=>{
                console.log('res',res);
                const { errMsg } = res;
                if(errMsg === 'requestPayment:ok'){
                  wx.navigateTo({
                    url: '/pages/paySuccess/index'
                  })
                }
              },
              'fail':(res)=>{
                console.log(res);
                wx.showToast({
                  title:'支付失败'
                });
              },
          })
          }
          wx.hideNavigationBarLoading();
      });
    });
  }
})