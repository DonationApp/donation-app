import errorBehavior from '../../lib/ducklings/error-behavior';

export default [errorBehavior, ({action}) => {
  const setError = action('SET_ERROR');
  return {
    app: {
      setError,
    },
    handlers: {
      [setError]: (_, {payload: error}) => ({error}),
    },
  };
}];
