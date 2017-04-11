import firebase from 'firebase';
import config from '../config';

const CHECK_VERIFIED_INTERVAL = 1000;

class Service {
  static start(app, store) {
    store.dispatch(app.auth.submitSignIn()),
    firebase.initializeApp(config);
    let checkVerifiedTimeout;
    let currentUser;
    firebase.auth().onAuthStateChanged((user) => {
      currentUser = user;

      // istanbul ignore next
      if (checkVerifiedTimeout) {
        clearTimeout(checkVerifiedTimeout);
      }

      store.dispatch(app.auth.setUser(user));

      // istanbul ignore next
      if (user && !user.emailVerified) {
        // we don't get notified when a user verifies
        // their email so we set timeouts to reload
        // the user object till they do. We also
        // take care not to set the user if the user
        // changes before the reload promise succeeds
        const checkVerified = () => {
          user.reload().then(() => {
            if (!user.emailVerified) {
              startCheckVerifiedTimeout();
            } else {
              if (currentUser === user) {
                store.dispatch(app.auth.setUser(user));
              }
            }
          });
        };
        const startCheckVerifiedTimeout = () => {
          checkVerifiedTimeout = setTimeout(
            checkVerified,
            CHECK_VERIFIED_INTERVAL
          );
        };
        startCheckVerifiedTimeout();
      }
    });
    return firebase.auth().getRedirectResult().catch(
      (error) => store.dispatch(app.error.setError(error)),
    );
  }

  static signInWithGoogleRedirect() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithRedirect(provider);
  }

  static signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider);
  }

  static createUserWithEmailAndPassword(email, password) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }

  static signInWithEmailAndPassword(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  static signOut() {
    return firebase.auth().signOut();
  }
}

export default Service;
