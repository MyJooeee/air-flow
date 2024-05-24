import PropTypes from 'prop-types';
import { Skeleton, Stack, Typography } from '@mui/material';

// ---------------------------------------------------------------------------------

const Weather = ({ loading, weather }) => {
    if (loading)  return <Skeleton width={180} height={40} />;
    const imgSrc =
      "https://openweathermap.org/img/wn/" + weather.icon + ".png";
    const title = weather.main;
    const description = weather.description;
    const alt = weather.icon;
    const temperature = weather.temperature;
    const humidity = weather.humidity;
    const container = {
      flexFlow: "row wrap",
      alignItems: "center",
      gap: 1
    };
    return (
      <Stack sx={container}>
        <img src={imgSrc} title={title} alt={alt} />
        <Typography>
          {temperature}°C. | {humidity}%
        </Typography>
        <Typography>
          {description}
        </Typography>
      </Stack>
    );
  };

  Weather.propTypes = {
    loading: PropTypes.bool,
    weather: PropTypes.object
  };

  export default Weather;