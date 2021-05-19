import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AvatarComponent extends Component {
  @tracked avatar = this.args.currentAvatar;

  avatars = [
    'nes-mario',
    'nes-ash',
    'nes-pokeball',
    'nes-kirby',
    'big-stinky-pete',
    'camel',
    'lineshooter',
    'shine-stein',
    'tight-fisted',
    'yardbird',
  ];

  @action
  chooseAvatar(avatar) {
    this.avatar = avatar;
    this.args.chooseAvatar(avatar);
  }
}
