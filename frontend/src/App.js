
import NavBar  from './components/NavBar';

import { createTheme, ThemeProvider } from '@mui/material/styles';
const style = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ffffff',
      contrastText: '#123871',
    },
    secondary: {
      main: '#123871',
    },
    background: {
      paper: '#efefef',
    },
    text: {
      primary: '#123871',
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
