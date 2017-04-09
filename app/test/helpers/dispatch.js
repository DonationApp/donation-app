import sinon from 'sinon';

export const spy = sinon.spy();
export function reset() {
  spy.reset();
}
export function dispatch(action) {
  if (typeof action === 'function') {
    return action(dispatch);
  } else {
    return spy(action);
  }
};
