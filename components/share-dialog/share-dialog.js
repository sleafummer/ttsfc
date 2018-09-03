import { Qrcode } from '../../utils/qrcode';
import { wxPromisify } from '../../utils/wxPromisify';
import { formatTime } from '../../utils/util';

const wxGetImageInfo = wxPromisify(wx.getImageInfo),
  shareBgUrl = 'http://image.ngsfc.cn/ttsfc_share_bg.jpg',
  timeIcon = '/images/icon/time.png',
  fromIcon = '/images/icon/from.png',
  destIcon = '/images/icon/dest.png';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // trip: {
    //   type: Object,
    //   value: {},
    //   observer: function(newVal, oldVal, changedPath) {
    //     // console.log(newVal, oldVal, changedPath)
    //   }
    // }
  },

  /**
   * 组件的初始数据
   */
  data: {
    trip: {
      "id": 2,
      "tripCode": "ngsfc_2122435646_3561245504551334",
      "userId": 33,
      "type": 2,
      "typeDesc": "车找人",
      "fromName": "杭州东站",
      "fromAddress": "浙江省杭州市江干区天城路1号",
      "fromLongitude": 120.213,
      "fromLatitude": 30.29133,
      "destName": "宁国汽车站",
      "destAddress": "安徽省宣城市宁国市宁国汽车站(东城大道南)",
      "destLongitude": 119.00001,
      "destLatitude": 30.64789,
      "startTime": "2018-08-31 14:00:00",
      "endTime": "2018-08-31 20:00:00",
      "passageCount": 2,
      "remarks": "李夏测试数据",
      "user": {
        "nickName": "27",
        "gender": 1,
        "avatarUrl": "https://wx.qlogo.cn/mmopen/vi_32/B0bI018UNkS5tichONolHUyRYGTpck7NPM3EWxqaoY0o8C6PJIAUf2cLPXHIKopl0oJCax9TyzauSKibUUTMdqPw/132",
        "role": 2,
        "phone": "16605632727",
        "authStatus": null
      }
    }
  },

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function() {},
    moved: function() {},
    detached: function() {},
    ready() {
      const pSharebg = wxGetImageInfo({ src: shareBgUrl }), // 背景图
        pAvatar = wxGetImageInfo({ src: this.data.trip.user.avatarUrl }); // 头像
      Promise.all([pSharebg, pAvatar]).then(values => {
        const sharebg = values[0].path,
          avatar = values[1].path;
        this.__getShareQrCode().then(res => { // 二维码
          console.log('二维码成功获取');
          wxGetImageInfo({ src: res.data.url }).then(res => {
            const qrcode = res.path;
            this.__setCanvas(sharebg, qrcode, avatar);
          })
        })
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 设置canvas
    __setCanvas(sharebg, qrcode, avatar) {
      const ctx = wx.createCanvasContext('shareCanvas'); // 创建 canvas 绘图上下文（指定 canvasId）
      ctx.drawImage(sharebg, 0, 0, 300, 450); // 绘制图像到画布: 底图
      console.log('绘制背景');
      // 头像
      const avatarSize = 48;
      ctx.drawImage(avatar, 20, 10, avatarSize, avatarSize);

      // 昵称
      ctx.setFontSize(18);
      ctx.fillText('27', 88, 44);

      // 时间
      ctx.setFontSize(14);
      ctx.fillText(formatTime(this.data.trip.startTime).date, 40, 82);
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
    },

    // 获取二维码
    __getShareQrCode() {
      const scene = 'xxx',
        page = '',
        qrcode = new Qrcode();
      return qrcode.get({ scene, page })
    }
  }
})
