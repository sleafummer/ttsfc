import {
  Upload
} from '../../utils/upload';
import {
  Driver
} from './driver-model.js'

const qiniuUploader = require("../../utils/qiniuUploader");

Page({
  data: {
    isAgree: false,
    cards: [{
        resourceType: 1,
        name: 'faceOfIdCard',
        label: '身份证正面',
        url: '',
        loading: false,
        token: '',
        key: '',
        resourceId: '',
        success: false
      },
      {
        resourceType: 2,
        name: 'backOfIdCard',
        label: '身份证反面',
        url: '',
        loading: false,
        token: '',
        key: '',
        resourceId: '',
        success: false
      },
      {
        resourceType: 3,
        name: 'drivingLicense',
        label: '驾驶证',
        url: '',
        loading: false,
        token: '',
        key: '',
        resourceId: '',
        success: false
      },
      {
        resourceType: 4,
        name: 'vehicleTravelLicense',
        label: '行驶证',
        url: '',
        loading: false,
        token: '',
        key: '',
        resourceId: '',
        success: false
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  // 第一步: 选择图片
  chooseIdImage: function(e) {
    const dataset = e.currentTarget.dataset
    const name = dataset.name;
    const resourceType = dataset.resourcetype;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 压缩的
      sourceType: ['album'],
      success: res => {
        const tempFilePath = res.tempFilePaths[0]
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片

        this.getUploadTokenFromServer(resourceType)
          .then(res => {
            this.qiniuUpload(tempFilePath, resourceType, res.data);
          })
      }
    })
  },

  // 第二步: 获取Token
  getUploadTokenFromServer: function(resourceType) {
    let upload = new Upload();
    return upload.getToken(resourceType)
  },

  // 第三步 上传至七牛
  qiniuUpload: function(filePath, resourceType, tokenInfo) {
    const index = this.data.cards.findIndex(ele => {
      return resourceType === ele.resourceType
    });
    const loading = `cards[${index}].loading`;
    const resourceId = `cards[${index}].resourceId`;
    const url = `cards[${index}].url`;
    const success = `cards[${index}].success`;
    this.setData({
      [loading]: true // 上传中
    })
    //七牛提供的上传方法
    qiniuUploader.upload(filePath, (res) => {
      this.setData({
        [loading]: false, // 上传成功
        [success]: true, // 上传成功
        [resourceId]: tokenInfo.resourceId, // 后端传过来的需要回传
        [url]: tokenInfo.url // 图片链接
      })
    }, (error) => {
      wx.showToast({
        title: '上传失败'
      })
      this.setData({
        [loading]: false
      })
    }, {
      region: 'ECN',
      uptoken: tokenInfo.token,
      key: tokenInfo.key
    });
  },

  // 第四步 提交至服务器
  uploadToServer: function(resourceIds) {
    wx.showLoading({
      title: '正在提交',
    })
    let promises = [];
    resourceIds.forEach(resourceId => {
      const driver = new Driver();
      let promise = driver.uploadResourceId(resourceId);
      promises.push(promise);
    })
    Promise.all(promises)
      .then(function(values) {
        wx.hideLoading();
        wx.showModal({
          title: '提交成功',
          showCancel: false,
          content: '请耐心等待客服审核, 一般在1天时间',
          success: function(res) {
            wx.switchTab({
              url: '/pages/my/my'
            })
          }
        })
      })
      .catch(error => {
        wx.showToast({
          title: '提交失败'
        })
      })
  },

  // 上传
  uploadSubmit: function(e) {
    const resourceIds = [];
    const resource = this.data.cards.forEach(ele => {
      if (ele.resourceId) {
        resourceIds.push(ele.resourceId);
      }
    });
    if (resourceIds.length < 4) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '证件信息不完整'
      })
      return false;
    }
    this.uploadToServer(resourceIds);
  },

  // 同意
  bindAgreeChange: function(e) {
    this.setData({
      isAgree: !!e.detail.value.length
    });
  }
})