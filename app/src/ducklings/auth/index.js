import authService from './service';
import {
  createSelector,
} from 'reselect';
import asyncBehavior from '../../lib/ducklings/async-behavior';

export default [asyncBehavior, ({
  selector,
  action,
  app: {start, complete, isPending},
}) => {
  const user = selector((state) => state.user);
  const isSignedIn = createSelector(
    user,
    (user) => user === null ? false : true,
  );
  const isSignedOut = createSelector(
    isSignedIn,
    isPending,
    (isSignedIn, isPending) => !isSignedIn && !isPending,
  );
  const getDisplayName = createSelector(
    isSignedIn,
    user,
    (isSignedIn, user) => isSignedIn ? user.displayName : '',
  );
  const isEmailVerified = createSelector(
    isSignedIn,
    user,
    (isSignedIn, user) => isSignedIn ? user.emailVerified : false,
  );
  const isAdmin = createSelector(
    isSignedIn,
    user,
    (isSignedIn, user) => isSignedIn ? user.admin : false,
  );

  const signInWithGoogleRedirect = () => () => {
    authService.signInWithGoogleRedirect();
    // actually don't bother dispatching any actions, this
    // will do a redirect anyway
  };
  const signInWithEmailAndPassword = (email, password) => (dispatch) => {
    dispatch(start());
    return dispatch(complete(
      authService.signInWithEmailAndPassword(email, password)
    ));
  };
  const createUserWithEmailAndPassword = (email, password) => (dispatch) => {
    dispatch(start());
    return dispatch(complete(
      authService.createUserWithEmailAndPassword(email, password)
      .then(async (user) => {
        await user.sendEmailVerification();
        return user;
      }),
    ));
  };
  const signOut = () => {
    authService.signOut();
    return complete(null);
  };
  const setAdmin = action('SET_ADMIN');

  return {
    initialState: {
      user: null,
    },
    app: {
      isSignedIn,
      isSignedOut,
      getDisplayName,
      isEmailVerified,
      isAdmin,
      signInWithGoogleRedirect,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      signOut,
      setAdmin,
    },
    handlers: {
      [complete]: {
        next: (_, {payload: user}) => ({
          user: user === null ? user : {
            displayName: user.displayName || user.email,
            emailVerified: user.emailVerified || false,
          },
        }),
      },
      [setAdmin]: (state, {payload: admin}) => ({
        user: {
          ...state.user,
          admin,
        },
      }),
    },
  };
}];
