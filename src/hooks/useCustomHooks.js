import { useColorScheme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const useMediaQueries = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return { isMobile };
};

// Le mode réellement affiché : celui choisi, ou celui du système quand rien n'est forcé
const useIsDarkMode = () => {
  const { mode, systemMode } = useColorScheme();
  return (mode === 'system' ? systemMode : mode) === 'dark';
};

export { useMediaQueries, useIsDarkMode };
