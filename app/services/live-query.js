import Service from '@ember/service';
import AV from 'leancloud-storage/live-query';
import ENV from 'metal-bat-web/config/environment';
export default class LiveQueryService extends Service {
  constructor() {
    super(...arguments);
    AV.init({
      appId: ENV.LEANCLOUD_ENV.APP_ID,
      appKey: ENV.LEANCLOUD_ENV.APP_KEY,
      masterKey: ENV.LEANCLOUD_ENV.APP_MASTER_KEY,
    });

    this.AV = AV;

    // Record classes
    this.RoomUser = this.AV.Object.extend('RoomUser');
  }

  async createRoomUser(
    { roomId, userId, username, avatar, role, state, isSelf } = {}
  ) {
    const roomUser = new this.RoomUser();
    roomUser.set('roomId', roomId);
    roomUser.set('userId', userId);
    roomUser.set('username', username);
    roomUser.set('avatar', avatar);
    roomUser.set('role', role);
    roomUser.set('state', state);
    roomUser.set('isSelf', isSelf);
    const roomUserObj = await roomUser.save();

    return roomUserObj;
  }
}
