import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/styles/CssBaseline';
import { Box, Snackbar, Alert } from '@mui/material';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Callback from './components/Auth/Callback';
import OAuth2Callback from './components/Auth/OAuth2Callback';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import HomePage from './components/Home/HomePage';
import ResultsPage from './components/Results/ResultsPage';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import TermsOfService from './components/Legal/TermsOfService';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Services
import { initGoogleSheetsAPI } from './services/googleSheetsService';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green color for a fresh look
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff6d00', // Orange for call-to-action elements
      light: '#ff9e40',
      dark: '#c43e00',
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #2e7d32 30%, #60ad5e 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #ff6d00 30%, #ff9e40 90%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  useEffect(() => {
    const initGoogleAPI = async () => {
      try {
        await initGoogleSheetsAPI();
      } catch (error) {
        console.error('Failed to initialize Google API:', error);
        const isMissingCredentials = !import.meta.env.VITE_GOOGLE_SHEETS_CLIENT_ID || 
                                   !import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
        setSnackbarMessage(`Google Sheets integration is not available: ${
          isMissingCredentials ? 'missing credentials' : 'origin restriction'
        }`);
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
      }
    };

    // Initialize if credentials are available
    if (import.meta.env.VITE_GOOGLE_SHEETS_CLIENT_ID &&
        import.meta.env.VITE_GOOGLE_SHEETS_API_KEY) {
      initGoogleAPI();
    }
  }, []);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
          }}>
            <Header />

            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/oauth2callback" element={<OAuth2Callback />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/results" element={<ResultsPage />} />
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>

            <Footer />

            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
