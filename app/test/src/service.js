import service from '../../src/service';
import {
  helpers,
} from '../helpers/firebase';
import firebase from 'firebase';
import config from '../../config';
import _ from 'lodash';

const user = 'Fred Bloggs';
const email = 'fred@bloggs.com';
const password = 'my password';
const setUserAction = 'set user action';
const setErrorAction = 'set error action';
const error = new Error('FAIL');

const auth = firebase.auth();

const store = {
  dispatch: sinon.spy(),
};

const app = {
  auth: {
    setUser: sinon.spy(() => setUserAction),
  },
  error: {
    setError: sinon.spy(() => setErrorAction),
  },
};

describe('service', () => {
  before(() => {
    helpers.reset();
    store.dispatch.reset();
    // setup the getRedirectResult promise
    helpers.auth.setResults([{
      error,
    }]);
    return service.start(app, store);
  });

  it('should dispatch the error if the redirect result has an error', () => {
    app.error.setError.should.have.been.calledWith(error);
    store.dispatch.should.have.been.calledOnce;
    store.dispatch.should.have.been.calledWith(setErrorAction);
  });

  it('should initialize firebase', () => {
    firebase.initializeApp.should.have.been.calledOnce;
    firebase.initializeApp.should.have.been.calledWith(config);
  });

  describe('onAuthStateChanged', () => {
    before(() => {
      helpers.reset();
      store.dispatch.reset();
      helpers.auth.changeState(user);
    });

    it('should dispatch a setUser action', () => {
      app.auth.setUser.should.have.been.calledWith(user);
      store.dispatch.should.have.been.calledOnce;
      store.dispatch.should.have.been.calledWith(setUserAction);
    });
  });

  describe('signInWithGoogle', () => {
    describe('with success', () => {
      before(() => {
        helpers.reset();
        helpers.auth.setResults([{
          success: user,
        }]);
      });

      it('should resolve to the user', async () => {
        await service.signInWithGoogle().should.eventually.eql(user);
        auth.signInWithPopup.should.have.been.calledOnce;
        helpers.auth.googleAuthProvider.should.not.be.null;
        auth.signInWithPopup.args[0][0].should.equal(
          helpers.auth.googleAuthProvider,
        );
      });
    });

    describe('with failure', () => {
      before(() => {
        helpers.reset();
        helpers.auth.setResults([{
          error: error,
        }]);
      });

      it('should reject with the error', async () => {
        await service.signInWithGoogle().should.be.rejectedWith(error);
        auth.signInWithPopup.should.have.been.calledOnce;
        helpers.auth.googleAuthProvider.should.not.be.null;
        auth.signInWithPopup.args[0][0].should.equal(
          helpers.auth.googleAuthProvider,
        );
      });
    });
  });

  describe('signInWithGoogleRedirect', () => {
    before(() => {
      helpers.reset();
    });

    it('should redirect', () => {
      service.signInWithGoogleRedirect();
      auth.signInWithRedirect.should.have.been.calledOnce;
      helpers.auth.googleAuthProvider.should.not.be.null;
      auth.signInWithRedirect.args[0][0].should.equal(
        helpers.auth.googleAuthProvider,
      );
    });
  });

  describe('signInWithEmailAndPassword', () => {
    describe('with success', () => {
      before(() => {
        helpers.reset();
        helpers.auth.setResults([{
          success: user,
        }]);
      });

      it('should resolve to the user', async () => {
        await service.signInWithEmailAndPassword(
          email,
          password,
        ).should.eventually.eql(user);
        auth.signInWithEmailAndPassword.should.have.been.calledOnce;
        auth.signInWithEmailAndPassword.should.have.been.calledWith(
          email,
          password,
        );
      });
    });

    describe('with failure', () => {
      before(() => {
        helpers.reset();
        helpers.auth.setResults([{
          error: error,
        }]);
      });

      it('should reject with the error', async () => {
        await service.signInWithEmailAndPassword(
          email,
          password,
        ).should.be.rejectedWith(error);
        auth.signInWithEmailAndPassword.should.have.been.calledOnce;
        auth.signInWithEmailAndPassword.should.have.been.calledWith(
          email,
          password,
        );
      });
    });
  });

  describe('signOut', () => {
    describe('with success', () => {
      before(() => {
        helpers.reset();
        helpers.auth.setResults([{
          success: void 0,
        }]);
      });

      it('should resolve', async () => {
        await service.signOut();
        auth.signOut.should.have.been.calledOnce;
      });
    });

    describe('with failure', () => {
      before(() => {
        helpers.reset();
        helpers.auth.setResults([{
          error: error,
        }]);
      });

      it('should reject with the error', async () => {
        await service.signOut().should.be.rejectedWith(error);
        auth.signOut.should.have.been.calledOnce;
      });
    });
  });
});
