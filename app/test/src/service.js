import service from '../../src/service';
import firebase from 'firebase';
import config from '../../config';
import authService from '../../src/ducks/auth/service';

const app = 'app';
const store = 'store';

describe('service', () => {
  beforeEach(() => {
    sinon.stub(firebase, 'initializeApp');
    sinon.stub(authService, 'start');
    service.start(app, store);
  });

  afterEach(() => {
    firebase.initializeApp.restore();
    authService.start.restore();
  });

  it('should initialize firebase', () => {
    firebase.initializeApp.should.have.been.calledOnce;
    firebase.initializeApp.should.have.been.calledWith(config);
  });

  it('should start the auth service', () => {
    authService.start.should.have.been.calledOnce;
    authService.start.should.have.been.calledWith(
      app,
      store,
    );
  });
});
