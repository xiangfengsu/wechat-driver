const METHOD={
    GET:'GET',
    POST:'POST'
  }
  class Request{
    _header={
      token:null
    }
    _baseUrl=null
  
    interceptors = []
    intercept(res){
      return this.interceptors
                    .filter(f=> typeof f === 'function')
                    .every(f=> f(res))
    }
    request({url,method,header={},data}){
      const token = wx.getStorageSync('token') || '';
      const deviceInfo = wx.getSystemInfoSync() || '';
      const openid  = wx.getStorageSync('openid') || '';
      const ndata = Object.assign({},data,{
        header:{
          token,
          deviceInfo:JSON.stringify(deviceInfo),
          openid
        }
      });
      return new Promise((resolve,reject)=>{
        wx.request({
          url: (this._baseUrl || '')+url,
          method: method || METHOD.GET,
          data: ndata,
          header: {
            ...this._header,
            ...header
          },
          success: res=>this.intercept(res) && resolve(res.data),
          fail:reject
        })
      })
    }
    get(url,data,header){
      return this.request({url,method:METHOD.GET,header,data})
    }
    post(url,data,header){
      return this.request({url,method:METHOD.POST,header,data})
    }
    baseUrl(baseUrl){
      this._baseUrl=baseUrl
      return this
    }
    getBaseUrl(){
      return this._baseUrl;
    }
    interceptor(f){
      if(typeof f === 'function'){
        this.interceptors.push(f)
      }
      return this
    }
  }
  export default new Request
  export {METHOD}