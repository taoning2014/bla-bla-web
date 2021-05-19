import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

const STATE = {
  login: 'login',
  error: 'error',
};
export default class LoginController extends Controller {
  state = STATE;

  @service authentication;
  @service router;

  @tracked currentState = this.state.login;
  @tracked username;
  @tracked password;

  get isLoginBtnDisabled() {
    const isLoginBtnEnabled = !!this.username && !!this.password;
    return !isLoginBtnEnabled;
  }

  @action
  async login() {
    const result = await this.authentication.login(this.username, this.password);
    if (result.status === 'succeed') {
      this.router.transitionTo('authentication.home');
    } else if (result.status === 'fail') {
      this.currentState = this.state.error;
    }
  }

  @action
  reset() {
    this.username = '';
    this.password = '';
    this.currentState = this.state.login
  }
}
