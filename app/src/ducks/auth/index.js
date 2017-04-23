import authService from './service';
import {
  createSelector,
} from 'reselect';
import Duck from '../../lib/duck';

const initialState = {};
const duck = new Duck(
  'auth',
  initialState,
  (state) => state.auth,
);

//
// Selectors
//

// private selectors
const error = duck.selector((state) => state.error);
const pending = duck.selector((state) => state.pending);
const user = duck.selector((state) => state.user);

// public selectors
export const hasError = createSelector(
  error,
  (error) => typeof error !== 'undefined',
);

export const getErrorText = createSelector(
  hasError,
  error,
  (hasError, error) => hasError ? error.toString() : '',
);

export const isPending = createSelector(
  pending,
  (pending) => typeof pending !== 'undefined',
);

export const isSignedIn = createSelector(
  user,
  (user) => typeof user !== 'undefined' && user !== null,
);

export const getDisplayName = createSelector(
  isSignedIn,
  user,
  (isSignedIn, user) => isSignedIn ? user.displayName : '',
);

export const isEmailVerified = createSelector(
  isSignedIn,
  user,
  (isSignedIn, user) => isSignedIn ? user.emailVerified : false,
);

export const isSignedOut = createSelector(
  isSignedIn,
  isPending,
  (isSignedIn, isPending) => !isSignedIn && !isPending,
);

//
// Private actions
//

//
// Public actions
//
export const submitSignIn = duck.action('SUBMIT_SIGN_IN');
export const reset = duck.action('RESET');
export const resetError = duck.action('RESET_ERROR');
export const setUser = duck.action('SET_USER');

export const signInWithGoogle = () => (dispatch) => {
  dispatch(submitSignIn());
  return dispatch(setUser(
    authService.signInWithGoogle()
  ));
};

export const signInWithGoogleRedirect = () => () => {
  authService.signInWithGoogleRedirect();
  // actually don't bother dispatching any actions, this
  // will do a redirect anyway
};

export const signInWithEmailAndPassword = (email, password) => (dispatch) => {
  dispatch(submitSignIn());
  return dispatch(setUser(
    authService.signInWithEmailAndPassword(email, password)
  ));
};

export const createUserWithEmailAndPassword =
  (email, password) => (dispatch) => {
    dispatch(submitSignIn());
    return dispatch(setUser(
      authService.createUserWithEmailAndPassword(email, password)
      .then(async (user) => {
        await user.sendEmailVerification();
        return user;
      }),
    ));
  };

export const signOut = () => {
  authService.signOut();
  return setUser(null);
};

//
// Reducer
//
export default duck.reducer({
  [reset]: () => initialState,
  [resetError]: (state) => Object.assign({}, state, {
    error: undefined,
  }),
  [submitSignIn]: () => ({
    pending: true,
  }),
  [setUser]: (state, {payload, error}) => {
    if (error) {
      return {
        error: payload,
      };
    } else {
      return {
        user: payload === null ? payload : {
          email: payload.email,
          displayName: payload.displayName || payload.email,
          emailVerified: payload.emailVerified || false,
        },
      };
    }
  },
});
