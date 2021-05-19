import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticationRoute extends Route {
  @service authentication;
  @service router;

  beforeModel(transition) {
    const isUserAlreadyLogin = this.authentication.isLogin();
    if (!isUserAlreadyLogin) {
      const loginController = this.controllerFor('login');
      loginController.previousTransition = transition;
      this.router.transitionTo('login');
    }
  }
}
