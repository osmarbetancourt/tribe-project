# Expo CLI Usage (SDK 46+)

## Why Use Local Expo CLI?
- The global `expo-cli` is deprecated and does not support Node 17+.
- The new Expo CLI is bundled locally in your project via the `expo` package.
- Using `npx expo <command>` ensures compatibility and up-to-date features.
- Official Expo announcement: https://blog.expo.dev/the-new-expo-cli-f4250d8e3421

## Common Commands

### Initialize a New Project
```
npx expo init tribe-chat-app
```
- Creates a new Expo project in the `tribe-chat-app` folder.

### Start the Development Server
```
cd tribe-chat-app
npx expo start
```
- Launches the Expo development server for your app.

### Install Dependencies
```
cd tribe-chat-app
npx expo install <package>
```
- Installs Expo-compatible packages (e.g., `zustand`, `@react-native-async-storage/async-storage`).

### Other Useful Commands
```
npx expo run:android
npx expo run:ios
npx expo build
```
- For running and building your app on devices/emulators.

## References
- [Expo CLI Migration Guide](https://blog.expo.dev/the-new-expo-cli-f4250d8e3421)
- [Expo Documentation](https://docs.expo.dev/)

---
**Always use `npx expo <command>` for all Expo operations.**
