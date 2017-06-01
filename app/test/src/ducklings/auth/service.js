import authService from '../../../../src/ducklings/auth/service';
import {
  helpers,
} from '../../../helpers/firebase';
import firebase from 'firebase';
import _ from 'lodash';

const user = {
  emailVerified: true,
};
const email = 'fred@bloggs.com';
const password = 'my password';
const completeAction = 'complete action';
const startAction = 'start action';
const setErrorAction = 'set error action';
const setAdminAction = 'set admin action';
const error = new Error('FAIL');

const auth = firebase.auth();

const store = {
  dispatch: sinon.spy(),
};

const app = {
  auth: {
    complete: sinon.spy(() => completeAction),
    start: sinon.spy(() => startAction),
    setAdmin: sinon.spy(() => setAdminAction),
  },
  error: {
    setError: sinon.spy(() => setErrorAction),
  },
};

describe('authService', () => {
  beforeEach(async () => {
    helpers.reset();
    store.dispatch.reset();
    // setup the getRedirectResult promise
    helpers.auth.setResults([{
      error,
    }]);
    await authService.start(app, store);
  });

  afterEach(() => {
    authService.stop();
  });

  it('should dispatch a start action while we wait', () => {
    app.auth.start.should.have.been.calledOnce;
    store.dispatch.should.have.been.calledWith(startAction);
  });

  it('should dispatch the error if the redirect result has an error', () => {
    app.error.setError.should.have.been.calledWith(error);
    store.dispatch.should.have.been.calledWith(setErrorAction);
  });

  describe('onAuthStateChanged', () => {
    beforeEach(() => {
      helpers.reset();
      store.dispatch.reset();
      helpers.auth.changeState(user);
    });

    it('should dispatch a complete action', () => {
      app.auth.complete.should.have.been.calledWith(user);
      store.dispatch.should.have.been.calledOnce;
      store.dispatch.should.have.been.calledWith(completeAction);
    });
  });

  describe('signInWithGoogleRedirect', () => {
    beforeEach(() => {
      helpers.reset();
    });

    it('should redirect', () => {
      authService.signInWithGoogleRedirect();
      auth.signInWithRedirect.should.have.been.calledOnce;
      helpers.auth.googleAuthProvider.should.not.be.null;
      auth.signInWithRedirect.args[0][0].should.equal(
        helpers.auth.googleAuthProvider,
      );
    });
  });

  describe('signInWithEmailAndPassword', () => {
    describe('with success', () => {
      beforeEach(() => {
        helpers.reset();
        helpers.auth.setResults([{
          success: user,
        }]);
      });

      it('should resolve to the user', async () => {
        await authService.signInWithEmailAndPassword(
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
      beforeEach(() => {
        helpers.reset();
        helpers.auth.setResults([{
          error: error,
        }]);
      });

      it('should reject with the error', async () => {
        await authService.signInWithEmailAndPassword(
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

  describe('createUserWithEmailAndPassword', () => {
    describe('with success', () => {
      beforeEach(() => {
        helpers.reset();
        helpers.auth.setResults([{
          success: user,
        }]);
      });

      it('should resolve to the user', async () => {
        await authService.createUserWithEmailAndPassword(
          email,
          password,
        ).should.eventually.eql(user);
        auth.createUserWithEmailAndPassword.should.have.been.calledOnce;
        auth.createUserWithEmailAndPassword.should.have.been.calledWith(
          email,
          password,
        );
      });
    });

    describe('with failure', () => {
      beforeEach(() => {
        helpers.reset();
        helpers.auth.setResults([{
          error: error,
        }]);
      });

      it('should reject with the error', async () => {
        await authService.createUserWithEmailAndPassword(
          email,
          password,
        ).should.be.rejectedWith(error);
        auth.createUserWithEmailAndPassword.should.have.been.calledOnce;
        auth.createUserWithEmailAndPassword.should.have.been.calledWith(
          email,
          password,
        );
      });
    });
  });

  describe('signOut', () => {
    describe('with success', () => {
      beforeEach(() => {
        helpers.reset();
        helpers.auth.setResults([{
          success: void 0,
        }]);
      });

      it('should resolve', async () => {
        await authService.signOut();
        auth.signOut.should.have.been.calledOnce;
      });
    });

    describe('with failure', () => {
      beforeEach(() => {
        helpers.reset();
        helpers.auth.setResults([{
          error: error,
        }]);
      });

      it('should reject with the error', async () => {
        await authService.signOut().should.be.rejectedWith(error);
        auth.signOut.should.have.been.calledOnce;
      });
    });
  });
});
