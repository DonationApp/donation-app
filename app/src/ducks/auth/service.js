import firebase from 'firebase';

const CHECK_VERIFIED_INTERVAL = 1000;

class AuthService {
  start(app) {
    let checkVerifiedTimeout;
    let currentUser;
    app.store.dispatch(app.auth.submitSignIn()),
    this.auth = firebase.auth();
    this.stop = this.auth.onAuthStateChanged((user) => {
      currentUser = user;

      // istanbul ignore next
      if (checkVerifiedTimeout) {
        clearTimeout(checkVerifiedTimeout);
      }

      app.store.dispatch(app.auth.setUser(user));

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
                app.store.dispatch(app.auth.setUser(user));
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
      (error) => app.store.dispatch(app.error.setError(error)),
    );
  }

  signInWithGoogleRedirect() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.auth.signInWithRedirect(provider);
  }

  signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.auth.signInWithPopup(provider);
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
