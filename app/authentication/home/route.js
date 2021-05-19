import Route from '@ember/routing/route';
import { FEATURE_LIST } from 'metal-bat-web/utils/constants';
import { inject as service } from '@ember/service';
import { ONE_HOUR } from 'metal-bat-web/utils/constants';

export default class AuthenticationHomeRoute extends Route {
  @service genos;
  @service liveQuery;

  async model() {
    const isShowReleaseModal = await this.genos.showFeature(
      FEATURE_LIST.SHOW_RELEASE_MODAL
    );
    const twoHoursAgo = new Date(Date.now() - 2 * ONE_HOUR);
    const rooms = await new this.liveQuery.AV.Query('Room')
      .greaterThanOrEqualTo('createdAt', twoHoursAgo)
      .descending('scheduledTime')
      .descending('createdAt')
      .find();

    return {
      rooms: rooms.map((room) => room.toJSON()),
      isShowReleaseModal,
    };
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.isShowReleaseModal = model.isShowReleaseModal;
  }
}
