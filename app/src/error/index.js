import {
  isUndefined,
} from 'lodash';
import {
  createSelector,
} from 'reselect';
import Duck from '../duck';

const initialState = {};
const duck = new Duck(
  'error',
  initialState,
  (state) => state.error,
);

//
// Selectors
//

// private selectors
const error = duck.selector((state) => state.error);

// public selectors
export const hasError = createSelector(
  error,
  (error) => !isUndefined(error),
);

export const getErrorText = createSelector(
  hasError,
  error,
  (hasError, error) => hasError ? error.toString() : '',
);

//
// Public actions
//
export const reset = duck.action('RESET');
export const setError = duck.action('SET_ERROR');

//
// Reducer
//
export default duck.reducer({
  [reset]: () => initialState,
  [setError]: (state, {payload: error}) => ({error}),
});
