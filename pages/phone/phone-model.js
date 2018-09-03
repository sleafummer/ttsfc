import { Base } from '../../utils/base.js';

class Phone extends Base {
  constructor() {
    super();
  }

  binding(data) {
    const params = {
      url: '/user/binding/phone',
      data
    };
    return this.ajax(params);
  }
}

export { Phone }
