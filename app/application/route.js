import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service intl;

  beforeModel() {
    // Use to test different language
    // this.intl.setLocale(['zh-Hans']);
    // this.intl.setLocale(['en-us']);
  }

}
