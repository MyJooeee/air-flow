import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AirFlow from './AirFlow'

// Réglage du système par défaut ; le choix fait avec le bouton est mémorisé par MUI
const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: { light: true, dark: true },
});

function App() {
  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline enableColorScheme />
      <AirFlow/>
    </ThemeProvider>
  )
}

export default App;
