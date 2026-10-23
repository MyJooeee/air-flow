// Core
import { useEffect, useMemo, useState } from 'react';
// Components
import { Alert, Box, Skeleton, Snackbar, Stack, Typography } from '@mui/material';
import Title from './Title';
import AirQuality from './AirQuality';
import Weather from './Weather';
import PollutantCard from './PollutantCard';
import Leaflet from '../Leaflet';
// Logic
import { fetchApi } from '../Promises';
import { useMediaQueries } from '../hooks/useCustomHooks';
import { LEVELS, POLLUTANTS } from './pollutants';
import { version } from '../../package.json';

// ---------------------------------------------------------------------------------
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const API_URL = 'https://api.openweathermap.org';
// La clé gratuite est partagée par tous les visiteurs : une actualisation toutes les
// 5 minutes, jamais plus souvent, même en rechargeant la page
const REFRESH_DELAY = 5 * 60 * 1000;
// L'historique et la prévision sont horaires : les relire plus souvent ne rapporte rien
const SERIES_DELAY = 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const LAST_FETCH_KEY = 'lastFetch';
const CACHE_KEY = 'airFlowCache';
const PARIS = { latitude: 48.856614, longitude: 2.3522219, altitude: 35, name: 'Paris' };
const EMPTY_AIR = { current: null, history: [], forecast: [], seriesAt: 0 };

const formatTime = (date) => new Date(date).toLocaleTimeString('en-GB'); // HH:mm:ss

const formatDelay = (ms) => {
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, '0')} s`;
};

// Le stockage peut être indisponible (navigation privée…) : l'appli fonctionne sans
const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // rien à faire : le cache n'est qu'un confort
  }
};

// Le cache ne vaut que pour le même endroit (à environ un kilomètre près)
const samePlace = (cache, latitude, longitude) =>
  cache && Math.abs(cache.latitude - latitude) < 0.01 && Math.abs(cache.longitude - longitude) < 0.01;

const toPoint = (item) => ({ dt: item.dt * 1000, aqi: item.main.aqi, components: item.components });

const toWeather = (result) => ({
  main: result.weather[0].main,
  description: result.weather[0].description,
  icon: result.weather[0].icon,
  temperature: result.main.temp,
  humidity: result.main.humidity,
});

// 24 h mesurées, la mesure courante, 24 h prévues : deux séries par polluant qui se
// rejoignent sur la mesure courante (trait plein, puis pointillés)
const buildTimeline = ({ current, history, forecast }) => {
  if (!current) return null;

  const now = current.dt;
  const past = history.filter((point) => point.dt < now && point.dt >= now - 24 * HOUR);
  const next = forecast.filter((point) => point.dt > now && point.dt <= now + 24 * HOUR);
  const times = [...past.map((point) => point.dt), now, ...next.map((point) => point.dt)];
  const series = Object.fromEntries(POLLUTANTS.map(({ id }) => [id, {
    measured: [...past.map((point) => point.components[id]), current.components[id], ...next.map(() => null)],
    forecast: [...past.map(() => null), current.components[id], ...next.map((point) => point.components[id])],
  }]));

  return { now, times, series };
};

const AirFlow = () => {
  const { isMobile } = useMediaQueries();
  const [snackbar, setSnackbar] = useState({ open: false, message: null, severity: 'error' });
  const [geoloc, setGeoloc] = useState(null);
  const [nameLoc, setNameLoc] = useState(null);
  const [weatherLoc, setWeatherLoc] = useState(null);
  const [air, setAir] = useState(EMPTY_AIR);
  const [refreshAt, setRefreshAt] = useState(null);

  const { latitude, longitude, name: geolocName } = geoloc ?? {};
  const timeline = useMemo(() => buildTimeline(air), [air]);

// Effects -------------------------------------------------------------------------
  useEffect(() => {
    // Localisation refusée ou indisponible : Paris par défaut
    if (!navigator.geolocation) {
      setGeoloc(PARIS);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGeoloc({ latitude: coords.latitude, longitude: coords.longitude, altitude: coords.altitude });
      },
      () => setGeoloc(PARIS),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    const query = `lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    const notify = (message, severity = 'error') => setSnackbar({ open: true, message, severity });
    const cache = readStorage(CACHE_KEY);
    // Un cache d'un autre endroit, ou d'un ancien format, est ignoré
    const cached = samePlace(cache, latitude, longitude) && cache.air?.current ? cache : null;
    let seriesAt = cached?.air?.seriesAt ?? 0;
    let interval = null;

    // Le nom du lieu ne change pas : demandé une seule fois
    if (geolocName) {
      setNameLoc(geolocName);
    } else if (cached?.nameLoc) {
      setNameLoc(cached.nameLoc);
    } else {
      fetchApi(`${API_URL}/geo/1.0/reverse?limit=1&${query}`)
        .then((result) => setNameLoc(result[0]?.name ?? 'your location'))
        .catch((error) => notify(`Location name unavailable (${error.message})`));
    }

    const refresh = async () => {
      const startedAt = Date.now();
      const needSeries = startedAt - seriesAt >= SERIES_DELAY;
      const end = Math.floor(startedAt / 1000);
      writeStorage(LAST_FETCH_KEY, startedAt);
      setRefreshAt(startedAt);

      const [current, weather, history, forecast] = await Promise.allSettled([
        fetchApi(`${API_URL}/data/2.5/air_pollution?${query}`),
        fetchApi(`${API_URL}/data/2.5/weather?units=metric&${query}`),
        ...(needSeries ? [
          fetchApi(`${API_URL}/data/2.5/air_pollution/history?start=${end - 24 * 3600}&end=${end}&${query}`),
          fetchApi(`${API_URL}/data/2.5/air_pollution/forecast?${query}`),
        ] : []),
      ]);

      if (current.status === 'fulfilled') {
        setAir((prev) => ({ ...prev, current: toPoint(current.value.list[0]) }));
      } else {
        notify(`Air quality unavailable (${current.reason.message})`);
      }

      if (weather.status === 'fulfilled') {
        setWeatherLoc(toWeather(weather.value));
      } else {
        notify(`Weather unavailable (${weather.reason.message})`);
      }

      if (needSeries) {
        if (history.status === 'fulfilled' && forecast.status === 'fulfilled') {
          seriesAt = startedAt;
          setAir((prev) => ({
            ...prev,
            history: history.value.list.map(toPoint),
            forecast: forecast.value.list.map(toPoint),
            seriesAt,
          }));
        } else {
          notify(`History or forecast unavailable (${(history.reason ?? forecast.reason).message})`);
        }
      }
    };

    const startCycle = () => {
      refresh();
      interval = setInterval(refresh, REFRESH_DELAY);
    };

    const lastFetch = readStorage(LAST_FETCH_KEY) ?? 0;
    const elapsed = Date.now() - lastFetch;

    if (elapsed >= REFRESH_DELAY) {
      startCycle();
      return () => clearInterval(interval);
    }

    // Trop tôt pour rappeler l'API : on réaffiche les dernières données reçues,
    // et le cycle reprend quand les 5 minutes sont écoulées
    if (cached) {
      setAir(cached.air);
      setWeatherLoc(cached.weatherLoc);
      setRefreshAt(lastFetch);
    }
    notify(`Data from ${formatTime(lastFetch)}. Retry in ${formatDelay(REFRESH_DELAY - elapsed)}.`, 'warning');
    const timeout = setTimeout(startCycle, REFRESH_DELAY - elapsed);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [latitude, longitude, geolocName]);

  useEffect(() => {
    if (!air.current || latitude == null) return;
    writeStorage(CACHE_KEY, { latitude, longitude, nameLoc, weatherLoc, air });
  }, [latitude, longitude, nameLoc, weatherLoc, air]);

// Handlers -------------------------------------------------------------------------
  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // JSX -------------------------------------------------------------------------
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={5000}
        open={snackbar.open}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Stack sx={{ gap: 3, px: { xs: 2, sm: 3 }, py: 2, maxWidth: 1280, mx: 'auto' }}>
        <Stack sx={topContainer}>
          <Title loading={!nameLoc} name={nameLoc} />
          <AirQuality loading={!air.current} indexQuality={air.current?.aqi} />
          <Weather loading={!weatherLoc} weather={weatherLoc} />
          <Leaflet geoloc={geoloc} />
        </Stack>
        <Legend />
        <Box sx={cardsGrid}>
          {POLLUTANTS.map((pollutant) => (timeline ? (
            <PollutantCard
              key={pollutant.id}
              pollutant={pollutant}
              times={timeline.times}
              measured={timeline.series[pollutant.id].measured}
              forecast={timeline.series[pollutant.id].forecast}
              now={timeline.now}
            />
          ) : (
            <Skeleton key={pollutant.id} variant="rounded" height={268} />
          )))}
        </Box>
        <Stack sx={{ gap: 2 }}>
          <Typography sx={{ textAlign: 'center' }}>
            <strong> Air Flow </strong> {!isMobile ? 'detects changes in' : ''} air quality
            (checked at : <strong> {refreshAt ? formatTime(refreshAt) : '–'}</strong>).
          </Typography>
          <Typography variant='caption' sx={{ textAlign: 'center' }}>
            © {new Date().getFullYear()} Jonathan Dancette, all rights reserved. | v{version}
          </Typography>
        </Stack>
      </Stack>
    </>
  );
};

export default AirFlow;

// Local components -------------------------------------------------------------------------

const Legend = () => (
  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: '8px 24px', color: 'text.secondary', fontSize: 13 }}>
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 22, borderTop: '2.5px solid #2C6A9E' }} />Measured, last 24 h
    </Stack>
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 22, borderTop: '2.5px dashed #2C6A9E' }} />Forecast, next 24 h
    </Stack>
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <Stack direction="row" sx={{ borderRadius: 1, overflow: 'hidden' }}>
        {LEVELS.map((level) => <Box key={level.label} sx={{ width: 18, height: 10, bgcolor: level.color }} />)}
      </Stack>
      OpenWeather index: Good → Very poor
    </Stack>
  </Stack>
);

// Styles -------------------------------------------------------------------------
const topContainer = {
  flexFlow: 'row wrap',
  alignItems: 'center',
  justifyContent: 'space-around',
  gap: 2,
};

const cardsGrid = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
};
