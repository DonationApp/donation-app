# Frequently asked questions

## Debugging UI tests

When you use the `npm start` job this runs the UI tests with Web Component Tester (`wct`) in non-persistent mode. This means that it starts the server, launches browsers, runs tests and then shuts everything down. This is fine while the tests are passing or the issues reported are obvious. However it's not so great if an issue is difficult to solve and requires debugging in the browser.

So, to run tests and debug in the browser, you need to run `wct` in persistent mode. First shutdown `npm start`, then run

```
npm run wct:start
```

This will launch the browsers and run tests but leave the server running and the browsers open. You can then re-run tests after making changes by just refreshing the browsers. You should also be able to use the browser's developer console for debugging and in fact run the tests from any browser by connecting to the `wct` server URL

```
http://localhost:2000/components/donation-app/generated-index.html
```

If you connect from another device/machine then you will need to substitute `localhost` for your IP address.

## Running tests in the Android emulator

First install the [Android Studio](https://developer.android.com/studio/index.html) and add the SDK tools to your path.

eg. In `.bash_profile` on macOS

```
export PATH=$PATH:$HOME/Library/Android/sdk/platform-tools
export PATH=$PATH:$HOME/Library/Android/sdk/tools
export ANDROID_HOME=$HOME/Library/Android/sdk
```

You don't have to do everything through an Android Studio project, however it's simplest to create an AVD (Android virtual device) via Android Studio and a hello world project, using `tools/android/avd manager`. Once you have done that you can shutdown android studio and do the following.

To start the emulator, in one terminal window run

```
emulator -avd Nexus_5_api_25
```

I created a Nexus 5 AVD and accepted the defaults - your AVD name may differ if you did something different (`android avd` will show a GUI listing AVDs created, you can also create AVDs here but then you have to specify all the parameters that have defaults in Android Studio and you may need to add more environment variables or something)

To start the web component tester server, in another terminal and from the project directory, run

```
npm run wct:start
```

Make sure you have stopped the `npm start` job first (or any other web component tester job)

To launch the test URL, in another terminal run

```
adb shell am start -a "android.intent.action.VIEW" -d "http://<your ip>:2000/components/donation-app/generated-index.html"
```

Make sure you substitute your IP (localhost won't work as the emulator is running inside a VM with it's own localhost domain)

To view the javascript console log, in the same terminal run

```
adb logcat | grep CONSOLE
```

Refresh the browser in the emulator to re-run tests after changes

**Also see this guide on [remote debugging with Chrome](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/) (very useful)**
