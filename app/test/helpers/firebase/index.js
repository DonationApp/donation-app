import auth from './auth';
import {
  helpers as authHelpers,
} from './auth';
import firebase from 'firebase';

firebase.auth = auth;

export const helpers = {
  auth: authHelpers,
  reset: () => {
    authHelpers.reset();
  },
};

// Uncomment this back in to enable logging from the
// firebase client
//
// firebase.database.enableLogging(true);

export default firebase;
