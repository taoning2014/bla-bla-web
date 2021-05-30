import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class AuthenticationRoomRoute extends Route {
  @service liveQuery;

  async model({ room_id: roomId }) {
    const roomQuery = new this.liveQuery.AV.Query('Room');
    let room;

    const controller = this.controllerFor(this.routeName);
    this.shouldJoin = false;

    // Only disconnect the user from an existing call when they enter a new room
    if (controller.roomId && roomId !== controller.roomId) {
      await controller.disconnectUser();
      controller.roomUsers.clear();
      controller.messages.clear();
    }

    controller.currentState = controller.state.LOADING;
    controller.roomId = roomId;
    this.shouldJoin = true;

    try {
      room = await roomQuery.get(roomId);
      controller.isLeanCloudError = false;
    } catch (e) {
      controller.isLeanCloudError = true;
      this.shouldJoin = false;
      return;
    }

    return room.toJSON();
  }

  async setupController(controller) {
    super.setupController(...arguments);
    if (this.shouldJoin) {
      await controller.join();
    }
  }
}
