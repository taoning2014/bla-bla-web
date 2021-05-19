import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class AuthenticationCreateRoomController extends Controller {
  @service authentication;
  @service liveQuery;

  @tracked title;
  @tracked isRoomCreateSucceed;
  @tracked isRoomCreateFail;

  get isCreateBtnDisabled() {
    return !this.title || this.isRoomCreateSucceed || this.isRoomCreateFail;
  }

  @action
  async create() {
    const userId = this.authentication.getUserId();
    const room = new this.liveQuery.AV.Object('Room');
    room.set('title', this.title);
    room.set('description', this.description);
    room.set('adminUser', userId);
    try {
      const roomObj = await room.save();
      this.roomId = roomObj.id;
    } catch (e) {
      this.isRoomCreateFail = true;
      return;
    }
    this.isRoomCreateSucceed = true;
  }

  @action
  reset() {
    this.title = '';
    this.description = {};
    this.isRoomCreateFail = false;
    this.isRoomCreateSucceed = false;
  }
}
