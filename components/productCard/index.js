// components/card/card.js
Component({
  externalClasses: ['card-class'],

  options: {
    multipleSlots: true
  },

  /**
   * 组件的属性列表
   */
  properties: {
    thumb: {
      type: Array,
      value: []
    },
    info: {
      type: Array,
      value: []
    },
    price: String,
    priceRight: String,
    orderBtn: Boolean,
    mealType: String,
    mealId: String
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleOrderTap: function (e) {
      this.triggerEvent('handleOrder', { ...e.currentTarget.dataset });
    },
    handleThumb: function () {
      const { thumb } = this.data;
      wx.previewImage({
        current: thumb[0],
        urls: thumb
      })
    }
  }
})
