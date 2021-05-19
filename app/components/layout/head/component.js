import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

const DEFAULT_TITLE = 'Bla Bla Club';
const DEFAULT_DESCRIPTION = 'Welcome Friends';

export default class LayoutHeadComponent extends Component {
  @service authentication;
  @service roomNotice;
  @service router;

  get avatar() {
    return this.authentication.getAvatar();
  }

  get username() {
    return this.authentication.getUsername();
  }

  get title() {
    return this.args.title || DEFAULT_TITLE;
  }

  get description() {
    return this.args.description || DEFAULT_DESCRIPTION;
  }

  @action
  logout() {
    this.authentication.logOut();
    this.router.transitionTo('login');
  }
}
