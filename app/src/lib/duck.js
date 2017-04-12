import {
  handleActions,
  createAction,
} from 'redux-actions';


export default class Duck {
  constructor(name, initialState, stateFilter) {
    this.name = name;
    this.initialState = initialState;
    this.stateFilter = stateFilter;
  }

  action(type) {
    return createAction(`${this.name}/${type}`);
  }

  reducer(actionMap) {
    return handleActions(actionMap, this.initialState);
  }

  selector(selector) {
    return (state, ...args) => selector(
      this.stateFilter(state),
      ...args,
    );
  }
}
