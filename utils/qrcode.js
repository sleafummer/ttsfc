import { Base } from 'base'

class Qrcode extends Base {
  constructor() {
    super()
  }

  get(data) {
    const params = {
      url: '/resources/minicode/get',
      data
    }
    return this.ajax(params);
  }
}

export {
  Qrcode
}
