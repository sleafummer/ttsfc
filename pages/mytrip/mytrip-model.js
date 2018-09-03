import { Base } from '../../utils/base.js'

class Mytrip extends Base {
  constructor() {
    super();
  }

  getMyTrips(data, callback) {
    const params = {
      url: '/trip/list/get/my',
      type: 'POST',
      data,
      callback
    }
    this.request(params);
  }
}

export { Mytrip }
