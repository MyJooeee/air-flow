import PropTypes from 'prop-types';
import { Skeleton, Typography } from '@mui/material';

// ---------------------------------------------------------------------------------

const AirQuality = ({ loading, airQuality, indexQuality}) => {
  if (loading) return <Skeleton width={150} height={40} />;
    const quality = "Quality :";
    if (indexQuality === 0) return null;
    let percentage = " (" + ((6 - indexQuality) / 5) * 100 + "%)";
    return <Typography variant='h5' sx={{ textAlign: 'center' }}> {quality} {airQuality[indexQuality - 1]} {percentage} </Typography>;
  };

  AirQuality.propTypes = {
    loading: PropTypes.bool,
    airQuality: PropTypes.array,
    indexQuality: PropTypes.number
  };

export default AirQuality;