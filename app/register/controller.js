import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { INVITATION_CODE_LENGTH } from 'metal-bat-web/utils/constants';

const STATE = {
  signUp: 'signUp',
  error: 'error',
  invalidInviteCode: 'invalidInviteCode',
};
export default class RegisterController extends Controller {
  state = STATE;

  @service authentication;
  @service liveQuery;
  @service router;

  @tracked currentState = this.state.signUp;
  @tracked username;
  @tracked password;
  @tracked retypePassword;
  @tracked isEnteredSamePassword;
  @tracked inviteCode = '';
  @tracked usernameExceedLimit;
  @tracked selectAvatar = 'nes-mario';

  get isSignUpBtnDisabled() {
    const isSignUpBtnEnabled =
      !!this.username &&
      !!this.password &&
      !!this.retypePassword &&
      !this.usernameExceedLimit &&
      this.isEnteredSamePassword &&
      this.inviteCode.length === INVITATION_CODE_LENGTH;
    return !isSignUpBtnEnabled;
  }

  @action
  async signUp() {
    try {
      const [inviteCode] = await new this.liveQuery.AV.Query('InviteCode')
        .equalTo('inviteCode', this.inviteCode)
        .find();
      if (!inviteCode || inviteCode.get('isVested')) {
        this.currentState = this.state.invalidInviteCode;
        return;
      } else {
        inviteCode.set('isVested', true);
        await inviteCode.save();
      }
    } catch (e) {
      this.currentState = this.state.invalidInviteCode;
      return;
    }

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

  @action
  chooseAvatar(avatar) {
    this.selectAvatar = avatar;
  }
}
