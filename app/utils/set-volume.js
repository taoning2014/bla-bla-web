import { USER_STATE } from 'metal-bat-web/utils/constants';

export default function setVolume(attendees, userId, volume) {
  const attendee = attendees.findBy('userId', userId);

  if (!attendee) {
    return;
  }

  attendee.state = volume > 5 ? USER_STATE.SPEAK : USER_STATE.IDLE;
}
