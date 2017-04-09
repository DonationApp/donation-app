import * as app from '../../src';
import store from '../../src';

describe('app', () => {
  it('should export the store', () => {
    store.should.be.ok;
  });

  it('should export the error duck', () => {
    app.error.should.be.ok;
  });

  it('should export the auth duck', () => {
    app.auth.should.be.ok;
  });
});
