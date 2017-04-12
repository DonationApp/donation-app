import _ from 'lodash';
import * as auth from '../../../../src/ducks/auth';
import reducer from '../../../../src/ducks/auth';
import authService from '../../../../src/ducks/auth/service';
import ServiceHelper from '../../../helpers/service';
import {
  createStore,
  applyMiddleware,
  combineReducers,
} from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';

let serviceHelper;

let state;
let states = [];
const store = createStore(combineReducers({
  auth: reducer,
}), applyMiddleware(thunk, promise));
store.subscribe(() => {
  states.push(store.getState());
});
async function reset({actions, serviceResults}) {
  serviceHelper.reset();
  serviceHelper.setResults(serviceResults);
  store.dispatch(auth.reset());
  await actions.reduce(async (promise, action) => {
    await promise;
    await store.dispatch(action);
  }, Promise.resolve());
  states = [];
}

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

describe('auth', () => {
  describe('with the initial state', () => {
    beforeEach(() => {
      serviceHelper = new ServiceHelper(authService, [
        'signInWithGoogle',
        'signInWithGoogleRedirect',
        'signInWithEmailAndPassword',
        'createUserWithEmailAndPassword',
        'signOut',
      ]);
      state = store.getState();
    });

    afterEach(() => {
      serviceHelper.restore();
    });

    it('should not report an error', () => {
      auth.hasError(state).should.be.false;
    });

    it('should not have error text', () => {
      auth.getErrorText(state).should.eql('');
    });

    it('should not be pending', () => {
      auth.isPending(state).should.be.false;
    });

    it('should not have a verified email', () => {
      auth.isEmailVerified(state).should.eql(false);
    });

    it('should not be signed in', () => {
      auth.isSignedIn(state).should.eql(false);
    });

    it('should not have a display name', () => {
      auth.getDisplayName(state).should.eql('');
    });

    it('should be signed out', () => {
      auth.isSignedOut(state).should.eql(true);
    });

    describe('then sign in with google and redirect', () => {
      beforeEach(async () => {
        await reset({
          actions: [],
          serviceResults: [{
            success: true,
          }],
        });
        await store.dispatch(auth.signInWithGoogleRedirect());
      });

      it('should sign in with the correct method', () => {
        authService.signInWithGoogleRedirect.should.have.been.calledOnce;
      });
    });

    describe('then sign in', () => {
      _.forEach({
        'with google': {
          action: auth.signInWithGoogle(),
          checkAuthCall: () => {
            authService.signInWithGoogle.should.have.been.calledOnce;
          },
          shouldVerifyEmail: false,
        },
        'with email and password': {
          action: auth.signInWithEmailAndPassword(email, password),
          checkAuthCall: () => {
            authService.signInWithEmailAndPassword.should.have.been.calledOnce;
            authService.signInWithEmailAndPassword.should.have.been.calledWith(
              email,
              password,
            );
          },
          shouldVerifyEmail: false,
        },
        'creating a user with email and password': {
          action: auth.createUserWithEmailAndPassword(email, password),
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
                error: error,
              }],
              states: [{
                error: false,
                errorText: '',
                pending: true,
                emailVerified: false,
                signedIn: false,
                signedOut: false,
                displayName: '',
              }, {
                error: true,
                errorText: error.toString(),
                pending: false,
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
                error: false,
                errorText: '',
                pending: true,
                emailVerified: false,
                signedIn: false,
                signedOut: false,
                displayName: '',
              }, {
                error: false,
                errorText: '',
                pending: false,
                emailVerified: true,
                signedIn: true,
                signedOut: false,
                displayName,
              }],
            },
          }, (resultCase, description) => {
            describe(description, () => {
              beforeEach(async () => {
                await reset({
                  actions: [],
                  serviceResults: resultCase.serviceResults,
                });
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

              it('should update the state the correct number of times', () => {
                states.length.should.eql(resultCase.states.length);
              });

              for (
                let stateIndex = 0;
                stateIndex < resultCase.states.length;
                stateIndex++
              ) {
                let testState;
                let state;

                describe(`then state ${stateIndex}`, () => {
                  beforeEach(() => {
                    testState = resultCase.states[stateIndex];
                    state = states[stateIndex];
                  });

                  it('should have the correct error state', () => {
                    auth.hasError(state).should.eql(testState.error);
                  });

                  it('should have the correct error text', () => {
                    auth.getErrorText(state).should.eql(testState.errorText);
                  });

                  it('should have the correct pending state', () => {
                    auth.isPending(state).should.eql(testState.pending);
                  });

                  it('should have the correct email verified state', () => {
                    auth.isEmailVerified(state).should.eql(
                      testState.emailVerified
                    );
                  });

                  it('shaould have the correct signed in state', () => {
                    auth.isSignedIn(state).should.eql(testState.signedIn);
                  });

                  it('should have the correct display name', () => {
                    auth.getDisplayName(state).should.eql(
                      testState.displayName
                    );
                  });

                  it('should have the correct signed out state', () => {
                    auth.isSignedOut(state).should.eql(testState.signedOut);
                  });
                });
              }

              describe('then reset error', () => {
                beforeEach(async () => {
                  await reset({
                    actions: [
                      signInCase.action,
                    ],
                    serviceResults: resultCase.serviceResults,
                  });
                  store.dispatch(auth.resetError());
                });

                it('should not report an error', () => {
                  auth.hasError(states[0]).should.be.false;
                });

                it('should not have error text', () => {
                  auth.getErrorText(states[0]).should.eql('');
                });
              });

              describe('then set user', () => {
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
                    beforeEach(async () => {
                      await reset({
                        actions: [
                          signInCase.action,
                        ],
                        serviceResults: resultCase.serviceResults,
                      });
                      store.dispatch(auth.setUser(value.user));
                    });

                    it('should change the state once', () => {
                      states.length.should.eql(1);
                    });

                    it('should not report an error', () => {
                      auth.hasError(states[0]).should.be.false;
                    });

                    it('should not have error text', () => {
                      auth.getErrorText(states[0]).should.eql('');
                    });

                    it('should not be pending', () => {
                      auth.isPending(states[0]).should.be.false;
                    });

                    it('should have the correct email verified state', () => {
                      auth.isEmailVerified(states[0]).should.eql(
                        value.emailVerified
                      );
                    });

                    it('should be signed in', () => {
                      auth.isSignedIn(states[0]).should.eql(true);
                    });

                    it('should set the display name', () => {
                      auth.getDisplayName(states[0]).should.eql(
                        value.displayName,
                      );
                    });

                    it('should not be signed out', () => {
                      auth.isSignedOut(states[0]).should.eql(false);
                    });

                    describe('then sign out', () => {
                      beforeEach(async () => {
                        await reset({
                          actions: [
                            signInCase.action,
                            auth.setUser(value.user),
                          ],
                          serviceResults: resultCase.serviceResults.concat([{
                            success: void 0,
                          }]),
                        });
                        store.dispatch(auth.signOut());
                      });

                      it('should have signed out with the service', () => {
                        authService.signOut.should.have.been.calledOnce;
                      });

                      it('should change the state once', () => {
                        states.length.should.eql(1);
                      });

                      it('should not report an error', () => {
                        auth.hasError(states[0]).should.be.false;
                      });

                      it('should not have error text', () => {
                        auth.getErrorText(states[0]).should.eql('');
                      });

                      it('should not be pending', () => {
                        auth.isPending(states[0]).should.be.false;
                      });

                      it('should not have email verified', () => {
                        auth.isEmailVerified(states[0]).should.be.false;
                      });

                      it('should not be signed in', () => {
                        auth.isSignedIn(states[0]).should.eql(false);
                      });

                      it('should not have a display name', () => {
                        auth.getDisplayName(states[0]).should.eql('');
                      });

                      it('should be signed out', () => {
                        auth.isSignedOut(states[0]).should.eql(true);
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
