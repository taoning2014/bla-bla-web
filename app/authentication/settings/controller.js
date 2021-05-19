import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const STATE = {
  setting: 'setting',
  error: 'error',
};
export default class AuthenticationSettingsController extends Controller {
  @service authentication;

  @tracked currentState = this.state.setting;
  @tracked avatar = this.authentication.avatar;
  @tracked email = this.authentication.email;
  @tracked isSaved;
  @tracked isVerifyEmailSend;

  state = STATE;

  constructor() {
    super(...arguments);
    // After email verification sent, need to fetch it on page load to get the latest data
    this.authentication.currentUser.fetch();
  }

  get isSaveBtnDisabled() {
    const isSaveBtnEnabled =
      this.email !== this.authentication.email ||
      this.avatar !== this.authentication.avatar;

    return !isSaveBtnEnabled;
  }

  @action
  chooseAvatar(avatar) {
    this.isSaved = false;
    this.avatar = avatar;
  }

  @action
  verifyEmail() {
    this.authentication.verifyEmail();
    this.isVerifyEmailSend = true;
  }

  @action
  async save() {
    try {
      if (this.avatar !== this.authentication.avatar) {
        await this.authentication.setAvatar(this.avatar);
      }

      if (this.email !== this.authentication.email) {
        await this.authentication.setEmail(this.email);
      }
    } catch (e) {
      this.currentState = this.state.error;
    }
    this.isSaved = true;
  }
}
