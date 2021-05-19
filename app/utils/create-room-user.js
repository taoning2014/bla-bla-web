export default async function createRoomUser(
  RoomUser,
  { roomId, userId, username, avatar, role, state, isSelf } = {}
) {
  const roomUser = new RoomUser();
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
