import { Base } from '../../utils/base'

class Mytrip extends Base {
  constructor() {
    super();
  }

  query(data) {
    const params = {
      url: '/trip/list/get/my',
      data
    }
    return this.ajax(params);
  }
}

export { Mytrip }
