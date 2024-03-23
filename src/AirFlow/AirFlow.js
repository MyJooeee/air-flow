import { useEffect, useState } from "react";
// https://www.npmjs.com/package/react-chartjs-2
import { Line } from "react-chartjs-2";
import { css } from "@emotion/css";
// import { Leaflet } from "../Leaflet/index.js";

export default function AirFlow() {
  const appKey = "43cebb6f101584f15a47a1581d009ee7";
  const airQualityAPI =
    "https://api.openweathermap.org/data/2.5/air_pollution?appid=" + appKey;
  const reverseLocationAPI =
    "https://api.openweathermap.org/geo/1.0/reverse?limit=1&appid=" + appKey;
  const weatherFromLocationAPI =
    "https://api.openweathermap.org/data/2.5/weather?&units=metric&appid=" +
    appKey;
  const airQuality = [
    "good quality", // 100%
    "fair quality", // 80 %
    "moderate quality", // 60%
    "poor quality", // 40%
    "very poor quality", // 20%
  ];
  const [data, setData ]= useState ({
    label: [],
    co: [],
    o3: [],
    so2: [],
    pm2_5: [],
  });

  const baseDataLine = {
    labels: data.label,
    datasets: [
      {
        label: "Concentration of CO (Carbon monoxide), μg/m3",
        data: data.co,
        fill: false,
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgba(255, 99, 132, 0.3)",
      },
      {
        label: "Concentration of O3 (Ozone), μg/m3",
        data: data.o3,
        fill: false,
        backgroundColor: "rgb(0, 140, 255)",
        borderColor: "rgba(0, 140, 255, 0.3)",
      },
      {
        label: "Concentration of SO2 (Sulphur dioxide), μg/m3",
        data: data.so2,
        fill: false,
        backgroundColor: "rgb(199, 140, 255)",
        borderColor: "rgba(199, 140, 255, 0.3)",
      },
      {
        label: "Concentration of PM2.5 (Fine particles matter), μg/m3",
        data: data.pm2_5,
        fill: false,
        backgroundColor: "rgb(67, 245, 123)",
        borderColor: "rgba(67, 245, 123, 0.3)",
      },
    ],
  };
  
  const baseOptionsLine = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
    maintainAspectRatio: false
  };

  const [indexQuality, setIndexQuality] = useState(0);
  const [geoloc, setGeoloc] = useState({latitude: null, longitude: null, altitude: null});
  const [nameLocation, setNameLocation] = useState(null);
  const [weatherLocation, setWeatherLocation] = useState(null);
  const [loadingAirData, setLoadingAirData] = useState(true);
  const [loadingNameLocation, setLoadingNameLocation] = useState(true);
  const [loadingWeather, setLoadingWeahter] = useState(true);
  const [dataLine, setDataLine] = useState(baseDataLine);
  const [initClock, setInitClock] = useState(false);

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
          setNameLocation('Paris');
          setLoadingNameLocation(false);
          console.log(err);
        },
        options
      );
    }
  }, []);

  useEffect(() => {
    if (geoloc.latitude && geoloc.longitude) {
      if (loadingNameLocation) {
        getNameLocation();
      }
      getAirFlowData();
      getWeatherLocation();
      setInitClock(true);
    }
  }, [geoloc.latitude, geoloc.longitude, geoloc.altitude]);

  useEffect(() => {
    if (initClock) {
      const interval = setInterval(() => {
        getAirFlowData();
        getWeatherLocation();
      }, 10000);
      return () => clearInterval(interval); 
    }
  }, [initClock]);



  // API calls ----------------------------------------------------------------
  const getAirFlowData = () => {
    const url = airQualityAPI + "&lat=" + geoloc.latitude + "&lon=" + geoloc.longitude;
    fetch(url)
      .then((res) => res.json())
      .then(
        (result) => {
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

          const pm2_5 = myData.pm2_5;
          element = result.list[0].components.pm2_5;
          pm2_5.push(element);

          const label = myData.label;
          const initDate = new Date();
          const newLabel = initDate.toLocaleTimeString();
          label.push(newLabel);

          myData = { label, co, o3, so2, pm2_5 };
          setData(myData);

          setDataLine({
            labels: myData.label,
            datasets: [
              {
                label: "Concentration of CO (Carbon monoxide), μg/m3",
                data: myData.co,
                fill: false,
                backgroundColor: "rgb(255, 99, 132)",
                borderColor: "rgba(255, 99, 132, 0.3)",
              },
              {
                label: "Concentration of O3 (Ozone), μg/m3",
                data: myData.o3,
                fill: false,
                backgroundColor: "rgb(0, 140, 255)",
                borderColor: "rgba(0, 140, 255, 0.3)",
              },
              {
                label: "Concentration of SO2 (Sulphur dioxide), μg/m3",
                data: myData.so2,
                fill: false,
                backgroundColor: "rgb(199, 140, 255)",
                borderColor: "rgba(199, 140, 255, 0.3)",
              },
              {
                label: "Concentration of PM2.5 (Fine particles matter), μg/m3",
                data: myData.pm2_5,
                fill: false,
                backgroundColor: "rgb(67, 245, 123)",
                borderColor: "rgba(67, 245, 123, 0.3)",
              },
            ],
          });

          setIndexQuality(result.list[0].main.aqi);
          setLoadingAirData(false);
        },
        (error) => {
          console.log(error);
        }
      );
  };

  const getNameLocation = () => {
    const url = reverseLocationAPI + "&lat=" + geoloc.latitude + "&lon=" + geoloc.longitude;
    fetch(url)
      .then((res) => res.json())
      .then(
        (result) => {
          setNameLocation(result[0].name);
          setLoadingNameLocation(false);
        },
        (error) => {
          console.log(error);
        }
      );
  };

  const getWeatherLocation = () => {
    const url =
      weatherFromLocationAPI + "&lat=" + geoloc.latitude + "&lon=" + geoloc.longitude;
    fetch(url)
      .then((res) => res.json())
      .then(
        (result) => {
          const weather = {
            main: result.weather[0].main,
            description: result.weather[0].description,
            icon: result.weather[0].icon,
            temperature: result.main.temp,
            humidity: result.main.humidity,
          };
          setWeatherLocation(weather);
          setLoadingWeahter(false);
        },
        (error) => {
          console.log(error);
        }
      );
  };

  // Components ----------------------------------------------------------------
  const RenderTitle = () => {
    const title = "Air quality in";
    if (loadingNameLocation) return `${title} loading...`;
    return `${title} ${nameLocation}`;
  };

  const RenderAirQuality = () => {
    const quality = "Quality :";
    if (loadingAirData) return `${quality} loading...`;
    let myAirQuality = `${quality} ${airQuality[indexQuality - 1]}`;
    return (myAirQuality +=
      indexQuality !== 0 ? " (" + ((6 - indexQuality) / 5) * 100 + "%)" : "");
  };

  const RenderWeather = () => {
    if (loadingWeather) return null;
    const imgSrc =
      "https://openweathermap.org/img/wn/" + weatherLocation.icon + ".png";
    const title = weatherLocation.main;
    const description = weatherLocation.description;
    const alt = weatherLocation.icon;
    const temperature = weatherLocation.temperature;
    const humidity = weatherLocation.humidity;
    const container = {
      display: "flex",
      flexFlow: "row wrap",
      alignItems: "center",
    };
    return (
      <div className={css(container)}>
        <img src={imgSrc} title={title} alt={alt} />
        <span className={css({ fontSize: "1.2rem" })}>
          {" "}
          {temperature}°C. | {humidity}%
        </span>
        <span className={css({ fontSize: "1rem", marginLeft: "5px" })}>
          {" "}
          {description}{" "}
        </span>
      </div>
    );
  };

  // https://sevketyalcin.com/blog/responsive-charts-using-Chart.js-and-react-chartjs-2/
  const canvasContainer = {
    height: "60vh", // vh : viewport height
  };

  // Parent
  const topContainer = {
    display: "flex",
    // flexFlow: row wrap, correspond à :
    // flexDirection: 'row' : direction : ligne ou colonne
    // flewWrap: 'wrap' : bascule en ligne ou colonne si espace insuffisant
    flexFlow: "row wrap",
    alignItems: "center", // baseline : ajuste les enfants verticalement sur leur base
    justifyContent: "space-around", // ou space-evenly
  };

  const bottomContainer = {
    display: "flex",
    justifyContent: "center",
  };

  // Enfant
  // flex : { flex-grow flex-shrink flex-basis }
  // flex-grow : l'enfant choisi occupe le maximum d'espace
  // Exemple : flex: 1 1 auto

  return (
    <div className={css(canvasContainer)}>
      <div className={css(topContainer)}>
        <h1 className={css({ textAlign: "center" })}>
          {" "}
          <RenderTitle />{" "}
        </h1>
        <h2>
          {" "}
          <RenderAirQuality />{" "}
        </h2>
        <h2>
          {" "}
          <RenderWeather />{" "}
        </h2>
        {/* <Leaflet coordinates={[latitude, longitude]} altitude={altitude} /> */}
      </div>
      <Line
        height={550}
        width={1100}
        data={dataLine}
        options={baseOptionsLine}
      />
      <div className={css(bottomContainer)}>
        <small>
          Auto refresh data air quality <strong> every 5 minutes</strong>.
        </small>
      </div>
    </div>
  );
}
