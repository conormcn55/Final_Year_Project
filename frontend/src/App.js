
import NavBar  from './components/NavBar';

import { createTheme, ThemeProvider } from '@mui/material/styles';
const style = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#123871',
      light: '#a6b1d2',
    },
    secondary: {
      main: 'rgba(0,154,245,0.86)',
    },
    background: {
      default: '#d4d4d6',
      paper: '#fffefe',
    },
    text: {
      primary: 'rgba(24,22,22,0.87)',
    },
  },
});

function App() {
  
  
  return (
    <ThemeProvider theme={style}>
          <NavBar />  
    </ThemeProvider>
   
  );
}

export default App;
