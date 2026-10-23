import PropTypes from 'prop-types';
import { Skeleton, Stack, Typography } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import CloudIcon from '@mui/icons-material/Cloud';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FoggyIcon from '@mui/icons-material/Foggy';

// ---------------------------------------------------------------------------------
// Code d'icône OpenWeather (« 01d », « 10n »…) : les deux chiffres disent le ciel,
// la lettre le jour ou la nuit
const ICONS = {
  '01': { day: WbSunnyIcon, night: NightsStayIcon, color: '#F2B01E', nightColor: '#7F8FC8' },
  '02': { day: FilterDramaIcon, color: '#8A9BB0' },
  '03': { day: CloudIcon, color: '#7C8EA3' },
  '04': { day: CloudIcon, color: '#66788C' },
  '09': { day: WaterDropIcon, color: '#3E7FCF' },
  '10': { day: WaterDropIcon, color: '#3E7FCF' },
  '11': { day: ThunderstormIcon, color: '#6B5CA5' },
  '13': { day: AcUnitIcon, color: '#5FAEDB' },
  '50': { day: FoggyIcon, color: '#9AA5B1' },
};

const Weather = ({ loading, weather }) => {
  if (loading) return <Skeleton width={180} height={40} />;

  const icon = ICONS[weather.icon.slice(0, 2)] ?? ICONS['03'];
  const isNight = weather.icon.endsWith('n');
  const Icon = isNight && icon.night ? icon.night : icon.day;
  const color = isNight && icon.nightColor ? icon.nightColor : icon.color;

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <Icon titleAccess={weather.main} sx={{ fontSize: 34, color }} />
      <Typography>
        <strong>{Math.round(weather.temperature)} °C</strong> · <strong>{weather.humidity} %</strong> · {weather.description}
      </Typography>
    </Stack>
  );
};

Weather.propTypes = {
  loading: PropTypes.bool,
  weather: PropTypes.object
};

export default Weather;
