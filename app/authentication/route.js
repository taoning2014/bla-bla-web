import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticationRoute extends Route {
  @service authentication;
  @service router;

  beforeModel() {
    const isUserAlreadyLogin = this.authentication.isLogin();
    if (!isUserAlreadyLogin) {
      this.router.transitionTo('landing');
    }
  }
}
