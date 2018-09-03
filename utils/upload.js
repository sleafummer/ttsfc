import { Base } from 'base';

class Upload extends Base {
  constructor() {
    super();
  }

  // 获取图片上传token
  getToken(resourceType) {
    const params = {
      url: '/resources/uploadtoken/get',
      data: {
        resourceType
      }
    }
    return this.ajax(params);
  }
}

export { Upload }
