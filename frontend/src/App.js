import NavBar from './components/NavBar';
import Footer from './components/Footer'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from "react-router-dom";

const lightTheme = createTheme({
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
      default: '#ffffff',
    },
    text: {
      primary: '#123871',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#123871',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4674b8',
    },
    background: {
      paper: '#1a1a1a',
      default: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3c5e1',
    },
  },
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <Router>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Box sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary'
        }}>
          <NavBar onThemeToggle={toggleTheme} isDark={isDarkMode} />
          <Footer onThemeToggle={toggleTheme} isDark={isDarkMode} />
        </Box>
      </ThemeProvider>
    </Router>
  );
}

export default App;