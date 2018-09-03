let app = getApp();
const readyUser = () => {
  const userInfo = app.globalData.userInfo;
  const promise = new Promise((resolve, reject) => {
    if (userInfo) { // 当用户通过正常的跳转进入该页面(用户信息已经获取并存储在globalData中)
      resolve(userInfo);
    } else { // 当用户直接进入该页面(通过二维码或者分享链接)
      app.userInfoCallback = userInfo => {
        resolve(userInfo);
      }
    }
  })
  return promise;
}

module.exports = {
  readyUser
}
