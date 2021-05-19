import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
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
      controller.currentState = controller.state.ERROR.LEAN_COULD;
      return;
    }

    controller.currentState = controller.state.LOADING;
    controller.roomId = this.roomId;
    controller.hosts.clear();
    controller.guests.clear();
    controller.join();
  }
}
