import sinon from 'sinon';
import _ from 'lodash';
import service from '../../src/service';

const methods = [
  'createUserWithEmailAndPassword',
  'signInWithGoogle',
  'signInWithGoogleRedirect',
  'signInWithEmailAndPassword',
  'signOut',
];

let _results;

function _stub(method) {
  sinon.stub(service, method, () => {
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        const result = _results.shift();
        if (_.isUndefined(result.error)) {
          resolve(result.success);
        } else {
          reject(result.error);
        }
      });
    });
  });
}

function _reset(method) {
  service[method].reset();
}

function _restore(method) {
  service[method].restore();
}

export function setResults(results) {
  _results = results.slice(0);
}

export function stub() {
  methods.forEach(_stub);
}

export function reset() {
  _results = undefined;
  methods.forEach(_reset);
}

export function restore() {
  methods.forEach(_restore);
}
