import authService from '../../../../src/ducks/auth/service';
import {
  helpers,
} from '../../../helpers/firebase';
import firebase from 'firebase';
import _ from 'lodash';

const user = 'Fred Bloggs';
const email = 'fred@bloggs.com';
const password = 'my password';
const setUserAction = 'set user action';
const submitSignInAction = 'submit sign in action';
const setErrorAction = 'set error action';
const error = new Error('FAIL');

const auth = firebase.auth();

const app = {
  auth: {
    setUser: sinon.spy(() => setUserAction),
    submitSignIn: sinon.spy(() => submitSignInAction),
  },
  error: {
    setError: sinon.spy(() => setErrorAction),
  },
  store: {
    dispatch: sinon.spy(),
  },
};

describe('authService', () => {
  beforeEach(async () => {
    helpers.reset();
    app.store.dispatch.reset();
    // setup the getRedirectResult promise
    helpers.auth.setResults([{
      error,
    }]);
    await authService.start(app);
  });

  afterEach(() => {
    authService.stop();
  });

  it('should dispatch a submit sign in action while we wait', () => {
    app.auth.submitSignIn.should.have.been.calledOnce;
    app.store.dispatch.should.have.been.calledWith(submitSignInAction);
  });

  it('should dispatch the error if the redirect result has an error', () => {
    app.error.setError.should.have.been.calledWith(error);
    app.store.dispatch.should.have.been.calledWith(setErrorAction);
  });

  describe('onAuthStateChanged', () => {
    beforeEach(() => {
      helpers.reset();
      app.store.dispatch.reset();
      helpers.auth.changeState(user);
    });

    it('should dispatch a setUser action', () => {
      app.auth.setUser.should.have.been.calledWith(user);
      app.store.dispatch.should.have.been.calledOnce;
      app.store.dispatch.should.have.been.calledWith(setUserAction);
    });
  });

  describe('signInWithGoogle', () => {
    describe('with success', () => {
      beforeEach(() => {
        helpers.reset();
        helpers.auth.setResults([{
          success: user,
        }]);
      });

      it('should resolve to the user', async () => {
        await authService.signInWithGoogle().should.eventually.eql(user);
        auth.signInWithPopup.should.have.been.calledOnce;
        helpers.auth.googleAuthProvider.should.not.be.null;
        auth.signInWithPopup.args[0][0].should.equal(
          helpers.auth.googleAuthProvider,
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
        await authService.signInWithGoogle().should.be.rejectedWith(error);
        auth.signInWithPopup.should.have.been.calledOnce;
        helpers.auth.googleAuthProvider.should.not.be.null;
        auth.signInWithPopup.args[0][0].should.equal(
          helpers.auth.googleAuthProvider,
        );
      });
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
