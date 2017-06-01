import {
  createSelector,
} from 'reselect';

export default function({selector}) {
  const error = selector((state) => state.error);
  const hasError = createSelector(
    error,
    (error) => typeof error !== 'undefined',
  );
  const getErrorText = createSelector(
    hasError,
    error,
    (hasError, error) => hasError ? error.toString() : '',
  );

  return {
    initialState: {
      error: undefined,
    },
    app: {
      hasError,
      getErrorText,
    },
  };
}
