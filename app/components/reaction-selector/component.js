import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ReactionSelectorComponent extends Component {
  // Comment out the previous reaction, if needed we can use them for the SMC demo
  reactions = [
    // 'nes-icon heart',
    // 'nes-icon is-half heart',
    // 'nes-icon heart is-empty',
    // 'nes-icon star',
    // 'nes-icon is-half star',
    // 'nes-icon star is-empty',
    // 'nes-icon like',
    'coin',
    'curious',
    'like',
    'love',
  ];

  @action
  chooseReaction(reaction) {
    this.args.chooseReaction(reaction);
  }
}
