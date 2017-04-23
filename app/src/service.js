import firebase from 'firebase';
import config from '../config';
import authService from './ducks/auth/service';

class Service {
  start(app) {
    firebase.initializeApp(config);
    authService.start(app);
  }
}

export default new Service();
