import { Base } from '../../utils/base.js'

class Publish extends Base {
  constructor() {
    super();
  }

  createTrip(data) {
    const params = {
      url: '/trip/create',
      data
    }
    return this.ajax(params);
  }
}

export {
  Publish
}
