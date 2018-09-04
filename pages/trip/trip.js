import { Trip } from './trip-model';
import { Auth } from '../../utils/auth';
import { TRIP_TYPES } from '../../utils/constants';
import { Qrcode } from '../../utils/qrcode';
import { wxPromisify } from '../../utils/wxPromisify';

const wxGetImageInfo = wxPromisify(wx.getImageInfo),
  shareBgUrl = 'https://image.ngsfc.cn/ttsfc_share_bg.jpg',
  timeIcon = '/images/icon/time.png',
  fromIcon = '/images/icon/from.png',
  destIcon = '/images/icon/dest.png';

Page({
  data: {
    showShareDialog: false,
    trip: {},
    // 标记点
    markers: [{
      id: 1,
      latitude: '',
      longitude: '',
      name: '',
      address: '',
      iconPath: '/images/icon/from_marker.png',
      width: 48,
      height: 48
    }, {
      id: 2,
      latitude: '',
      longitude: '',
      name: '',
      address: '',
      iconPath: '/images/icon/dest_marker.png',
      width: 48,
      height: 48
    }],
    // 缩放视野以包含所有给定的坐标点
    includePoints: [],
    // 路线
    polyline: [{
      points: [],
      padding: [20],
      color: "#00b589",
      width: 8
    }]
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    console.log('options', options);
    // options 中的 scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
    // var scene = decodeURIComponent(options.scene)
    const scene = options.scene, // triplist: 行程列表 forward: 微信转发 scancode: 分享二维码
      tripCode = options.tripCode,
      type = options.tripType;
    if (!tripCode) {
      wx.showToast({
        title: '参数错误'
      });
      return;
    }
    this.getDetail(tripCode, type)
      .then(trip => {
        trip.date = trip.startTime.split(' ')[0];
        this.setData({ trip });
        this.__setDrivingMarkers(trip); // 设置起点终点图标
        this.__setIncludePoints(trip); // 设置缩放视野以包含所有给定的坐标点
        this.getDriving(); // 获取行程路线
      })
      .catch(() => {
        wx.showToast({ title: '数据获取失败' });
        this.__setDefaultIncludePoints();
      })
  },

  // 生命周期函数--监听页面初次渲染完成
  onReady() {
    // this.mapCtx = wx.createMapContext('myMap');
  },

  // 页面卸载时触发。如redirectTo或navigateBack到其他页面时。
  onUnload() {
    wx.removeStorageSync('trip');
  },

  // 获取详情数据
  getDetail(tripType, type) {
    const promise = new Promise((resolve, reject) => {
      let trip = this.getDetailFromStorage()
      if (trip) {
        resolve(trip);
      } else {
        this.getDetailFromServer(tripType, type)
          .then(res => {
            let trip = res.data.trip;
            if (trip) { // 查询不到数据，服务器也会成功返回，trip === null
              trip.type = type; // 服务器type没有返回，所以本地做处理
              trip.typeDesc = TRIP_TYPES[type].label;
              resolve(res.data.trip);
            } else {
              reject();
            }
          })
          .catch(() => {
            reject();
          })
      }
    })
    return promise;
  },

  // 从列表详情页获取的详情
  getDetailFromStorage() {
    return wx.getStorageSync('trip');
  },

  // 获取行程详情
  getDetailFromServer(tripCode, type) {
    const trip = new Trip();
    return trip.detail(tripCode, type);
  },

  // 设置起点终点图标
  __setDrivingMarkers(trip) {
    this.setData({
      'markers[0].latitude': trip.fromLatitude,
      'markers[0].longitude': trip.fromLongitude,
      'markers[0].name': trip.fromName,
      'markers[0].address': trip.fromAddress,
      'markers[1].latitude': trip.destLatitude,
      'markers[1].longitude': trip.destLongitude,
      'markers[1].name': trip.destName,
      'markers[1].address': trip.destAddress
    })
  },

  // 设置缩放视野以包含所有给定的坐标点
  __setIncludePoints(trip) {
    const from = {
      id: 1,
      latitude: trip.fromLatitude,
      longitude: trip.fromLongitude
    }
    const dest = {
      id: 2,
      latitude: trip.destLatitude,
      longitude: trip.destLongitude
    }
    this.setData({
      includePoints: [from, dest]
    })
  },

  //  设置默认的缩放视野
  __setDefaultIncludePoints() {
    this.setData({
      includePoints: [{
        id: 1,
        latitude: 30.63562,
        longitude: 118.97439,
        name: '富华国际社区'
      }]
    })
  },

  // 点击标记
  markertap(e) {
    const res = this.data.markers.find(ele => ele.id === e.markerId);
    wx.openLocation({
      latitude: res.latitude,
      longitude: res.longitude,
      name: res.name,
      address: res.address
    })
  },

  // 获取路线导航
  getDriving({ fromLongitude = this.data.trip.fromLongitude, fromLatitude = this.data.trip.fromLatitude, destLongitude = this.data.trip.destLongitude, destLatitude = this.data.trip.destLatitude } = {}) {
    wx.request({
      url: `https://apis.map.qq.com/ws/direction/v1/driving/?from=${fromLatitude},${fromLongitude}&to=${destLatitude},${destLongitude}&output=json&callback=cb&key=ZGKBZ-IJWCW-4CTR4-OXUFB-SUUZ2-U3BYA`,
      success: res => {
        // polyline 坐标解压  @url: http://lbs.qq.com/webservice_v1/guide-road.html#link-seven
        let coors = res.data.result.routes[0].polyline;
        for (let i = 2; i < coors.length; i++) {
          coors[i] = coors[i - 2] + coors[i] / 1000000
        }
        let points = [];
        for (let i = 0; i < coors.length; i++) {
          let latitude = '',
            longitude = '';
          if (i % 2 === 0) {
            points.push({
              latitude: coors[i],
              longitude: coors[i + 1]
            })
          }
        }
        this.setData({
          ['polyline[0].points']: points
        })
      }
    })
  },

  // 校验权限
  checkAuth(action) {
    const auth = new Auth();
    return auth.checkAuth(action);
  },

  // 打电话
  onCall() {
    const pass = this.checkAuth('trips', 'call', this.data.trip.type);
    if (pass) {
      wx.makePhoneCall({ phoneNumber: this.data.trip.user.phone })
    }
  },

  // 用户点击右上角分享
  onShareAppMessage: function(options) {
    const type = this.data.trip.type,
      typeDesc = this.data.trip.typeDesc,
      tripCode = this.data.trip.tripCode;
    return {
      title: `您收到一条${typeDesc}消息`,
      path: `/pages/trip/trip?scene=forward&tripCode=${tripCode}&tripType=${type}`
    }
  },

  // 获取分享到朋友圈图片
  onGetSharePicture() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    this.__generateSharePicture();
  },

  // 生成分享图片
  __generateSharePicture() {
    // 静态资源 需https
    const pSharebg = wxGetImageInfo({ src: shareBgUrl }), // 背景图
      pAvatar = wxGetImageInfo({ src: this.data.trip.user.avatarUrl }); // 头像
    Promise.all([pSharebg, pAvatar])
      .then(values => {
        const sharebg = values[0].path,
          avatar = values[1].path;
        // 七牛云需要配置https
        this.__getShareQrCode()
          .then(res => { // 二维码
            console.log('二维码成功获取');
            wxGetImageInfo({ src: res.data.url })
              .then(res => {
                const qrcode = res.path;
                this.__setCanvas(sharebg, qrcode, avatar);
              })
          })
          .catch(error => {
            console.log(error)
            wx.showToast({ title: '出错了' })
          })
      })
      .catch(error => {
        console.log(error);
        wx.hideLoading();
        wx.showToast({ title: '出错了' })
      })
  },

  // 获取分享图片上的二维码
  __getShareQrCode() {
    const scene = `tripCode=${this.data.trip.tripCode}&tripType=${this.data.trip.type}`,
      page = '/pages/trip/trip',
      qrcode = new Qrcode();
    return qrcode.get({ scene, page })
  },

  // 设置canvas
  __setCanvas(sharebg, qrcode, avatar) {
    const ctx = wx.createCanvasContext('shareCanvas'); // 创建 canvas 绘图上下文（指定 canvasId）
    ctx.drawImage(sharebg, 0, 0, 300, 450); // 绘制图像到画布: 底图

    // 头像
    const avatarSize = 48;
    ctx.drawImage(avatar, 20, 10, avatarSize, avatarSize);

    // 昵称
    ctx.setFontSize(18);
    ctx.fillText(this.data.trip.user.nickName, 88, 44);

    // 时间
    ctx.setFontSize(14);
    ctx.fillText(this.data.trip.date, 40, 82);
    ctx.fillText(this.data.trip.fromName, 40, 102);
    ctx.fillText(this.data.trip.destName, 40, 122);

    // icon
    const iconSize = 14;
    ctx.drawImage(timeIcon, 18, 70, iconSize, iconSize);
    ctx.drawImage(fromIcon, 18, 90, iconSize, iconSize);
    ctx.drawImage(destIcon, 18, 110, iconSize, iconSize);

    // 小程序码
    const qrImgSize = 120;
    ctx.drawImage(qrcode, 170, 10, qrImgSize, qrImgSize);

    ctx.draw(); // 将之前在绘图上下文中的描述（路径、变形、样式）画到 canvas 中
    wx.hideLoading();
    this.setData({ showShareDialog: true })
  },



  // 保存到相册
  saveSharePictrue() {
    wx.showActionSheet({
      itemList: ['保存图片到相册'],
      success: res => {
        this.__confirmSave();
      }
    })
  },

  // 保存
  __confirmSave() {
    const wxCanvasToTempFilePath = wxPromisify(wx.canvasToTempFilePath); // 把当前画布指定区域的内容导出生成指定大小的图片，并返回文件路径。
    const wxSaveImageToPhotosAlbum = wxPromisify(wx.saveImageToPhotosAlbum); // 保存图片到系统相册

    wxCanvasToTempFilePath({ canvasId: 'shareCanvas' })
      .then(res => {
        return wxSaveImageToPhotosAlbum({
          filePath: res.tempFilePath
        })
      })
      .then(res => {
        wx.showToast({
          title: '已保存到相册'
        })
      })
  },

  closeShareDialog() {
    this.setData({ showShareDialog: false })
  }
})
