import sinon from 'sinon';
import auth from './auth';
import {
  helpers as authHelpers,
} from './auth';

const initializeApp = sinon.spy();

const firebase = {
  initializeApp,
  auth,
};

export const helpers = {
  auth: authHelpers,
  reset: () => {
    initializeApp.reset();
    authHelpers.reset();
  },
};

export default firebase;
