import Application from 'metal-bat-web/app';
import config from 'metal-bat-web/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

start();
