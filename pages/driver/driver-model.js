import { Base } from '../../utils/base.js';

class Driver extends Base {
  constructor() {
    super();
  }

  uploadResourceId(resourceId) {
    const params = {
      url: '/resources/status/update',
      data: {
        resourceId
      }
    }
    return this.ajax(params);
  }
}

export { Driver }
