import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import AgoraRTC from 'agora-rtc-sdk-ng';
import ENV from 'metal-bat-web/config/environment';
import {
  AGORA_NETWORK_QUALITY_MAP,
  ROOM_STATE,
  USER_ROLE,
  USER_STATE,
} from 'metal-bat-web/utils/constants';
import createRoomUser from 'metal-bat-web/utils/create-room-user';
import {
  addUser,
  removeUser,
  updateUserState,
} from 'metal-bat-web/utils/user-helper';
import setVolume from 'metal-bat-web/utils/set-volume';
import { TrackedArray, TrackedObject } from 'tracked-built-ins';
export default class AuthenticationRoomController extends Controller {
  state = ROOM_STATE;
  userState = USER_STATE;
  userRole = USER_ROLE;

  @service authentication;
  @service liveQuery;
  @service roomNotice;
  @service router;

  @tracked currentState;

  hosts = new TrackedArray([]);
  guests = new TrackedArray([]);

  /**
   * @property {AgoraRTCClient} - The local client with basic functions for a voice or video call, such as joining a channel, publishing tracks, or subscribing to tracks.
   * @see {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcclient.html}
   */
  client;

  /**
   * @property {LocalAudioTrack} - The basic interface for local audio tracks, providing main methods of local audio tracks.
   * @see {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/ilocalaudiotrack.html}
   */
  localAudioTrack;

  get canHostAGuest() {
    /**
     * Agora recommends limiting the number of users sending streams concurrently to 17 at most. We put an even smaller number.
     * Refer: https://docs.agora.io/en/Voice/faq/capacity
     */
    const HOST_USERS_THRESHOLD = 10;
    return this.hosts.length < HOST_USERS_THRESHOLD && this.me.role === USER_ROLE.ADMIN;
  }

  async join() {
    await this.createRoomUser();
    await this.fetchRoomUsers();
    await this.joinChat();
  }

  async createRoomUser() {
    const userId = this.authentication.getUserId();
    const adminUserId = this.model.adminUser;
    const isAdminUser = adminUserId === userId;
    const RoomUser = this.liveQuery.AV.Object.extend('RoomUser');
    let [roomUser] = await this.findRoomUsers(userId);

    if (roomUser) {
      roomUser.get('role') === USER_ROLE.GUEST
        ? roomUser.set('state', USER_STATE.IDLE)
        : roomUser.set('state', USER_STATE.MUTED);
      await roomUser.save();
      this.me = new TrackedObject({
        ...roomUser.toJSON(),
      });
      return;
    }

    if (isAdminUser) {
      roomUser = await createRoomUser(RoomUser, {
        roomId: this.roomId,
        userId: userId,
        username: this.authentication.getUsername(),
        avatar: this.authentication.getAvatar(),
        role: USER_ROLE.ADMIN,
        state: USER_STATE.MUTED,
        isSelf: true,
      });
    } else {
      roomUser = await createRoomUser(RoomUser, {
        roomId: this.roomId,
        userId: userId,
        username: this.authentication.getUsername(),
        avatar: this.authentication.getAvatar(),
        role: USER_ROLE.GUEST,
        state: USER_STATE.IDLE,
      });
    }

    this.me = new TrackedObject({
      ...roomUser.toJSON(),
    });
  }

  async fetchRoomUsers() {
    const roomUsers = await this.findRoomUsers();

    roomUsers.forEach((item) => {
      // use unshift to make sure admin renders in front of the other hosts
      if (item.get('role') == USER_ROLE.ADMIN) {
        this.hosts.unshift(
          new TrackedObject({
            ...item.toJSON(),
          })
        );
      } else if (item.get('role') == USER_ROLE.HOST) {
        this.hosts.push(
          new TrackedObject({
            ...item.toJSON(),
          })
        );
      } else if (item.get('role') == USER_ROLE.GUEST) {
        this.guests.push(
          new TrackedObject({
            ...item.toJSON(),
          })
        );
      }
    });
  }

  async joinChat() {
    await Promise.all([this.setUpAgora(), this.setUpLiveQuery()]);
  }

  async setUpAgora() {
    AgoraRTC.setLogLevel(4);
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    const userId = this.authentication.getUserId();
    let token;

    try {
      const tokenResponse = await fetch(
        `${ENV.BLA_BLA_API}?channel=${this.roomId}&user=${userId}`,
        {
          mode: 'cors',
        }
      );
      const tokenObj = await tokenResponse.json();
      token = tokenObj.token;
    } catch (e) {
      this.currentState = this.state.ERROR.API_SERVER;
      return;
    }

    try {
      await this.client.join(ENV.AGORA_ENV.APP_ID, this.roomId, token, userId);
      this.currentState = this.state.READY;
    } catch (e) {
      this.currentState = this.state.ERROR.AGORA_CONNECT_FAIL;
    }

    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
      }
    });

    this.client.on('user-joined', async ({ uid }) => {
      const [roomUser] = await this.findRoomUsers(uid);
      const role = roomUser.get('role');
      const userId = roomUser.get('userId');

      // check to avoid duplicate push
      if ([...this.hosts, ...this.guests].findBy('userId', userId)) {
        return;
      }

      this.roomNotice.push({
        dispalyTimeMs: 2000,
        type: 'is-primary',
        message: `@${roomUser.get('username')} joined the room`,
      });

      // use unshift to make sure admin renders in front of the other hosts
      if (role === USER_ROLE.ADMIN) {
        this.hosts.unshift(new TrackedObject({ ...roomUser.toJSON() }));
      } else if (role === USER_ROLE.HOST) {
        this.hosts.push(new TrackedObject({ ...roomUser.toJSON() }));
      } else if (role === USER_ROLE.GUEST) {
        this.guests.push(new TrackedObject({ ...roomUser.toJSON() }));
      }
    });

    /**
     * In the case of user close the browser tab(instead of click "leave" button), we can use Agora's 'user-left' event
     * to remove this user from the UI.
     */
    this.client.on('user-left', async ({ uid }) => {
      const [roomUser] = await this.findRoomUsers(uid);

      this.roomNotice.push({
        dispalyTimeMs: 2000,
        type: '',
        message: `@${roomUser.get('username')} left the room`,
      });

      removeUser(this.hosts, this.guests, uid);
    });

    this.client.on('network-quality', (stats) => {
      this.me.downlinkNetworkQuality =
        AGORA_NETWORK_QUALITY_MAP[stats.downlinkNetworkQuality];
      this.me.uplinkNetworkQuality =
        AGORA_NETWORK_QUALITY_MAP[stats.uplinkNetworkQuality];
    });

    this.client.enableAudioVolumeIndicator();
    this.client.on('volume-indicator', (volumes) => {
      volumes.forEach((item) => {
        const { level, uid } = item;
        setVolume(this.hosts, uid, level);
      });
    });
  }

  async setUpLiveQuery() {
    const roomQuery = new this.liveQuery.AV.Query('Room').equalTo(
      'objectId',
      this.roomId
    );

    this._roomLiveQuery = await roomQuery.subscribe();
    this._roomLiveQuery.on('delete', async () => {
      this.currentState = this.state.CLOSED;
    });

    const roomUserQuery = new this.liveQuery.AV.Query('RoomUser').equalTo(
      'roomId',
      this.roomId
    );
    this._roomUserLiveQuery = await roomUserQuery.subscribe();
    this._roomUserLiveQuery.on('update', async (guest, [updateKey]) => {
      const userId = this.authentication.getUserId();

      if (updateKey === 'role') {
        if (guest.get('role') === USER_ROLE.HOST) {
          const user = updateUserState(
            this.guests,
            guest.get('userId'),
            USER_STATE.MUTED
          );

          this.guests.removeObject(user);
          addUser(this.hosts, user);

          this.roomNotice.push({
            dispalyTimeMs: 2000,
            type: 'is-success',
            message: `@${guest.get('username')} becomes host`,
          });

          if (guest.get('userId') === userId) {
            this.me.role = USER_ROLE.HOST;
            this.me.state = USER_STATE.MUTED;
          }
        } else if (guest.get('role') === USER_ROLE.GUEST) {
          const user = updateUserState(
            this.hosts,
            guest.get('userId'),
            USER_STATE.IDLE
          );

          this.hosts.removeObject(user);
          addUser(this.guests, user);

          this.roomNotice.push({
            dispalyTimeMs: 2000,
            type: 'is-error',
            message: `@${guest.get('username')} becomes audience`,
          });

          if (guest.get('userId') === userId) {
            this.me.role = USER_ROLE.GUEST;
            this.me.state = USER_STATE.IDLE;
            this.localAudioTrack?.setEnabled(false);
          }
        }
      }

      if (updateKey === 'state') {
        switch (guest.get('state')) {
          case USER_STATE.MUTED:
            {
              updateUserState(
                this.hosts,
                guest.get('userId'),
                USER_STATE.MUTED
              );

              if (guest.get('userId') !== userId) {
                return;
              }

              this.localAudioTrack?.setEnabled(false);
            }
            break;
          case USER_STATE.RAISE_HAND:
            {
              updateUserState(
                this.guests,
                guest.get('userId'),
                USER_STATE.RAISE_HAND
              );

              this.roomNotice.push({
                dispalyTimeMs: 5000,
                type: 'is-success',
                message: `@${guest.get('username')} is raising hand`,
              });
            }
            break;
          case USER_STATE.SPEAK:
            /**
             * Due to we are pulling from Agora every 2s, set speak on lean could model is expensive. So we decide to
             * set it in 'volume-indicator
             */
            break;
          case USER_STATE.IDLE: {
            updateUserState(
              [...this.hosts, ...this.guests],
              guest.get('userId'),
              USER_STATE.IDLE
            );

            if (
              guest.get('role') === USER_ROLE.ADMIN ||
              guest.get('role') === USER_ROLE.HOST
            ) {
              this.roomNotice.push({
                dispalyTimeMs: 2000,
                type: 'is-primary',
                message: `@${guest.get('username')} is unmuted`,
              });
            }
          }
        }
      }
    });
  }

  async destroyCurrentUser(userId) {
    const [roomUser] = await this.findRoomUsers(userId);
    if (roomUser) {
      await this.liveQuery.AV.Object.destroyAll([roomUser]);
    }
  }

  /**
   * @param {String} userId - (optional) user id. If not exists, return all users in this room
   * @returns
   */
  async findRoomUsers(userId) {
    const roomUserQuery = new this.liveQuery.AV.Query('RoomUser');
    roomUserQuery.equalTo('roomId', this.roomId);

    if (userId) {
      roomUserQuery.equalTo('userId', userId);
    }

    const roomUsers = await roomUserQuery.find();
    return roomUsers;
  }

  @action
  async toggleHost(userId) {
    this.me.isSaving = true;

    const [roomUser] = await this.findRoomUsers(userId);
    if (!roomUser) {
      return;
    }

    const newRole =
      roomUser.get('role') === USER_ROLE.HOST
        ? USER_ROLE.GUEST
        : USER_ROLE.HOST;

    roomUser.set('role', newRole);
    if (newRole === USER_ROLE.GUEST) {
      roomUser.set('state', USER_STATE.IDLE);
    } else {
      roomUser.set('state', USER_STATE.MUTED);
    }

    await roomUser.save();
    this.me.isSaving = false;
  }

  @action
  async toggleRaiseHand() {
    this.me.isSaving = true;

    const userId = this.authentication.getUserId();
    const [roomUser] = await this.findRoomUsers(userId);
    const state = roomUser.get('state');
    const newState =
      state === USER_STATE.RAISE_HAND ? USER_STATE.IDLE : USER_STATE.RAISE_HAND;

    roomUser.set('state', newState);
    await roomUser.save();

    this.me.state = newState;
    this.me.isSaving = false;
  }

  @action
  async closeRoom() {
    this.me.isSaving = true;

    // disconnect with Agora
    this.localAudioTrack?.close();
    this.client?.leave();

    // delete all roomUsers in this room
    const roomUsers = await this.findRoomUsers();
    await this.liveQuery.AV.Object.destroyAll(roomUsers);

    // delete room
    const roomQuery = new this.liveQuery.AV.Query('Room');
    const room = await roomQuery.get(this.roomId);
    await room.destroy();

    // unsubscribe live query
    this._roomLiveQuery.unsubscribe();
    this._roomUserLiveQuery.unsubscribe();

    this.currentState = this.state.CLOSED;
    this.me.isSaving = false;
  }

  @action
  async leaveRoom() {
    this.me.isSaving = true;

    // disconnect with Agora
    this.localAudioTrack?.close();
    await this.client?.leave();

    // remove roomUser
    const userId = this.authentication.getUserId();
    removeUser(this.hosts, this.guests, userId);

    // unsubscribe live query
    this._roomLiveQuery.unsubscribe();
    this._roomUserLiveQuery.unsubscribe();

    this.me.isSaving = false;
    this.router.transitionTo('authentication.home');
  }

  @action
  toggleStats() {
    this.me.showStats = !this.me.showStats;
  }

  @action
  async toggleMute() {
    this.me.isSaving = true;

    const userId = this.authentication.getUserId();
    const [roomUser] = await this.findRoomUsers(userId);
    const state = roomUser.get('state');
    const newState =
      state === USER_STATE.MUTED ? USER_STATE.IDLE : USER_STATE.MUTED;

    roomUser.set('state', newState);
    await roomUser.save();

    if (newState === USER_STATE.MUTED) {
      this.localAudioTrack.setEnabled(false);
    } else {
      if (!this.localAudioTrack) {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await this.client.publish([this.localAudioTrack]);
      } else {
        this.localAudioTrack.setEnabled(true);
      }
    }

    this.me.state = newState;
    this.me.isSaving = false;
  }
}
