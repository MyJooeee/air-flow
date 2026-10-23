// Core
import { useEffect, useState } from 'react';
// Components
import { LineChart } from '@mui/x-charts/LineChart';
import { Alert, Snackbar, Stack, Typography } from '@mui/material';
import Title from './Title';
import AirQuality from './AirQuality';
import Weather from './Weather';
import Leaflet from '../Leaflet';
// Logic
import { fetchApi } from '../Promises';
import { useMediaQueries } from '../hooks/useCustomHooks';
import { version } from '../../package.json';

// ---------------------------------------------------------------------------------
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const API_URL = 'https://api.openweathermap.org';
// La clé gratuite est partagée par tous les visiteurs : une actualisation toutes les
// 5 minutes, jamais plus souvent, même en rechargeant la page
const REFRESH_DELAY = 5 * 60 * 1000;
const LAST_FETCH_KEY = 'lastFetch';
const CACHE_KEY = 'airFlowCache';
const PARIS = { latitude: 48.856614, longitude: 2.3522219, altitude: 35, name: 'Paris' };
const AIR_QUALITY = [
  'good quality', // 100%
  'fair quality', // 80 %
  'moderate quality', // 60%
  'poor quality', // 40%
  'very poor quality', // 20%
];
const EMPTY_DATA = { times: [], co: [], o3: [], so2: [], pm25: [] };

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

// Un point n'est ajouté au graphe que si une mesure a changé
const appendPoint = (prev, components) => {
  const last = prev.times.length - 1;
  if (last >= 0
    && prev.co[last] === components.co
    && prev.o3[last] === components.o3
    && prev.so2[last] === components.so2
    && prev.pm25[last] === components.pm2_5
  ) {
    return prev;
  }

  return {
    times: [...prev.times, Date.now()],
    co: [...prev.co, components.co],
    o3: [...prev.o3, components.o3],
    so2: [...prev.so2, components.so2],
    pm25: [...prev.pm25, components.pm2_5],
  };
};

const toWeather = (result) => ({
  main: result.weather[0].main,
  description: result.weather[0].description,
  icon: result.weather[0].icon,
  temperature: result.main.temp,
  humidity: result.main.humidity,
});

const AirFlow = () => {
  const { isMobile } = useMediaQueries();
  const [snackbar, setSnackbar] = useState({ open: false, message: null, severity: 'error' });
  const [geoloc, setGeoloc] = useState(null);
  const [nameLoc, setNameLoc] = useState(null);
  const [weatherLoc, setWeatherLoc] = useState(null);
  const [indexQuality, setIndexQuality] = useState(0);
  const [data, setData] = useState(EMPTY_DATA);
  const [refreshAt, setRefreshAt] = useState(null);

  const { latitude, longitude, name: geolocName } = geoloc ?? {};

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
    const cached = samePlace(cache, latitude, longitude) ? cache : null;
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
      writeStorage(LAST_FETCH_KEY, Date.now());
      setRefreshAt(Date.now());

      const [air, weather] = await Promise.allSettled([
        fetchApi(`${API_URL}/data/2.5/air_pollution?${query}`),
        fetchApi(`${API_URL}/data/2.5/weather?units=metric&${query}`),
      ]);

      if (air.status === 'fulfilled') {
        const { main, components } = air.value.list[0];
        setIndexQuality(main.aqi);
        setData((prev) => appendPoint(prev, components));
      } else {
        notify(`Air quality unavailable (${air.reason.message})`);
      }

      if (weather.status === 'fulfilled') {
        setWeatherLoc(toWeather(weather.value));
      } else {
        notify(`Weather unavailable (${weather.reason.message})`);
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
      setIndexQuality(cached.indexQuality);
      setWeatherLoc(cached.weatherLoc);
      setData(cached.data);
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
    if (!indexQuality || latitude == null) return;
    writeStorage(CACHE_KEY, { latitude, longitude, nameLoc, indexQuality, weatherLoc, data });
  }, [latitude, longitude, nameLoc, indexQuality, weatherLoc, data]);

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
      <Stack>
        <Stack sx={topContainer}>
          <Title loading={!nameLoc} name={nameLoc} />
          <AirQuality
            loading={!indexQuality}
            airQuality={AIR_QUALITY}
            indexQuality={indexQuality}
          />
          <Weather loading={!weatherLoc} weather={weatherLoc} />
          <Leaflet geoloc={geoloc} />
        </Stack>
        <LineChart
          xAxis={[
            {
              label: 'Hours',
              data: data.times.map((time) => new Date(time)),
              scaleType: 'time',
              valueFormatter: (time) => formatTime(time),
            },
          ]}
          yAxis={[{ label: 'Concentration of particles, μg/m3' }]}
          series={[
            {
              label: 'CO (Carbon monoxide)',
              showMark: true,
              data: data.co,
            },
            {
              label: 'O3 (Ozone)',
              showMark: true,
              data: data.o3,
            },
            {
              label: 'SO2 (Sulphur dioxide)',
              showMark: true,
              data: data.so2,
            },
            {
              label: 'PM2.5 (Fine particles matter)',
              showMark: true,
              data: data.pm25,
            }
          ]}
          height={400}
          grid={{ vertical: true, horizontal: true }}
        />
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

// Styles -------------------------------------------------------------------------
const topContainer = {
  flexFlow: 'row wrap',
  alignItems: 'center',
  justifyContent: 'space-around',
};

export default AirFlow;
