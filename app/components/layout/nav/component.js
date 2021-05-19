import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LayoutNavComponent extends Component {
  @service authentication;
  @service router;

  get username() {
    return this.authentication.getUsername();
  }

  @action
  logout() {
    this.authentication.logOut();
    this.router.transitionTo('login');
  }
}
