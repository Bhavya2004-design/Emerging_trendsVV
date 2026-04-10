# EmergingTrendsVVExpo Quick Start

This is the Expo version of your app for easy QR testing on phone and emulator.

## 1) Install dependencies

From this folder:

```bash
cd "c:/Users/manra/OneDrive/Desktop/4thsem/Emerging app/Emerging_trendsVV/EmergingTrendsVVExpo"
npm.cmd install
```

## 2) Start Expo with QR (recommended)

```bash
npx.cmd expo start --tunnel
```

If port conflicts happen, use:

```bash
npx.cmd expo start --tunnel --port 8084
```

## 3) Test on iPhone

1. Install **Expo Go** from App Store.
2. Open iPhone Camera.
3. Scan the QR shown in terminal.
4. Tap the Expo link to open app.

## 4) Test on Android phone

1. Install **Expo Go** from Play Store.
2. Scan the same QR code.
3. App opens in Expo Go.

## 5) Test on Android Studio emulator

1. Start the Android emulator first.
2. Run Expo start command.
3. In Expo terminal, press `a`.

## Useful terminal shortcuts (while Expo is running)

- `a` open Android
- `w` open web
- `r` reload app
- `m` open dev menu
- `?` show all commands

## Troubleshooting

### PowerShell blocks npm/npx scripts

Use `npm.cmd` and `npx.cmd` instead of `npm` and `npx`.

### QR not opening on phone

- Keep phone and laptop internet active.
- Use `--tunnel` mode.
- Restart Expo and rescan QR.

### App does not refresh

Press `r` in Expo terminal to reload.
