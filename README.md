# Air Flow

Detects changes in air quality based on geolocation, and shows the local weather.

Live: https://myjooeee.github.io/air-flow/

## Setup

Requires Node ≥ 20.19. Create a `.env` file at the root with an [OpenWeather](https://openweathermap.org/api) API key:

```
VITE_OPENWEATHER_API_KEY=your_key
```

The key ends up in the client bundle, as for any front-end only app: anyone can read it, so use a key dedicated to this project.

## Scripts

| | |
|---|---|
| `npm start` | development server (Vite) |
| `npm run build` | production build in `build/` |
| `npm run preview` | serves the production build locally |
| `npm run deploy` | builds and publishes `build/` to GitHub Pages |
