import { Base } from './base.js'

class User extends Base {
  constructor() {
    super()
  }

  update(data) {
    let params = {
      url: '/user/update',
      data
    };
    return this.ajax(params);
  }

  get() {
    let params = {
      url: '/user/info/get'
    };
    return this.ajax(params);
  }
}

export { User }
