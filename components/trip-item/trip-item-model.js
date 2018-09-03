import { Base } from '../../utils/base'

class Trip extends Base {
  constructor () {
    super()
  }

  preTogether (data) {
    const params = {
      url: '/trip/together/request',
      data
    }
    return this.ajax(params);
  }
}

export { Trip }
