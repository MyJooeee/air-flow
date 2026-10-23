// Indice de qualité de l'air d'OpenWeather : 1 (Good) à 5 (Very poor)
const LEVELS = [
  { label: 'Good', color: '#2FA866' },
  { label: 'Fair', color: '#8DBE2E' },
  { label: 'Moderate', color: '#E9B21F' },
  { label: 'Poor', color: '#EE7F25' },
  { label: 'Very poor', color: '#D63C36' },
];

// Seuils de l'indice OpenWeather, en µg/m³ : bornes hautes de Good, Fair, Moderate et Poor
const POLLUTANTS = [
  { id: 'pm2_5', name: 'PM2.5', longName: 'Fine particles', thresholds: [10, 25, 50, 75] },
  { id: 'pm10', name: 'PM10', longName: 'Coarse particles', thresholds: [20, 50, 100, 200] },
  { id: 'no2', name: 'NO₂', longName: 'Nitrogen dioxide', thresholds: [40, 70, 150, 200] },
  { id: 'o3', name: 'O₃', longName: 'Ozone', thresholds: [60, 100, 140, 180] },
  { id: 'so2', name: 'SO₂', longName: 'Sulphur dioxide', thresholds: [20, 80, 250, 350] },
  { id: 'co', name: 'CO', longName: 'Carbon monoxide', thresholds: [4400, 9400, 12400, 15400] },
];

// Index dans LEVELS du niveau atteint par une valeur
const levelOf = (value, thresholds) => {
  const index = thresholds.findIndex((bound) => value < bound);
  return index === -1 ? LEVELS.length - 1 : index;
};

// Haut de l'échelle d'un graphe : il suit les données, avec un plancher à 10 % du seuil
// « Good » pour qu'une valeur négligeable ne soit pas grossie au point de paraître inquiétante
const scaleMax = (values, thresholds) => {
  const peak = Math.max(...values.filter((value) => value != null));
  return Math.max(peak * 1.25, thresholds[0] * 0.1);
};

const formatValue = (value) => (value >= 100 ? Math.round(value).toString() : value.toFixed(1));

export { LEVELS, POLLUTANTS, levelOf, scaleMax, formatValue };
