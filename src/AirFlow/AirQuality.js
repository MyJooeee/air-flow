import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';

const AirQuality = ({ loading, airQuality, indexQuality}) => {
    const quality = "Quality :";
    if (loading) return `${quality} loading...`;
    if (indexQuality === 0) return null;
    let percentage = " (" + ((6 - indexQuality) / 5) * 100 + "%)";
    return <Typography variant='h5'> {quality} {airQuality[indexQuality - 1]} {percentage} </Typography>;
  };

  AirQuality.propTypes = {
    loading: PropTypes.bool,
    airQuality: PropTypes.array,
    indexQuality: PropTypes.number
  };

export default AirQuality;