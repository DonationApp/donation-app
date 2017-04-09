// override the config
import './config';

// assertion styles
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import sinonChaiInOrder from 'sinon-chai-in-order';
chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.use(sinonChaiInOrder);
global.expect = chai.expect;
global.sinon = sinon;

// helper to seed the require cache with our own exports
function seedRequireCache(name, exports) {
  const path = require.resolve(name);
  require.cache[path] = {
    id: path,
    exports: exports,
  };
}

// override firebase in the require cache
import firebase from './firebase';
seedRequireCache('firebase', firebase);
