import req from '../../utils/request.js';
import { getCurrentDate } from '../../utils/util.js';
const Dialog = require('../../components/dialog/dialog');

Page({
  data: {
    dateTab: {
      // list: [{
      //   id: 0,
      //   title: '今天',
      //   content: "6月20日"
      // }, {
      //   id: 1,
      //   title: '周3',
      //   content: '6月21日'
      // }, {
      //   id: 2,
      //   title: '周4',
      //   content: '6月21日'
      // }, {
      //   id: 3,
      //   title: '周5',
      //   content: '6月21日'
      // }, {
      //   id: 4,
      //   title: '周6',
      //   content: '6月21日'
      // }, {
      //   id: 5,
      //   title: '周7',
      //   content: '6月21日'
      // }],
      selectedId: 0,
      scroll: true
    },
    // products: [
    //   {
    //     thumb: [
    //       'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
    //       'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
    //       'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    //     ],
    //     info: ["主食：鱼香肉丝", "配菜：酸辣土豆丝 番茄炒蛋", "主食：米饭", "例汤：紫菜蛋花汤"],
    //     price: "11",
    //     icon: "icon-lunch"
    //   }, {
    //     // thumb: 'https://img.yzcdn.cn/upload_files/2016/11/25/FpqPXlrMRjKwJs8VdTu3ZDJCj4j5.jpeg?imageView2/2/w/200/h/200/q/90/format/jpeg',
    //     thumb: [
    //       'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
    //       'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
    //       'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    //     ],
    //     info: ["主食：鱼香肉丝", "配菜：酸辣土豆丝 番茄炒蛋", "主食：米饭", "例汤：紫菜蛋花汤"],
    //     price: "22",
    //     icon: "icon-dinner"
    //   }
    // ]
  },
  onShow() {
    this.getMealList()
  },
  getMealList() {
    wx.showLoading({
      title: "加载中",
      mask: true
    });

    // const mobile = wx.getStorageSync('token') || '';
    const params = {
      form: {
        "interNumber": "20000001",
        // mobile
      }
    };
    wx.showNavigationBarLoading();
    req.post('/getMealList', params)
      .then(res => {
        wx.hideLoading()
        const {
          code,
          body: {
            checkStatus,
            data = [],
            resultCode
          }
        } = res;
        if (resultCode === '000000') {
          wx.hideNavigationBarLoading();
          this.setData({
            data,
            checkStatus
          });
          this.renderTab(data);
          this.renderProducts(data);
        }
    });
  },
  renderTab(data) {
    const tabs = data.map((item, index) => {
      return {
        id: index,
        title: item.weekday,
        content: item.date
      }
    });
    this.setData({
      [`dateTab.list`]: tabs
    });
  },
  renderProducts(data, tab = 0) {
    const { list,orderDate } = data[tab]
    // console.log(list)

    const infoDict = {
      '主菜': 'mainFood',
      '配菜': 'secondFood',
      '主食': 'mainMeal',
      '例汤': 'soup',
    };
    const iconDict = {
      '1': 'icon-lunch',
      '2': 'icon-dinner'
    };
    const products = list.map(item => {
      const product =  {
        thumb: item.images.split(","),
        info: [],
        price: item.amount,
        icon: iconDict[item.mealType],
        mealId: `${item.mealId}`,
        orderStatus: item.orderStatus,
        mealType: item.mealType,
        dataTime:orderDate,
        canOrder:item.canOrder
      };
      for (const key in infoDict) {
        if (item[infoDict[key]]) {
          product.info.push(`${key}：${item[infoDict[key]]}`);
        }
      }

      return product;
    });
    products.sort((a, b) => a.mealType - b.mealType);
    this.setData({ products });
  },
  // 立即签到
  handleSignIn() {
    console.log("立即签到");
    const mobile = wx.getStorageSync('token') || '';
    if(mobile === ''){
      wx.navigateTo({
        url: '/pages/login/index'
      });
    }else{
      const params = {
        form: {
          interNumber: "50000001",
          mobile
        }
      };
      req.post('/saveDaySignIn', params)
        .then(res => {
          const {
            body: {
              resultCode
            }
          } = res;
          if (resultCode === '000000') {
            Dialog({
              title: '',
              message: '',
              selector: '#zan-dialog-sign',
              // buttonsShowVertical: true,
              buttons: [{
                text: '关闭',
                type: 'cancel'
              }, {
                color: '#3CC51F',
                text: '分享',
                type: 'share',
                openType: 'share'
              }]
            }).then(({ type }) => {
              // console.log('=== dialog with vertical buttons ===', `type: ${type}`);
            });
          }
      });
      
    }
    
  },
  // 日期tab
  dateTabchange({ detail = '' }) {
    this.setData({
      [`dateTab.selectedId`]: detail
    });
    this.renderProducts(this.data.data, detail);
  },
  // 立即预约
  handleOrder({ detail = {} }) {
    console.log(detail);
    const { checkStatus } = this.data;
    const checkStatusDict = {
      '2': '审核失败',
      '0': '待审核',
      '1': '审核通过',
      'canOrder':'不能预约'
    }
    const { mealtype, mealid,canorder,datatime } = detail;
    const hours = new Date().getHours();
    const currentTime = getCurrentDate();
    const token = wx.getStorageSync('token');
    if (token === '') {
      // 跳转登录
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return;
    } else if (`${checkStatus}` !== '1') {
      wx.showToast({
        title: checkStatusDict[`${checkStatus}`]
      });
      return;
    }else if(canorder == 0  ){
      wx.showToast({
        title: checkStatusDict['canOrder']
      });
      return ;
    }
    if(currentTime === datatime){
      if(mealtype == 1 && hours >=15  ){
        wx.showToast({
          title: '无法预订午餐'
        });
        return ;
      }
      if(mealtype == 2 && hours >=21  ){
        wx.showToast({
          title: '无法预订当天餐'
        });
        return ;
      }
    }
    
    const currentDateTab = this.data.dateTab.list[this.data.dateTab.selectedId];
    
    const params = {
      orderDate: currentDateTab.content,
      mealType: mealtype
    };
    // 当前点击的商品信息
    const { products } = this.data;
    const product = products.find(item => item.mealId === mealid);
    product.dataTime = datatime;
    product.orderDate = currentDateTab.content;
    delete product.icon;
    wx.setStorageSync('product', product);
    wx.navigateTo({
      url: '/pages/appointment/index'
    })

    // const productStorage = wx.getStorageSync('product')
    // console.log(productStorage)
    // console.log("立即预约", params, product)
  },
  onShareAppMessage() {
    return {
      title: '迅羽司机之家',
      // imageUrl: 'https://img.yzcdn.cn/public_files/2017/02/06/ee0ebced79a80457d77ce71c7d414c74.png'
    };
  },
})