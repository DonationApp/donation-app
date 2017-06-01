import _ from 'lodash';
import resolve from 'redux-duckling';
import {
  createStore,
  applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import authService from '../../../../src/ducklings/auth/service';
import ServiceHelper from '../../../helpers/service';

import asyncBehavior from '../../../../src/lib/ducklings/async-behavior';
import auth from '../../../../src/ducklings/auth';

const {app, reducer} = resolve(auth);
const emailVerified = true;
const email = 'fred@bloggs.com';
const password = 'my password';
const displayName = 'Fred Bloggs';
const error = new Error('failed sign in');
const user = {
  displayName: displayName,
  email: email,
  emailVerified,
  sendEmailVerification: sinon.spy(),
};
const userWithoutDisplayNameOrEmailVerified = {
  email: email,
  sendEmailVerification: sinon.spy(),
};

let serviceHelper;
let store;
let changes = [];
let initialState;

const record = (store) => (next) => (action) => {
  const result = next(action);
  changes.push({
    action,
    state: store.getState(),
  });
  return result;
};

describe('ducklings', () => {
  describe('auth', () => {
    beforeEach(() => {
      serviceHelper = new ServiceHelper(authService, {
        signInWithGoogleRedirect: true,
        signInWithEmailAndPassword: true,
        createUserWithEmailAndPassword: true,
        signOut: true,
      });
      store = createStore(reducer, applyMiddleware(thunk, promise, record));
      initialState = store.getState();
    });

    afterEach(() => {
      serviceHelper.restore();
    });

    it('should extend asyncBehavior', () => {
      auth[0].should.equal(asyncBehavior);
    });

    describe('initial state', () => {
      it('should not be signed in', () => {
        app.isSignedIn(initialState).should.be.false;
      });

      it('should not have a display name', () => {
        app.getDisplayName(initialState).should.eql('');
      });

      it('should not have a verified email', () => {
        app.isEmailVerified(initialState).should.be.false;
      });

      it('should not be an admin', () => {
        app.isAdmin(initialState).should.be.false;
      });

      it('should be signed out', () => {
        app.isSignedOut(initialState).should.be.true;
      });

      describe('then sign in with google and redirect', () => {
        beforeEach(async () => {
          serviceHelper.reset();
          serviceHelper.setResults([{
            success: true,
          }]);
          changes = [];
          await store.dispatch(app.signInWithGoogleRedirect());
        });

        it('should sign in with the correct method', () => {
          authService.signInWithGoogleRedirect.should.have.been.calledOnce;
        });
      });

      describe('then sign in', () => {
        _.forEach({
          'with email and password': {
            action: app.signInWithEmailAndPassword(email, password),
            checkAuthCall: () => {
              authService.signInWithEmailAndPassword
              .should.have.been.calledOnce;
              authService.signInWithEmailAndPassword
              .should.have.been.calledWith(
                email,
                password,
              );
            },
            shouldVerifyEmail: false,
          },
          'creating a user with email and password': {
            action: app.createUserWithEmailAndPassword(email, password),
            checkAuthCall: () => {
              authService.createUserWithEmailAndPassword
              .should.have.been.calledOnce;
              authService.createUserWithEmailAndPassword
              .should.have.been.calledWith(
                email,
                password,
              );
            },
            shouldVerifyEmail: true,
          },
        }, (signInCase, description) => {
          describe(description, () => {
            _.forEach({
              'and fail': {
                serviceResults: [{
                  error,
                }],
                states: [{
                  action: {
                    type: app.start.toString(),
                  },
                  emailVerified: false,
                  signedIn: false,
                  signedOut: false,
                  displayName: '',
                }, {
                  action: {
                    type: app.complete.toString(),
                    payload: error,
                    error: true,
                  },
                  emailVerified: false,
                  signedIn: false,
                  signedOut: true,
                  displayName: '',
                }],
              },
              'and succeed': {
                serviceResults: [{
                  success: user,
                }],
                states: [{
                  action: {
                    type: app.start.toString(),
                  },
                  emailVerified: false,
                  signedIn: false,
                  signedOut: false,
                  displayName: '',
                }, {
                  action: {
                    type: app.complete.toString(),
                    payload: user,
                  },
                  emailVerified: true,
                  signedIn: true,
                  signedOut: false,
                  displayName,
                }],
              },
            }, (resultCase, description) => {
              describe(description, () => {
                beforeEach(async () => {
                  serviceHelper.reset();
                  serviceHelper.setResults(resultCase.serviceResults);
                  changes = [];
                  await store.dispatch(signInCase.action);
                });

                it('should sign in with the correct method', () => {
                  signInCase.checkAuthCall();
                });

                it('should verify email if necessary', () => {
                  if (resultCase.shouldVerifyEmail) {
                    user.sendEmailVerification.should.have.been.calledOnce;
                  }
                });

                it('should change the state n times', () => {
                  changes.length.should.eql(resultCase.states.length);
                });

                for (
                  let stateIndex = 0;
                  stateIndex < resultCase.states.length;
                  stateIndex++
                ) {
                  let testState;
                  let change;

                  describe(`then state ${stateIndex}`, () => {
                    beforeEach(() => {
                      testState = resultCase.states[stateIndex];
                      change = changes[stateIndex];
                    });

                    it('should have dispatched the correct action', () => {
                      change.action.should.eql(testState.action);
                    });

                    it('should have the correct email verified state', () => {
                      app.isEmailVerified(change.state).should.eql(
                        testState.emailVerified
                      );
                    });

                    it('shaould have the correct signed in state', () => {
                      app.isSignedIn(change.state).should.eql(
                        testState.signedIn
                      );
                    });

                    it('should have the correct display name', () => {
                      app.getDisplayName(change.state).should.eql(
                        testState.displayName
                      );
                    });

                    it('should have the correct signed out state', () => {
                      app.isSignedOut(change.state).should.eql(
                        testState.signedOut
                      );
                    });
                  });
                }

                describe('then complete (ie. set user)', () => {
                  _.forEach({
                    'with a displayName and email verified': {
                      user,
                      displayName,
                      emailVerified,
                    },
                    'with no displayName and email not verified': {
                      user: userWithoutDisplayNameOrEmailVerified,
                      displayName: email,
                      emailVerified: false,
                    },
                  }, (value, key) => {
                    describe(key, () => {
                      beforeEach(() => {
                        changes = [];
                        store.dispatch(app.complete(value.user));
                      });

                      it('should change the state once', () => {
                        changes.length.should.eql(1);
                      });

                      it('should have the correct email verified state', () => {
                        app.isEmailVerified(changes[0].state).should.eql(
                          value.emailVerified
                        );
                      });

                      it('should be signed in', () => {
                        app.isSignedIn(changes[0].state).should.eql(true);
                      });

                      it('should set the display name', () => {
                        app.getDisplayName(changes[0].state).should.eql(
                          value.displayName,
                        );
                      });

                      it('should not be signed out', () => {
                        app.isSignedOut(changes[0].state).should.eql(false);
                      });

                      describe('then set admin to true', () => {
                        beforeEach(() => {
                          changes = [];
                          store.dispatch(app.setAdmin(true));
                        });

                        it('should dispatch the setAdmin action', () => {
                          changes[0].action.type.should.eql(
                            app.setAdmin.toString()
                          );
                        });

                        it('should be admin', () => {
                          app.isAdmin(changes[0].state).should.be.true;
                        });

                        it('should not change the email verified state', () => {
                          app.isEmailVerified(changes[0].state).should.eql(
                            value.emailVerified
                          );
                        });

                        it('should not change the display name', () => {
                          app.getDisplayName(changes[0].state).should.eql(
                            value.displayName,
                          );
                        });

                        describe('then set admin to false', () => {
                          beforeEach(() => {
                            changes = [];
                            store.dispatch(app.setAdmin(false));
                          });

                          it('should dispatch the setAdmin action', () => {
                            changes[0].action.type.should.eql(
                              app.setAdmin.toString()
                            );
                          });

                          it('should not be admin', () => {
                            app.isAdmin(changes[0].state).should.be.false;
                          });
                        });
                      });

                      describe('then sign out', () => {
                        beforeEach(() => {
                          serviceHelper.reset();
                          changes = [];
                          store.dispatch(app.signOut());
                        });

                        it('should have signed out with the service', () => {
                          authService.signOut.should.have.been.calledOnce;
                        });

                        it('should change the state once', () => {
                          changes.length.should.eql(1);
                        });

                        it('should dispatch the complete action', () => {
                          changes[0].action.type.should.eql(
                            app.complete.toString()
                          );
                        });

                        it('should not have email verified', () => {
                          app.isEmailVerified(changes[0].state).should.be.false;
                        });

                        it('should not be signed in', () => {
                          app.isSignedIn(changes[0].state).should.eql(false);
                        });

                        it('should not have a display name', () => {
                          app.getDisplayName(changes[0].state).should.eql('');
                        });

                        it('should be signed out', () => {
                          app.isSignedOut(changes[0].state).should.eql(true);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
