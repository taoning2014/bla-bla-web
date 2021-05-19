import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
export default class AuthenticationRoomRoute extends Route {
  @service liveQuery;

  async model({ room_id: roomId }) {
    const roomQuery = new this.liveQuery.AV.Query('Room');
    let room;

    try {
      room = await roomQuery.get(roomId);
      this.isLeanCloudError = false;
    } catch (e) {
      this.isLeanCloudError = true;
      return;
    }

    this.roomId = roomId;
    return room.toJSON();
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    if (this.isLeanCloudError) {
      controller.currentState = controller.state.ERROR.LEAN_CLOUD;
      return;
    }

    controller.currentState = controller.state.LOADING;
    controller.roomId = this.roomId;
    controller.join();
    controller.isDisconnectUser = false;
  }

  resetController(controller) {
    controller.roomUsers.clear();
  }

  @action
  willTransition() {
    this.controller.disconnectUser();
  }
}
