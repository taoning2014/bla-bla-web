import EmberRouter from '@ember/routing/router';
import config from 'metal-bat-web/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('landing');
  this.route('login');
  this.route('register');

  this.route('authentication', { path: '/' }, function () {
    this.route('home', { path: '/' });
    this.route('room', { path: '/room/:room_id' });
    this.route('create-room');
  });

  this.route('redirect', { path: '/*' });
});
