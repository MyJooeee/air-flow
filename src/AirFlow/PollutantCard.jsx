// Core
import { useId } from 'react';
import PropTypes from 'prop-types';
// Components
import { Box, Paper, Stack, Typography } from '@mui/material';
import { ChartsContainer } from '@mui/x-charts/ChartsContainer';
import { AreaPlot, LinePlot } from '@mui/x-charts/LineChart';
import { ChartsAxis } from '@mui/x-charts/ChartsAxis';
import { ChartsAxisHighlight } from '@mui/x-charts/ChartsAxisHighlight';
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { useDrawingArea, useXScale, useYScale } from '@mui/x-charts/hooks';
import { useTheme } from '@mui/material/styles';
// Logic
import { CHART_INK, LEVELS, levelOf, scaleMax, formatValue } from './pollutants';
import { useIsDarkMode } from '../hooks/useCustomHooks';

// ---------------------------------------------------------------------------------
const HOUR = 3600 * 1000;

const formatHour = (date) => new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const formatDayHour = (date) => new Date(date).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' });

// Graduations sur les heures rondes, toutes les 6 h (00:00, 06:00, 12:00, 18:00 en heure locale)
const sixHourTicks = (start, end) => {
  const tick = new Date(start);
  tick.setMinutes(0, 0, 0);
  if (tick.getTime() < start) tick.setHours(tick.getHours() + 1);
  while (tick.getHours() % 6) tick.setHours(tick.getHours() + 1);
  const ticks = [];
  for (; tick.getTime() <= end; tick.setHours(tick.getHours() + 6)) ticks.push(new Date(tick));
  return ticks;
};

const PollutantCard = ({ pollutant, times, measured, forecast, now }) => {
  const gradientId = useId();
  const ink = useIsDarkMode() ? CHART_INK.dark : CHART_INK.light;
  const { name, longName, thresholds } = pollutant;
  const nowIndex = measured.findLastIndex((value) => value != null);
  const current = measured[nowIndex];
  const level = levelOf(current, thresholds);

  // Le pic des prochaines 24 h, s'il y a une prévision
  let peak = null;
  forecast.forEach((value, index) => {
    if (index > nowIndex && value != null && (peak === null || value > peak.value)) {
      peak = { value, time: times[index] };
    }
  });
  const peakLevel = peak && levelOf(peak.value, thresholds);
  const max = scaleMax([...measured, ...forecast], thresholds);
  const start = now - 24 * HOUR;
  const end = now + 24 * HOUR;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, pb: 1, display: 'grid', gap: 0.5, minWidth: 0 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 500 }}>{name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{longName}</Typography>
        </Box>
        <LevelChip level={level} />
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'baseline', gap: 0.75 }}>
        <Typography sx={{ fontSize: 30, fontWeight: 500, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
          {formatValue(current)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>µg/m³</Typography>
      </Stack>
      {peak && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Next 24 h peak: <strong>{formatValue(peak.value)}</strong> at {formatHour(peak.time)}
          {peakLevel !== level && (
            <Box component="span" sx={{ color: LEVELS[peakLevel].color, fontWeight: 500 }}> · {LEVELS[peakLevel].label}</Box>
          )}
        </Typography>
      )}
      {/* Le SVG du graphe porte une grid-area nommée : isolé dans une boîte, il ne dérègle pas la carte */}
      <Box>
        <ChartsContainer
          height={150}
          margin={{ top: 8, right: 0, bottom: 0, left: 14 }}
          xAxis={[{
            scaleType: 'time',
            data: times.map((time) => new Date(time)),
            min: new Date(start),
            max: new Date(end),
            tickInterval: sixHourTicks(start, end),
            height: 22,
            tickLabelStyle: { fontSize: 10.5 },
            valueFormatter: (date, context) => (context.location === 'tick' ? formatHour(date) : formatDayHour(date)),
          }]}
          yAxis={[{
            min: 0,
            max,
            position: 'right',
            width: 38,
            tickNumber: 3,
            tickLabelStyle: { fontSize: 10.5 },
            valueFormatter: (value) => formatValue(value),
          }]}
          series={[
            { id: 'measured', type: 'line', data: measured, color: ink, area: true, showMark: false, label: 'Measured',
              valueFormatter: (value) => (value == null ? null : `${formatValue(value)} µg/m³`) },
            { id: 'forecast', type: 'line', data: forecast, color: ink, area: true, showMark: false, label: 'Forecast',
              valueFormatter: (value) => (value == null ? null : `${formatValue(value)} µg/m³`) },
          ]}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={ink} stopOpacity={0.28} />
              <stop offset="1" stopColor={ink} stopOpacity={0} />
            </linearGradient>
          </defs>
          <LevelBands thresholds={thresholds} max={max} />
          <AreaPlot
            slotProps={{
              area: ({ seriesId }) => ({ fill: `url(#${gradientId})`, fillOpacity: seriesId === 'forecast' ? 0.45 : 1 }),
            }}
          />
          <LinePlot
            slotProps={{
              line: ({ seriesId }) => ({ strokeWidth: 2.2, strokeDasharray: seriesId === 'forecast' ? '5 4' : undefined }),
            }}
          />
          <ChartsReferenceLine
            x={new Date(now)}
            label="Now"
            labelAlign="start"
            labelStyle={{ fontSize: 10.5, fontWeight: 500 }}
            lineStyle={{ strokeDasharray: '3 3', strokeOpacity: 0.4 }}
          />
          <ChartsAxisHighlight x="line" />
          <ChartsAxis />
          <NowDot time={times[nowIndex]} value={current} color={ink} />
          <ChartsTooltip trigger="axis" />
        </ChartsContainer>
      </Box>
    </Paper>
  );
};

PollutantCard.propTypes = {
  pollutant: PropTypes.object,
  times: PropTypes.array,
  measured: PropTypes.array,
  forecast: PropTypes.array,
  now: PropTypes.number
};

export default PollutantCard;

// Local components -------------------------------------------------------------------------

const LevelChip = ({ level }) => (
  <Stack
    direction="row"
    sx={{
      alignItems: 'center',
      gap: 0.75,
      px: 1.25,
      py: 0.25,
      borderRadius: 999,
      bgcolor: `${LEVELS[level].color}29`,
      fontSize: 12.5,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}
  >
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: LEVELS[level].color }} />
    {LEVELS[level].label}
  </Stack>
);

LevelChip.propTypes = {
  level: PropTypes.number
};

// Les bandes de l'indice, sous les courbes, à l'échelle du graphe
const LevelBands = ({ thresholds, max }) => {
  const { left, width } = useDrawingArea();
  const yScale = useYScale();
  const bounds = [0, ...thresholds, Infinity];

  return LEVELS.map((level, index) => {
    const low = bounds[index];
    if (low >= max) return null;
    const high = Math.min(bounds[index + 1], max);
    const top = yScale(high);
    return (
      <g key={level.label}>
        <rect x={left} y={top} width={width} height={yScale(low) - top} fill={level.color} fillOpacity={0.13} />
        {high < max && (
          <line x1={left} x2={left + width} y1={top} y2={top} stroke={level.color} strokeOpacity={0.6} strokeDasharray="2 3" />
        )}
      </g>
    );
  });
};

LevelBands.propTypes = {
  thresholds: PropTypes.array,
  max: PropTypes.number
};

const NowDot = ({ time, value, color }) => {
  const xScale = useXScale();
  const yScale = useYScale();
  const theme = useTheme();
  return (
    <circle
      cx={xScale(new Date(time))}
      cy={yScale(value)}
      r={4.5}
      style={{ fill: theme.vars.palette.background.paper }}
      stroke={color}
      strokeWidth={2.4}
    />
  );
};

NowDot.propTypes = {
  time: PropTypes.number,
  value: PropTypes.number,
  color: PropTypes.string
};
