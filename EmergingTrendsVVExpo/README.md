# EmergingTrendsVVExpo Quick Start

This is the Expo version of your app for QR testing on phone and emulator.

## 1) Install app dependencies

From this folder:

```bash
cd "c:/Users/Emerging_trendsVV/EmergingTrendsVVExpo"
npm.cmd install
```

## 2) Install and run the AI backend

From the server folder:

```bash
cd "c:/Users/Emerging_trendsVV/EmergingTrendsVVExpo/server"
npm.cmd install
copy .env.example .env
npm.cmd run dev
```

By default the backend runs in `stub` mode.

To enable real AI detection, edit `server/.env`:

- `AI_MODE=openai`
- `OPENAI_API_KEY=<your key>`
- optional: `OPENAI_MODEL=gpt-4.1-mini`
- `AI_SERVER_API_KEY=<shared secret used by app>`

Then restart backend:

```bash
npm.cmd run dev
```

## 3) Point Expo app to backend

Set environment variable before starting Expo:

```bash
$env:EXPO_PUBLIC_AI_API_BASE_URL="https://ladylike-elk-playmate.ngrok-free.dev"
$env:EXPO_PUBLIC_AI_SERVER_API_KEY="vv-local-dev-key"
```

Notes:

- Use `https://ladylike-elk-playmate.ngrok-free.dev` for backend API access.

## 4) Start Expo

Preferred:

```bash
npx.cmd expo start --tunnel
```

If tunnel fails due ngrok, use LAN mode:

```bash
npx.cmd expo start --host lan
```

If port conflicts happen:

```bash
npx.cmd expo start --host lan --port 8084
```

## 5) Test on iPhone

1. Install Expo Go from App Store.
2. Open iPhone Camera.
3. Scan the QR shown in terminal.
4. Tap the Expo link to open app.

## 6) Test on Android phone

1. Install Expo Go from Play Store.
2. Scan the same QR code.
3. App opens in Expo Go.

## 7) Test on Android Studio emulator

1. Start the Android emulator first.
2. Run Expo start command.
3. In Expo terminal, press `a`.

## Useful terminal shortcuts (while Expo is running)

- `a` open Android
- `w` open web
- `r` reload app
- `m` open dev menu
- `?` show all commands

## AI Response Contract

The app expects backend response with this shape:

```json
{
	"version": "1.0",
	"provider": "openai",
	"model": "gpt-4.1-mini",
	"detectedAt": "2026-04-15T13:30:00.000Z",
	"result": {
		"itemType": "shirt",
		"color": "white",
		"secondaryColors": ["blue"],
		"material": "cotton",
		"materialNotes": "smooth weave, likely cotton blend",
		"style": "smart casual",
		"features": ["collared neckline", "button placket", "long sleeves"],
		"pattern": "solid",
		"occasion": "work",
		"confidence": 0.86,
		"reasoning": "single upper-body garment is dominant in frame",
		"warnings": []
	}
}
```

## Troubleshooting

### PowerShell blocks npm/npx scripts

Use `npm.cmd` and `npx.cmd` instead of `npm` and `npx`.

### Tunnel mode errors (ngrok)

- Try `npx.cmd expo start --host lan`.
- Keep phone and laptop on the same network.
- Check ngrok status page for outages.

### Scan AI call fails

- Ensure backend is running on port 8787.
- Verify `EXPO_PUBLIC_AI_API_BASE_URL` is reachable from device.
- Verify `EXPO_PUBLIC_AI_SERVER_API_KEY` matches `AI_SERVER_API_KEY` in server `.env`.
- Check backend mode and API key in `server/.env`.
