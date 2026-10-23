import PropTypes from 'prop-types';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { LEVELS } from './pollutants';

// ---------------------------------------------------------------------------------
// L'indice OpenWeather (1 à 5), celui du polluant le plus mauvais
const AirQuality = ({ loading, indexQuality }) => {
  if (loading) return <Skeleton width={150} height={40} />;
  if (!indexQuality) return null;

  const level = LEVELS[indexQuality - 1];

  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', gap: 1, pl: 1.5, pr: 2, py: 0.5, borderRadius: 999, border: 1, borderColor: 'divider' }}
    >
      <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: level.color }} />
      <Typography variant="h6" component="span">
        {indexQuality}/5 · {level.label}
      </Typography>
    </Stack>
  );
};

AirQuality.propTypes = {
  loading: PropTypes.bool,
  indexQuality: PropTypes.number
};

export default AirQuality;
