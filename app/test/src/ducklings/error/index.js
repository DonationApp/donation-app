import resolve from 'redux-duckling';
import {
  createStore,
} from 'redux';

import errorBehavior from '../../../../src/lib/ducklings/error-behavior';
import error from '../../../../src/ducklings/error';

const {app, reducer} = resolve(error);

const err = new Error('ERROR');

let store;
let state;

describe('ducklings', () => {
  describe('error', () => {
    beforeEach(() => {
      store = createStore(reducer);
      state = store.getState();
    });

    it('should extend errorBehavior', () => {
      error[0].should.equal(errorBehavior);
    });

    describe('initial state', () => {
      it('should not report an error', () => {
        app.hasError(state).should.be.false;
      });

      describe('then dispatch an error', () => {
        beforeEach(() => {
          store.dispatch(app.setError(err));
          state = store.getState();
        });

        it('should report an error', () => {
          app.hasError(state).should.be.true;
        });
      });
    });
  });
});
