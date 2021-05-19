export const AGORA_NETWORK_QUALITY_MAP = {
  0: 'Unknow',
  1: 'Excellent',
  2: 'Good',
  3: 'Fair',
  4: 'Bad',
  5: 'Very bad',
  6: 'Offline',
};

export const FEASURE_LIST = {
  SHOW_RELEASE_MODAL: 'showReleaseModal',
};

export const LEAN_COULD_ERROR_CODE = {
  CLASS_DOES_NOT_EXIST: 101,
};

export const ROOM_STATE = {
  READY: 'ready',
  LOADED: 'loaded',
  LOADING: 'loading',
  ERROR: {
    API_SERVER: 'API server error',
    LEAN_COULD: 'lean could error',
    AGORA_CONNECT_FAIL: 'agora error',
  },
  CLOSED: 'closed',
};

export const USER_ROLE = {
  ADMIN: 'admin',
  HOST: 'host',
  GUEST: 'guest',
};

export const USER_STATE = {
  IDLE: 'idle',
  MUTED: 'muted',
  RAISE_HAND: 'raiseHand',
  SPEAK: 'speak',
};
