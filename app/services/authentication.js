import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {action} from '@ember/object';
export default class AuthenticationService extends Service {
  @service liveQuery;
  @tracked currentUser;

  constructor() {
    super(...arguments);
    this.User = this.liveQuery.AV.User;
    this.currentUser = this.User.current();
  }

  async signUp(username, password, selectAvatar) {
    const user = new this.User();
    user.setUsername(username);
    user.setPassword(password);
    user.set('avatar', selectAvatar);

    try {
      const userObj = await user.signUp();
      this.currentUser = user;
      return { status: 'succeed', userObj };
    } catch (e) {
      return { status: 'fail' };
    }
  }

  async login(username, password) {
    try {
      const user = await this.User.logIn(username, password);
      this.currentUser = user;
      return { status: 'succeed', user };
    } catch (error) {
      return { status: 'fail' };
    }
  }

  logOut() {
    this.User.logOut();
  }

  isLogin() {
    return !!this.User.current();
  }

  get avatar() {
    return this.currentUser.get('avatar');
  }

  get email() {
    return this.currentUser.get('email');
  }

  get emailVerified() {
    return this.currentUser.get('emailVerified');
  }

  async setAvatar(avatar) {
    this.currentUser.set('avatar', avatar);
    await this.currentUser.save();
  }

  async setEmail(email) {
    this.currentUser.setEmail(email);
    await this.currentUser.save();
  }

  getUsername() {
    return this.currentUser.get('username');
  }

  getUserId() {
    return this.currentUser.get('objectId');
  }

  @action
  verifyEmail() {
    this.User.requestEmailVerify(this.email);
  }
}
