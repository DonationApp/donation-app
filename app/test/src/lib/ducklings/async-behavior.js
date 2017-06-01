import resolve from 'redux-duckling';
import {
  createStore,
} from 'redux';

import errorBehavior from '../../../../src/lib/ducklings/error-behavior';
import asyncBehavior from '../../../../src/lib/ducklings/async-behavior';

let app;
let reducer;
let store;
let state;

describe('lib', () => {
  describe('ducklings', () => {
    describe('asyncBehavior', () => {
      beforeEach(() => {
        ({app, reducer} = resolve(asyncBehavior));
        store = createStore(reducer);
        state = store.getState();
      });

      it('should extend errorBehavior', () => {
        asyncBehavior[0].should.equal(errorBehavior);
      });

      describe('initial state', () => {
        it('should not be pending', () => {
          app.isPending(state).should.be.false;
        });

        it('should have no error', () => {
          app.hasError(state).should.be.false;
        });
      });

      describe('after start', () => {
        beforeEach(() => {
          store.dispatch(app.start());
          state = store.getState();
        });

        it('should be pending', () => {
          app.isPending(state).should.be.true;
        });

        it('should have no error', () => {
          app.hasError(state).should.be.false;
        });

        describe('then complete', () => {
          describe('with no error', () => {
            beforeEach(() => {
              store.dispatch(app.complete({}));
              state = store.getState();
            });

            it('should not be pending', () => {
              app.isPending(state).should.be.false;
            });

            it('should have no error', () => {
              app.hasError(state).should.be.false;
            });
          });

          describe('with an error', () => {
            beforeEach(() => {
              store.dispatch(app.complete(new Error('FAIL')));
              state = store.getState();
            });

            it('should not be pending', () => {
              app.isPending(state).should.be.false;
            });

            it('should have an error', () => {
              app.hasError(state).should.be.true;
            });

            describe('then start again', () => {
              beforeEach(() => {
                store.dispatch(app.start());
                state = store.getState();
              });

              it('should be pending', () => {
                app.isPending(state).should.be.true;
              });

              it('should have no error', () => {
                app.hasError(state).should.be.false;
              });
            });

            describe('then resetError', () => {
              beforeEach(() => {
                store.dispatch(app.resetError());
                state = store.getState();
              });

              it('should be pending', () => {
                app.isPending(state).should.be.false;
              });

              it('should have no error', () => {
                app.hasError(state).should.be.false;
              });
            });
          });
        });
      });
    });
  });
});
