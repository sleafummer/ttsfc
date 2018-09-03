import { Base } from '../../utils/base.js';

class Trips extends Base {
  constructor() {
    super();
  }

  query(data) {
    const params = {
      url: '/trip/list/get/all',
      data
    }
    return this.ajax(params);
  }
}

export { Trips }
