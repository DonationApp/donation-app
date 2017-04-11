import sinon from 'sinon';
import _ from 'lodash';

let currentUser = null;
let authStateChangedListeners = [];
let results;

function getRedirectResult() {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      const result = results.shift();
      if (_.isUndefined(result.error)) {
        resolve(result.success);
      } else {
        reject(result.error);
      }
    });
  });
};

function onAuthStateChanged(listener) {
  authStateChangedListeners.push(listener);
  return () => {
    _.pull(authStateChangedListeners, listener);
  };
};

function notifyAuthStateChanged(user) {
  _.invokeMap(authStateChangedListeners, _.call, null, user);
}

const signInWithPopup = sinon.spy(() => {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      const result = results.shift();
      if (_.isUndefined(result.error)) {
        resolve(result.success);
      } else {
        reject(result.error);
      }
    });
  });
});

const signInWithRedirect = sinon.spy();

const createUserWithEmailAndPassword = sinon.spy(() => {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      const result = results.shift();
      if (_.isUndefined(result.error)) {
        resolve(result.success);
      } else {
        reject(result.error);
      }
    });
  });
});

const signInWithEmailAndPassword = sinon.spy(() => {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      const result = results.shift();
      if (_.isUndefined(result.error)) {
        resolve(result.success);
      } else {
        reject(result.error);
      }
    });
  });
});

const signOut = sinon.spy(() => {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      const result = results.shift();
      if (_.isUndefined(result.error)) {
        resolve(result.success);
      } else {
        reject(result.error);
      }
    });
  });
});

class GoogleAuthProvider {
  constructor() {
    helpers.googleAuthProvider = this;
  }
};

const authInstance = {
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  getRedirectResult,
  signOut,
};

const auth = () => authInstance;
auth.GoogleAuthProvider = GoogleAuthProvider;

export const helpers = {
  setResults: (_results) => {
    results = _results.slice(0);
  },
  changeState: (user) => {
    currentUser = user;
    notifyAuthStateChanged(user);
  },
  getCurrentUser: () => currentUser,
  setCurrentUser: (user) => {
    currentUser = user;
  },
  reset: () => {
    signInWithPopup.reset();
    createUserWithEmailAndPassword.reset();
    signInWithEmailAndPassword.reset();
    signOut.reset();
    helpers.googleAuthProvider = null;
  },
  googleAuthProvider: null,
};

export default auth;
