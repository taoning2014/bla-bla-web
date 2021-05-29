import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { MESSAGE_PREFIXES } from 'metal-bat-web/utils/constants';

export default class ReactionBoxComponent extends Component {
  @service call;
  @tracked message = '';

  @action
  sendMessage(submitEvent) {
    submitEvent.preventDefault();
    this.call.sendMessage(MESSAGE_PREFIXES.MESSAGE, this.message);
    this.message = '';
  }
}
