// Core
import { useEffect, useState } from "react";
import moment from 'moment';
// Components
import { LineChart } from '@mui/x-charts/LineChart';
import { Stack, Typography } from '@mui/material';
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
          // Service location denied by user
          // Default Paris
          setGeoloc({
            latitude: 48.856614,
            longitude: 2.3522219,
            altitude: 35
          });
          setNameLoc('Paris');
          setLoadingNameLoc(false);
          console.log(err);
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
      setAirQuality();
      setWeatherLocation();
      setInitClock(true);
    }
  }, [geoloc.latitude, geoloc.longitude, geoloc.altitude]);

  useEffect(() => {
    if (initClock) {
      const interval = setInterval(() => {
        setAirQuality();
        setWeatherLocation();
      }, 60000);
      return () => clearInterval(interval); 
    }
  }, [initClock]);



// Functions -------------------------------------------------------------------------
  const setAirQuality = async () => {

    const url = airQualityAPI + "&lat=" + geoloc.latitude + "&lon=" + geoloc.longitude;
    const result = await fetchApi(url);

    let myData = { ...data };

    const co = myData.co;
    let element = result.list[0].components.co;
    co.push(element);

    const o3 = myData.o3;
    element = result.list[0].components.o3;
    o3.push(element);

    const so2 = myData.so2;
    element = result.list[0].components.so2;
    so2.push(element);

    const pm25 = myData.pm25;
    element = result.list[0].components.pm2_5;
    pm25.push(element);

    const times = myData.times;
    times.push(new Date());

    myData = { times, co, o3, so2, pm25 };

    setData(myData);
    setIndexQuality(result.list[0].main.aqi);
    setLoadingAirQuality(false);
    
  };

  const setNameLocation = async () => {
    const url = reverseLocationAPI + "&lat=" + geoloc.latitude + "&lon=" + geoloc.longitude;
    const result = await fetchApi(url);
    setNameLoc(result[0].name);
    setLoadingNameLoc(false);
  };

  const setWeatherLocation = async () => {
    const url =
      weatherFromLocationAPI + "&lat=" + geoloc.latitude + "&lon=" + geoloc.longitude;
      const result = await fetchApi(url);

    if (weatherLoc.main !== result.weather[0].main
      && weatherLoc.description !== result.weather[0].description
      && weatherLoc.icon !== result.weather[0].icon
      && weatherLoc.temperature !== result.main.temp
      && weatherLoc.humidity !== result.main.humidity
    ) {
      const weather = {
        main: result.weather[0].main,
        description: result.weather[0].description,
        icon: result.weather[0].icon,
        temperature: result.main.temp,
        humidity: result.main.humidity,
      };
      setWeatherLoc(weather);
    }
    setLoadingWeather(false);
  };

  // JSX -------------------------------------------------------------------------
  return (
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
      <Typography sx={{ alignSelf: 'center' }}>
        Auto refresh data air quality <strong> every 5 minutes</strong>.
      </Typography>
    </Stack>
  );
};

// Styles -------------------------------------------------------------------------
const topContainer = {
  flexFlow: "row wrap",
  alignItems: "center",
  justifyContent: "space-around",
};

export default AirFlow;
