import Service from '@ember/service';
import AV from 'leancloud-storage/live-query';
import ENV from 'metal-bat-web/config/environment';
export default class LiveQueryService extends Service {
  constructor() {
    super(...arguments);
    AV.init({
      appId: ENV.LEANCLOUD_ENV.APP_ID,
      appKey: ENV.LEANCLOUD_ENV.APP_KEY,
      masterKey: ENV.LEANCLOUD_ENV.APP_MASTER_KEY,
    });

    this.AV = AV;
  }
}
