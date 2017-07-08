# Development

See or update the [FAQ](./FAQ.md) for common questions.

The project is split into 2 parts.

- `app` - this is the pure javascript [Redux](http://redux.js.org/) application
- `ui` - this is the [Polymer](https://www.polymer-project.org/1.0/) UI view

Each part has its own set of tests.

The project is laid out as follows

```
.
├── app - the JS Redux app
|   ├── src - source files
|   ├── test - tests
|   └── index.js - entry point for the app bundle. Adds the app, store and service start method to the global object
├── config - the firebase configurations for different environments
├── rules - the firebase database and storage rules
├── ui
|   ├── images - images used in the Polymer app
|   ├── src - the Polymer element source files
|   └── test - the Polymer element test files
├── index.html - the Polymer app entry point
└── etc...
```

Before making a change to the `src` for either part you should add the relevent tests. During development you can either run `npm test` to run the tests periodically on demand or run `npm start` in a separate terminal to continually run tests every time a file changes.

The `test` directories themselves mirror the structure of the `src` directories, for each source file there is likely to be a corresponding test file. You should follow the existing style when making changes.

Wherever possible the Polymer components should be kept dumb and only reference selectors, actions, etc from the Redux app.

## The Redux `app`

The Redux app follows a [duckling](https://www.npmjs.com/package/redux-duckling) pattern with the following structure

```
.
├── ducklings
|   └── [duckling] - eg. auth for firebase authentication
|       └── index.js - exports the duckling definition
|       └── service.js - provides a service to abstract the backend for the duckling
├── lib - shared libraries not specific to any duckling
├── index.js - exports the resolved duckling app objects and the redux store
└── service.js - exports the main entry point for the services
```

If you add a new duckling remember to update the top level `index.js` and `service.js` to collect and export the new functionality.

### Reducers

Remember that reducers should be pure functions. This means

- they should take a state and return a new state **without** mutating the existing state (they can and should reuse parts of the state that have not changed)
- they should **not** have side effects (update a database, etc)
- they should always evaluate to the same value for the same input (ie. they should not use impure functions like Date() that return different values depending on the external environment - such values should be passed in through actions)

This makes them easy to test

### Selectors

Selectors should also be pure functions. This means

- they should take a state and calculate the value that is required **without** changing the state
- they should **not** have side effects
- they should always evaluate to the same value for the same input (ie. they should not use impure functions like Date() that return different values depending on the external environment - such values should be passed in through actions that will add the input to the state)

Again this makes them easy to test.

Additionally, to optimise selectors so that values are only recalculated when they need to be, the [reselect](https://github.com/reactjs/reselect) library should be used.

**NB. it is better to implement a selector than to compute values in the Polymer UI code. They can be reused and more easily tested as selectors**

### Actions

Actions are the heart of a Redux application, this is how the environment talks to us and where we query the evironment. As such many actions will be asynchronous. We use [redux-thunk](https://github.com/gaearon/redux-thunk), and [redux-promise](https://www.npmjs.com/package/redux-promise) to implement asynchronous chains of actions.

### Services

The services that abstract the firebase APIs have been split up to reflect the needs of the ducklings. This makes them easier to test in isolation.

## Test mocks

In order to simplify testing the Redux app, we mock the Firebase interface. Currently this mock is not complete and only implements those functions that are used by the application. If you use a previously unused function you will need to add it to the mock in order to create tests. The `firebase` mock is implemented in `app/test/helpers/firebase` and is always loaded for unit tests.

Additionally the UI tests use a mock for the global `app` object which overrides the actions and selectors to make it simpler to test the Polymer elements without also testing the `app` behaviour. This means that if you use an action or selector that was not previously used it will need to be stubbed first. The stubs are listed in `ui/test/helpers/stubs.html`. To get early feedback on integration issues, it is only possible to add stubs for actions and selectors that are actually implemented in the app - if you try to stub a method that does not exist, an error will be generated.
