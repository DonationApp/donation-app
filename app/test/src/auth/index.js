import _ from 'lodash';
import * as auth from '../../../src/auth';
import reducer from '../../../src/auth';
import service from '../../../src/service';
import {
  stub,
  reset as serviceReset,
  restore,
  setResults,
} from '../../helpers/service';
import {
  createStore,
  applyMiddleware,
  combineReducers,
} from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';

let states;
const store = createStore(combineReducers({
  auth: reducer,
}), applyMiddleware(thunk, promise));
store.subscribe(() => {
  states.push(store.getState());
});
async function reset({actions, serviceResults}) {
  serviceReset();
  setResults(serviceResults);
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
  displayName,
  email,
  emailVerified,
  sendEmailVerification: sinon.spy(),
};
const userWithoutDisplayNameOrEmailVerified = {
  email,
  sendEmailVerification: sinon.spy(),
};

describe('auth', () => {
  describe('with the initial state', () => {
    before(() => {
      stub();
      states = [
        store.getState(),
      ];
    });

    after(() => {
      restore();
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

    it('should not have a verified email', () => {
      auth.isEmailVerified(states[0]).should.eql(false);
    });

    it('should not be signed in', () => {
      auth.isSignedIn(states[0]).should.eql(false);
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

    it('should not have a submitted email', () => {
      auth.getSubmittedEmail(states[0]).should.eql('');
    });

    describe('then sign in with google and redirect', () => {
      before(async () => {
        await reset({
          actions: [],
          serviceResults: [{
            success: true,
          }],
        });
        await store.dispatch(auth.signInWithGoogleRedirect());
      });

      it('should sign in with the correct method', () => {
        service.signInWithGoogleRedirect.should.have.been.calledOnce;
      });
    });

    describe('then sign in', () => {
      _.forEach({
        'with google': {
          action: auth.signInWithGoogle(),
          submittedEmail: '',
          checkAuthCall: () => {
            service.signInWithGoogle.should.have.been.calledOnce;
          },
          shouldVerifyEmail: false,
        },
        'with email and password': {
          action: auth.signInWithEmailAndPassword(email, password),
          submittedEmail: email,
          checkAuthCall: () => {
            service.signInWithEmailAndPassword.should.have.been.calledOnce;
            service.signInWithEmailAndPassword.should.have.been.calledWith(
              email,
              password,
            );
          },
          shouldVerifyEmail: false,
        },
        'creating a user with email and password': {
          action: auth.createUserWithEmailAndPassword(email, password),
          submittedEmail: email,
          checkAuthCall: () => {
            service.createUserWithEmailAndPassword.should.have.been.calledOnce;
            service.createUserWithEmailAndPassword.should.have.been.calledWith(
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
              shouldVerifyEmail: false,
              states: [{
                error: false,
                errorText: '',
                pending: true,
                emailVerified: false,
                signedIn: false,
                signedOut: false,
                displayName: '',
                submittedEmail: signInCase.submittedEmail,
              }, {
                error: true,
                errorText: error.toString(),
                pending: false,
                emailVerified: false,
                signedIn: false,
                signedOut: true,
                displayName: '',
                submittedEmail: signInCase.submittedEmail,
              }],
            },
            'and succeed': {
              serviceResults: [{
                success: user,
              }],
              shouldVerifyEmail: signInCase.shouldVerifyEmail,
              states: [{
                error: false,
                errorText: '',
                pending: true,
                emailVerified: false,
                signedIn: false,
                signedOut: false,
                displayName: '',
                submittedEmail: signInCase.submittedEmail,
              }, {
                error: false,
                errorText: '',
                pending: false,
                emailVerified: true,
                signedIn: true,
                signedOut: false,
                displayName,
                submittedEmail: '',
              }],
            },
          }, (resultCase, description) => {
            describe(description, () => {
              before(async () => {
                await reset({
                  actions: [],
                  serviceResults: resultCase.serviceResults,
                });
                await store.dispatch(signInCase.action);
              });

              it('should verify email if necessary', () => {
                if (resultCase.shouldVerifyEmail) {
                  user.sendEmailVerification.should.have.been.calledOnce;
                }
              });

              it('should sign in with the correct method', () => {
                signInCase.checkAuthCall();
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
                  before(() => {
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

                  it('should have the correct signed in state', () => {
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

                  it('should have the correct submitted email', () => {
                    auth.getSubmittedEmail(state).should.eql(
                      testState.submittedEmail,
                    );
                  });
                });
              }

              describe('then reset error', () => {
                before(async () => {
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
                    before(async () => {
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

                    it('should not have a submitted email', () => {
                      auth.getSubmittedEmail(states[0]).should.eql('');
                    });

                    describe('then sign out', () => {
                      before(async () => {
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
                        service.signOut.should.have.been.calledOnce;
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

                      it('should not be signed in', () => {
                        auth.isSignedIn(states[0]).should.eql(false);
                      });

                      it('should not have a display name', () => {
                        auth.getDisplayName(states[0]).should.eql('');
                      });

                      it('should be signed out', () => {
                        auth.isSignedOut(states[0]).should.eql(true);
                      });

                      it('should not have a submitted email', () => {
                        auth.getSubmittedEmail(states[0]).should.eql('');
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
