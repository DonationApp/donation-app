import firebase from 'firebase';
import config from '../config';
import authService from './ducklings/auth/service';

class Service {
  start(app, store) {
    firebase.initializeApp(config);
    authService.start(app, store);
  }
}

export default new Service();
