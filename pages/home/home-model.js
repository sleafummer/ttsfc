import { Base } from '../../utils/base.js'

class Home extends Base {
  constructor() {
    super();
  }

  getHomeData() {
    console.log('get home data')
    var params = {
      url: '/5b33499cc8ccf61d2fd93421/ngsfc/trips'
    };
    this.request(params);
  }
}

export {Home}
