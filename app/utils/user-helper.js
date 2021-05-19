/**
 * This util file provide functions that operates on the tracked array of room users
 */

export function addUser(attendees, user) {
  if (attendees.findBy('userId', user.userId)) {
    return;
  }

  attendees.push(user);
}

export function removeUser(hosts, guests, userId) {
  const attendees = [...hosts, ...guests];
  const attendee = attendees.findBy('userId', userId);

  guests.removeObject(attendee);
  hosts.removeObject(attendee)
}

export function updateUserState(attendees, userId, state) {
  const user = attendees.findBy('userId', userId);
  if (user) {
    user.state = state;
  }
  return user;
}
