import { User } from '../../utils/user';

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    cancelText: String,
    confirmText: String
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    cancelAction: function(e) {
      // const formId = e.detail.formId || '';
      // this.triggerEvent('cancel', { formId });
      console.log('取消')
    },
    confirmAction: function(e) {
      // const formId = e.detail.formId || '';
      // this.triggerEvent('cancel', { formId });
      console.log('确认')
    },
    // 获取用户头像信息
    bindGetUserInfo(e) {
      const userInfo = e.detail.userInfo;
      if (userInfo) {
        const user = new User();
        user.update(userInfo)
          .then(res => {
            this.triggerEvent('update', { user: res.data.user });
          })
      }
    },
  }
})
