import { IconButton, Tooltip } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useIsDarkMode } from '../hooks/useCustomHooks';

// ---------------------------------------------------------------------------------
// Bascule clair / sombre. Sans clic, l'appli suit le système ; un clic force le
// mode opposé à celui affiché, et MUI le mémorise pour les visites suivantes
const ThemeToggle = () => {
  const { mode, setMode } = useColorScheme();
  const isDark = useIsDarkMode();

  // Le mode n'est connu qu'après le premier rendu : pas de bouton qui changerait d'icône
  if (!mode) return null;

  const next = isDark ? 'light' : 'dark';

  return (
    <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
      <IconButton onClick={() => setMode(next)} aria-label={`Switch to ${next} mode`}>
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
