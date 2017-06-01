import errorBehavior from './error-behavior';

export default [errorBehavior, ({action, selector}) => {
  const isPending = selector((state) => state.pending);

  const start = action('START');
  const complete = action('COMPLETE');
  const resetError = action('RESET_ERROR');

  return {
    initialState: {
      pending: false,
    },
    app: {
      isPending,
      start,
      complete,
      resetError,
    },
    handlers: {
      [start]: () => ({
        pending: true,
        error: undefined,
      }),
      [complete]: {
        next: () => ({
          pending: false,
        }),
        throw: (_, {payload: error}) => ({
          pending: false,
          error,
        }),
      },
      [resetError]: () => ({
        error: undefined,
      }),
    },
  };
}];
