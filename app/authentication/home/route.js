import Route from '@ember/routing/route';
import { FEASURE_LIST } from 'metal-bat-web/utils/constants';
import { inject as service } from '@ember/service';

export default class AuthenticationHomeRoute extends Route {
  @service genos;

  async model() {
    const isShowReleaseModal = await this.genos.showFeature(
      FEASURE_LIST.SHOW_RELEASE_MODAL
    );
    return {
      isShowReleaseModal
    }
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.isShowReleaseModal = model.isShowReleaseModal;
  }
}
