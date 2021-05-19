import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

const STATE = {
  signUp: 'signUp',
  error: 'error',
};
export default class RegisterController extends Controller {
  state = STATE;

  @service authentication;
  @service router;

  @tracked currentState = this.state.signUp;
  @tracked username;
  @tracked password;
  @tracked retypePassword;
  @tracked isEnteredSamePassword;
  @tracked usernameExceedLimit;
  @tracked selectAvatar = 'nes-mario';

  get isSignUpBtnDisabled() {
    const isSignUpBtnEnabled =
      !!this.username &&
      !!this.password &&
      !!this.retypePassword &&
      !this.usernameExceedLimit &&
      this.isEnteredSamePassword;
    return !isSignUpBtnEnabled;
  }

  @action
  async signUp() {
    const result = await this.authentication.signUp(
      this.username,
      this.password,
      this.selectAvatar
    );
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
    this.retypePassword = '';
    this.currentState = this.state.signUp;
  }

  @action
  usernameKeyUp() {
    if (this.username?.length > 8) {
      this.usernameExceedLimit = true;
    } else {
      this.usernameExceedLimit = false;
    }
  }

  @action
  passwordKeyUp() {
    this.isEnteredSamePassword = this.password === this.retypePassword;
  }
}
