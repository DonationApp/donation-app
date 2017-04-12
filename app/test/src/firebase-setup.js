import firebase from 'firebase';
import FirebaseServer from 'firebase-server';
import {
  helpers,
} from '../helpers/firebase';

export const FIREBASE_PORT = 5000;
export const FIREBASE_HOST = '127.0.1';

const config = {
  apiKey: 'this does not matter',
  authDomain: 'this does not matter',
  databaseURL: `ws://${FIREBASE_HOST}:${FIREBASE_PORT}`,
  storageBucket: 'this does not matter',
  messagingSenderId: 'this does not matter',
};

before(() => {
  // start the local firebase server
  helpers.server = new FirebaseServer(FIREBASE_PORT, FIREBASE_HOST, {});

  // initialize once with our local server
  // options
  firebase.initializeApp(config);
});

after((done) => {
  helpers.server.close(done);
});
