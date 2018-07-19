// components/mapButton/index.js
Component({
  properties: {
    mapInfo:Object
  },
  methods: {
    handleOpenMap(){
      const self = this;
      const { jingWeiDu="", address="上海市长宁区番禺路300弄", name="51汽车" } = self.data.mapInfo ||{};
      const defaultGeo = [31.210743,121.435117];
      const geo = jingWeiDu === "" ? defaultGeo:jingWeiDu.split(',') ;
      const latitude = geo.length === 2 ? (geo[0] - 0) : defaultGeo[0];
      const longitude = geo.length === 2 ? (geo[1] - 0) : defaultGeo[1];
      wx.openLocation({
        latitude: latitude,
        longitude: longitude,
        name:`${name} (${address})`
      });
    },
  }
})
