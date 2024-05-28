// Core
import { useEffect, useState } from "react";
import moment from 'moment';
// Components
import { LineChart } from '@mui/x-charts/LineChart';
import { Alert, Snackbar, Stack, Typography } from '@mui/material';
import Title from './Title';
import AirQuality from './AirQuality';
import Weather from './Weather';
import Leaflet from '../Leaflet';
// Logic
import { fetchApi } from '../Promises';

// ---------------------------------------------------------------------------------

const AirFlow = () => {
  const apiKey = process.env.REACT_APP_API_KEY;
  const airQualityAPI =
    "https://api.openweathermap.org/data/2.5/air_pollution?appid=" + apiKey;
  const reverseLocationAPI =
    "https://api.openweathermap.org/geo/1.0/reverse?limit=1&appid=" + apiKey;
  const weatherFromLocationAPI =
    "https://api.openweathermap.org/data/2.5/weather?&units=metric&appid=" +
    apiKey;
    const airQuality = [
      "good quality", // 100%
      "fair quality", // 80 %
      "moderate quality", // 60%
      "poor quality", // 40%
      "very poor quality", // 20%
    ];
  const [refreshAt, setRefreshAt] = useState(new Date());
  const [state, setState] = useState({
    open: false,
    message: null,
    severity: 'error',
    vertical: 'top',
    horizontal: 'right',
  });
  const { open , message, severity, vertical, horizontal } = state;
  const [data, setData] = useState ({
    times: [],
    co: [],
    o3: [],
    so2: [],
    pm25: [],
  });

  const [geoloc, setGeoloc] = useState({latitude: null, longitude: null, altitude: null});
  const [nameLoc, setNameLoc] = useState(null);
  const [weatherLoc, setWeatherLoc] = useState({
    main: null,
    description: null,
    icon: null,
    temperature: null,
    humidity: null,
  });
  const [loadingNameLoc, setLoadingNameLoc] = useState(true);
  const [indexQuality, setIndexQuality] = useState(0);
  const [loadingAirQuality, setLoadingAirQuality] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [initClock, setInitClock] = useState(false);


// Effects -------------------------------------------------------------------------
useEffect(() => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      };
      // Position de l'utilisateur en temps réel
      // navigator.geolocation.watchPosition(
      // Position de l'utilisateur au premier lancement
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoloc({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude
          });
        },
        (err) => {
          console.log(err);

          // Service location denied by user
          // Default Paris
          setGeoloc({
            latitude: 48.856614,
            longitude: 2.3522219,
            altitude: 35
          });
          setNameLoc('Paris');
          setLoadingNameLoc(false);
        },
        options
      );
    }
  }, []);

  useEffect(() => {
    if (geoloc.latitude && geoloc.longitude) {
      if (loadingNameLoc) {
        setNameLocation();
      }

      if (userSpamsApi()) return;

      setAirQuality();
      setWeatherLocation();
      localStorage.setItem("lastFetch", moment().format("YYYY-MM-DD HH:mm:ss"));
      setInitClock(true);
    }
  }, [geoloc.latitude, geoloc.longitude, geoloc.altitude]);

  useEffect(() => {
    if (initClock) {
      const interval = setInterval(() => {
        setAirQuality();
        setWeatherLocation();
        localStorage.setItem("lastFetch", moment().format("YYYY-MM-DD HH:mm:ss"));
      }, 5*60*1000 ); // Every 5 minutes
      return () => clearInterval(interval); 
    }
  }, [initClock]);

// Handlers -------------------------------------------------------------------------

const handleClose = () => {
  setState({ ...state, open: false });
};

// Functions -------------------------------------------------------------------------

  // Avoid to spam API
  const userSpamsApi = () => {
    const lastFetch = localStorage.getItem("lastFetch");
    if (lastFetch) {
      const seconds = moment().diff(moment(lastFetch), 'seconds');
      if (seconds <= 10) {
        setState({ ...state, severity: 'warning', message: 'Retry to fetch API later please', open: true });
        return true;
      }
    }
    return false;
  }

  const setAirQuality = async () => {

    try {
      const url = airQualityAPI + "&lat=" + geoloc.latitude + "&lon=" + geoloc.longitude;
      const result = await fetchApi(url, (err) => {
        setState({ ...state, message: 'Air quality data API error', open: true });
        return;
      });

      let myData = { ...data };

      const co = myData.co;
      const o3 = myData.o3;
      const so2 = myData.so2;
      const pm25 = myData.pm25;

      const lenCo = co.length;
      const lenO3 = o3.length;
      const lenSo2 = so2.length;
      const lenPm25 = pm25.length;
      
      const newCo = result.list[0].components.co;
      const newO3 = result.list[0].components.o3;
      const newSo2 = result.list[0].components.so2;
      const newPm25 = result.list[0].components.pm2_5;

      setRefreshAt(new Date());
      // If no data has changed
      if((lenCo && co[lenCo - 1] === newCo)
        && (lenO3 && o3[lenO3 - 1] === newO3)
        && (lenSo2 && so2[lenSo2 - 1] === newSo2)
        && (lenPm25 && pm25[lenPm25 - 1] === newPm25)
      ) {
        return;
      }

      co.push(newCo);
      o3.push(newO3);
      so2.push(newSo2);
      pm25.push(newPm25);
      const times = myData.times;
      times.push(new Date());

      myData = { times, co, o3, so2, pm25 };

      setData(myData);
      setIndexQuality(result.list[0].main.aqi);
      setLoadingAirQuality(false);

  } catch (error) {
    setState({ ...state, message:  'Air quality data processing error', open: true });
  }
    
  };

  const setNameLocation = async () => {
    try {
      const url = reverseLocationAPI + "&lat=" + geoloc.latitude + "&lon=" + geoloc.longitude;
      const result = await fetchApi(url, (err) => {
        setState({ ...state, message:  'Name location data API error', open: true });
        return;
      });
      setNameLoc(result[0].name);
      setLoadingNameLoc(false);
    } catch (error) {
      setState({ ...state, message:  'Name location data processing error', open: true });
    }
    
  };

  const setWeatherLocation = async () => {
    try {
      const url =
      weatherFromLocationAPI + "&lat=" + geoloc.latitude + "&lon=" + geoloc.longitude;
      const result = await fetchApi(url, (err) => {
        setState({ ...state, message:  'Weather location data API error', open: true });
        return;
      });

    const newMain = result.weather[0].main;
    const newDescription = result.weather[0].description;
    const newIcon = result.weather[0].icon;
    const newTemp = result.main.temp;
    const newHumidity = result.main.humidity;

    // If no data has changed
    if (weatherLoc.main === newMain
      && weatherLoc.description === newDescription
      && weatherLoc.icon === newIcon
      && weatherLoc.temperature === newTemp
      && weatherLoc.humidity === newHumidity
    ) {
      return;
    }

    const weather = {
      main: newMain,
      description: newDescription,
      icon: newIcon,
      temperature: newTemp,
      humidity: newHumidity,
    };
    setWeatherLoc(weather);
    setLoadingWeather(false);
    } catch(error) {
      setState({ ...state, message:  'Weather location data processing error', open: true });
    }
  };

  // JSX -------------------------------------------------------------------------
  return (
    <>
      <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          autoHideDuration={5000}
          open={open}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity={severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {message}
          </Alert>
          </Snackbar>
      <Stack>
        <Stack sx={topContainer}>
            <Title loading={loadingNameLoc} name={nameLoc}/>
            <AirQuality 
              loading={loadingAirQuality} 
              airQuality={airQuality} 
              indexQuality={indexQuality}
            />
            <Weather loading={loadingWeather} weather={weatherLoc} />
          <Leaflet geoloc={geoloc} />
        </Stack>
        <LineChart
          xAxis={[
            {
              label: "Hours",
              data: data.times,
              scaleType: "time",
              valueFormatter: (time) => moment(time).format("HH:mm:ss")
            },
          ]}
          yAxis={[{ label: "Concentration of particles, μg/m3" }]}
          series={[
            {
              label: "CO (Carbon monoxide)",
              data: data.co,
            },
            {
              label: "O3 (Ozone)",
              data: data.o3,
            },
            {
              label: "SO2 (Sulphur dioxide)",
              data: data.so2,
            },
            {
              label: "PM2.5 (Fine particles matter)",
              data: data.pm25,
            }
          ]}
          height={400}
          margin={{ left: 60, right: 30, top: 30, bottom: 60 }}
          grid={{ vertical: true, horizontal: true }}
        />
        <Typography sx={{ textAlign: 'center' }}>
          Air Flow detects changes in air quality <strong> every 5 minutes </strong> 
           (last check : <strong> {moment(refreshAt).format("HH:mm:ss")}) </strong>.
        </Typography>
      </Stack>
    </>
  );
};

// Styles -------------------------------------------------------------------------
const topContainer = {
  flexFlow: "row wrap",
  alignItems: "center",
  justifyContent: "space-around",
};

export default AirFlow;
