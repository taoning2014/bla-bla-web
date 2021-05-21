import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { INVITATION_CODE_LENGTH } from 'metal-bat-web/utils/constants';
import { TrackedArray } from 'tracked-built-ins';
import voucher_codes from 'voucher-code-generator';

const STATE = {
  admin: 'admin',
  error: 'error',
};
export default class AuthenticationAdminController extends Controller {
  state = STATE;

  @service liveQuery;

  @tracked currentState = this.state.admin;
  @tracked generatedInviteCode;
  @tracked inviteCodeInput; // Notice: get value from <Input /> which is a string
  @tracked inviteCodeInputError;
  @tracked inviteCode = new TrackedArray([]);

  get isGenerateBtnDisabled() {
    return this.inviteCodeInputError || !this.inviteCodeInput;
  }

  constructor() {
    super(...arguments);

    new this.liveQuery.AV.Query('InviteCode')
      .equalTo('isVested', false)
      .find()
      .then((codes) => {
        this.generatedInviteCode = codes.map((code) => ({
          inviteCode: code.get('inviteCode'),
          isVested: code.get('isVested'),
        }));
      });
  }

  reset() {
    this.currentState = this.state.admin;
  }

  @action
  checkInput() {
    const numOfInviteCodeToGenerate = Number.parseInt(this.inviteCodeInput);
    if (numOfInviteCodeToGenerate < 0 || numOfInviteCodeToGenerate > 100) {
      this.inviteCodeInputError = true;
    } else {
      this.inviteCodeInputError = false;
    }
  }

  @action
  async createInviteCode() {
    const inviteCodes = voucher_codes.generate({
      length: INVITATION_CODE_LENGTH,
      count: Number.parseInt(this.inviteCodeInput),
    });

    const codes = inviteCodes.map((inviteCode) => {
      const code = new this.liveQuery.AV.Object('InviteCode');
      code.set('inviteCode', inviteCode);
      code.set('isVested', false);
      return code;
    });

    try {
      await this.liveQuery.AV.Object.saveAll(codes);
      this.inviteCode.push(...inviteCodes);
    } catch (e) {
      this.currentState = this.state.error;
    }
  }
}
