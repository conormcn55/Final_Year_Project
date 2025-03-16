import NavBar from './components/NavBar'; // Navigation bar component
import Footer from './components/Footer' // Footer component
import { createTheme, ThemeProvider } from '@mui/material/styles'; 
import { CssBaseline, Box } from '@mui/material'; 
import { useState, useEffect } from 'react'; 
import { BrowserRouter as Router } from "react-router-dom"; 

// Define light theme configuration
const lightTheme = createTheme({
 palette: {
   mode: 'light',
   primary: {
     main: '#ffffff', // White primary color
     contrastText: '#123871', // Dark blue text on primary background
   },
   secondary: {
     main: '#123871', // Dark blue secondary color
   },
   background: {
     paper: '#efefef', // Light grey for paper elements (cards, dialogs, etc.)
     default: '#ffffff', // White default background
   },
   text: {
     primary: '#123871', // Dark blue as primary text color
   },
 },
});

// Define dark theme configuration
const darkTheme = createTheme({
 palette: {
   mode: 'dark',
   primary: {
     main: '#123871', // Dark blue primary color
     contrastText: '#ffffff', // White text on primary background
   },
   secondary: {
     main: '#4674b8', // Lighter blue for secondary elements
   },
   background: {
     paper: '#1a1a1a', // Very dark grey for paper elements
     default: '#121212', // Nearly black default background
   },
   text: {
     primary: '#ffffff', // White primary text
     secondary: '#b3c5e1', // Light blue-grey secondary text
   },
 },
});

/**
* Main App component that provides theme context and basic layout
*/
function App() {
 // State to track dark/light mode
 // Initializes from localStorage if available, defaults to light mode (false)
 const [isDarkMode, setIsDarkMode] = useState(() => {
   const savedTheme = localStorage.getItem('darkMode');
   return savedTheme ? JSON.parse(savedTheme) : false;
 });

 // Save theme preference to localStorage whenever it changes
 useEffect(() => {
   localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
 }, [isDarkMode]);

 // Function to toggle between light and dark themes
 const toggleTheme = () => {
   setIsDarkMode(prevMode => !prevMode);
 };

 return (
   <Router>
     {/* Apply the selected theme */}
     <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
       {/* CssBaseline normalizes styles across browsers */}
       <CssBaseline />
       {/* Main container box that fills viewport height */}
       <Box sx={{
         minHeight: '100vh',
         bgcolor: 'background.default',
         color: 'text.primary'
       }}>
         {/* Navigation bar with theme toggle function passed as prop */}
         <NavBar onThemeToggle={toggleTheme} isDark={isDarkMode} />
         {/* Footer with theme toggle function passed as prop */}
         <Footer onThemeToggle={toggleTheme} isDark={isDarkMode} />
       </Box>
     </ThemeProvider>
   </Router>
 );
}

export default App;