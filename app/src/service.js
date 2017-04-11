import firebase from 'firebase';
import config from '../config';

class Service {
  static start(app, store) {
    store.dispatch(app.auth.submitSignIn()),
    firebase.initializeApp(config);
    firebase.auth().onAuthStateChanged(
      (user) => store.dispatch(app.auth.setUser(user)),
    );
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
