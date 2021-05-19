import Service from '@ember/service';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { inject as service } from '@ember/service';
import ENV from 'metal-bat-web/config/environment';
import { tracked } from '@glimmer/tracking';

export default class CallService extends Service {
  @service authentication;

  /**
   * @property {boolean} muted
   * Is the call muted or not?
   */
  @tracked muted = false;

  /**
   * @property {LocalAudioTrack} - The basic interface for local audio tracks, providing main methods of local audio tracks.
   * @see {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/ilocalaudiotrack.html}
   */
  localAudioTrack;

  /**
   * @property {AgoraRTCClient} - The local client with basic functions for a voice or video call, such as joining a channel, publishing tracks, or subscribing to tracks.
   * @see {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcclient.html}
   */
  client;

  /**
   * Join a call
   * @param {string} roomId
   * @param {Object<string : eventName, function: callback>} [events]
   */
  async startCall(roomId, events = {}) {
    // End previous call before starting a new one
    if (this.client) {
      this.end();
    }
    AgoraRTC.setLogLevel(4);
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    this.client.roomId = roomId;
    const token = await this._fetchToken(roomId);
    await this.client.join(
      ENV.AGORA_ENV.APP_ID,
      roomId,
      token,
      this.authentication.getUserId()
    );

    this.client.enableAudioVolumeIndicator();
    this._addCallEvents();

    // Add custom events from outside
    for (const [eventName, eventCallback] of Object.entries(events)) {
      this.client.on(eventName, eventCallback);
    }
  }

  async unmute() {
    this.muted = false;
    // Publish audio track
    if (!this.localAudioTrack) {
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await this.client.publish([this.localAudioTrack]);
    }
    this.localAudioTrack.setEnabled(true);
  }

  async mute() {
    this.muted = true;
    this.localAudioTrack?.setEnabled(false);
  }

  async end() {
    this.localAudioTrack?.close();
    this.localAudioTrack = undefined;
    await this.client?.leave();
    this.client = undefined;
  }

  sendTextMessage(message) {
    this.client.sendStreamMessage(message);
    // Send it locally too, since Agora won't send it back
    this.client.emit(
      'stream-message',
      this.client.uid,
      new TextEncoder().encode(message)
    );
  }

  async _addCallEvents() {
    // Subscribe to new audio channel when a user joins
    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
      }
    });

    // Refetch token when it's about to expire
    this.client.on('token-privilege-will-expire', async () => {
      const token = await this._fetchToken();
      if (!token) {
        return;
      }
      this.client.renewToken(token);
    });
  }

  async _fetchToken() {
    const userId = this.authentication.getUserId();
    try {
      const tokenResponse = await fetch(
        `${ENV.BLA_BLA_API}?channel=${this.client.roomId}&user=${userId}`,
        {
          mode: 'cors',
        }
      );
      const tokenObj = await tokenResponse.json();
      return tokenObj.token;
    } catch (e) {
      // TODO: Handle errors fetching token
      // this.currentState = this.state.ERROR.API_SERVER;
      return;
    }
  }
}
