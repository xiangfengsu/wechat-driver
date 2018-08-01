export const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
export const getCurrentDate = ()=>{
  const date = new Date();
  const year = date.getFullYear()
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}`:date.getMonth() + 1
  const day = date.getDate()< 10 ? `0${date.getDate()}` : date.getDate();
  return `${year}-${month}-${day}`;
}

export const wechatLogoin = (req,cb)=>{
  wx.login({
    success: res => {
      console.log(res);
      const { code } = res;
      const data = {
        form:{
          interNumber:'10000009',
          code
        }
      };
      req.post('/wxLogin',data)
      .then(data=>{
        const { resultCode,businessResult='',openid } = data.body;
        if(resultCode === '000000'){
          wx.setStorageSync('openid',openid);
          cb && cb();
        }else{
          wx.showToast({
            title:`授权失败-${businessResult}`
          });
        }
      })
     
    }
  })
} 


