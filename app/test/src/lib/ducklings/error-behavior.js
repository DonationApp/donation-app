import resolve from 'redux-duckling';
import {
  createStore,
} from 'redux';

import errorBehavior from '../../../../src/lib/ducklings/error-behavior';

const duckling = [errorBehavior, ({action}) => {
  const set = action('SET');
  return {
    app: {
      set,
    },
    handlers: {
      [set]: (_, {payload: error}) => ({
        error,
      }),
    },
  };
}];
const err = new Error('FAIL');

let app;
let reducer;
let store;
let state;

describe('lib', () => {
  describe('ducklings', () => {
    describe('errorBehavior', () => {
      beforeEach(() => {
        ({app, reducer} = resolve(duckling));
        store = createStore(reducer);
        state = store.getState();
      });

      describe('initial state', () => {
        it('should have no error', () => {
          app.hasError(state).should.be.false;
        });

        it('should have no error text', () => {
          app.getErrorText(state).should.eql('');
        });
      });

      describe('after set', () => {
        beforeEach(() => {
          store.dispatch(app.set(err));
          state = store.getState();
        });

        it('should have an error', () => {
          app.hasError(state).should.be.true;
        });

        it('should have error text', () => {
          app.getErrorText(state).should.match(/FAIL/);
        });
      });
    });
  });
});
