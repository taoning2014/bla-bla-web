import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { FEATURE_LIST } from 'metal-bat-web/utils/constants';

export default class AuthenticationHomeController extends Controller {
  @tracked isShowReleaseModal;

  @service genos;

  @action
  async closeFeatureModal() {
    this.isShowReleaseModal = false;
    this.genos.setFeature(FEATURE_LIST.SHOW_RELEASE_MODAL, false);
  }
}
