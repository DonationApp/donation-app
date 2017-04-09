import * as error from '../../../src/error';
import reducer from '../../../src/error';
import {
  createStore,
  combineReducers,
} from 'redux';

let state;
let states = [];
const store = createStore(combineReducers({
  error: reducer,
}));
store.subscribe(() => {
  states.push(store.getState());
});
function reset(actions) {
  store.dispatch(error.reset());
  actions.forEach((action) => {
    store.dispatch(action);
  });
  states = [];
}

const err = new Error('ERROR');

describe('error', () => {
  describe('with the initial state', () => {
    before(() => {
      state = store.getState();
    });

    it('should not report an error', () => {
      error.hasError(state).should.be.false;
    });

    it('should not have error text', () => {
      error.getErrorText(state).should.eql('');
    });

    describe('then dispatch an error', () => {
      before(() => {
        reset([]);
        store.dispatch(error.setError(err));
      });

      it('should report an error', () => {
        error.hasError(states[0]).should.be.true;
      });

      it('should have the correct error text', () => {
        error.getErrorText(states[0]).should.eql(err.toString());
      });

      describe('then reset', () => {
        before(() => {
          reset([
            error.setError(err),
          ]);
          store.dispatch(error.reset());
        });

        it('should not report an error', () => {
          error.hasError(states[0]).should.be.false;
        });

        it('should not have error text', () => {
          error.getErrorText(states[0]).should.eql('');
        });
      });
    });
  });
});
