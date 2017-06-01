import firebase from 'firebase';

const CHECK_VERIFIED_INTERVAL = 1000;

class AuthService {
  start(app, store) {
    let checkVerifiedTimeout;
    let currentUser;
    store.dispatch(app.auth.start()),
    this.auth = firebase.auth();
    this.stop = this.auth.onAuthStateChanged((user) => {
      currentUser = user;

      // istanbul ignore next
      if (checkVerifiedTimeout) {
        clearTimeout(checkVerifiedTimeout);
      }

      store.dispatch(app.auth.complete(user));

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
                store.dispatch(app.auth.complete(user));
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
    return this.auth.getRedirectResult().catch(
      (error) => store.dispatch(app.error.setError(error)),
    );
  }

  signInWithGoogleRedirect() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.auth.signInWithRedirect(provider);
  }

  signInWithEmailAndPassword(email, password) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  createUserWithEmailAndPassword(email, password) {
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  signOut() {
    return this.auth.signOut();
  }
}

export default new AuthService();
