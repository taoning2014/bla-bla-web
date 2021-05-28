import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  @service call;
  @service('router') routing;

  get showBottomNav() {
    return (
      this.call.inProgress &&
      this.routing.currentRouteName !== 'authentication.room'
    );
  }

  @action
  mute() {
    this.call.mute();
  }

  @action
  unmute() {
    this.call.unmute();
  }

  @action
  endCall() {
    this.call.end();
  }
}
