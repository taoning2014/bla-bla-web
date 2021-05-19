import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class AuthenticationService extends Service {
  @service liveQuery;

  constructor() {
    super(...arguments);
    this.User = this.liveQuery.AV.User;
  }

  async signUp(username, password, selectAvatar) {
    const user = new this.User();
    user.setUsername(username);
    user.setPassword(password);
    user.set('avatar', selectAvatar);

    try {
      const userObj = await user.signUp();
      return { status: 'succeed', userObj };
    } catch (e) {
      return { status: 'fail' };
    }
  }

  async login(username, password) {
    try {
      const user = await this.User.logIn(username, password);
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

  getAvatar() {
    const user = this.User.current();
    return user.get('avatar');
  }

  getUsername() {
    const user = this.User.current();
    return user.get('username');
  }

  getUserId() {
    const user = this.User.current();
    return user.get('objectId');
  }
}
