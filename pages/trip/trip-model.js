import { Base } from '../../utils/base.js';

class Trip extends Base {
  constructor() {
    super();
  }

  // type required:true 因为行程放在两张表里了
  detail(tripCode, type) {
    const params = {
      url: '/trip/get/by_code',
      data: { tripCode, type }
    }

    return this.ajax(params);
  }
}

export { Trip }
