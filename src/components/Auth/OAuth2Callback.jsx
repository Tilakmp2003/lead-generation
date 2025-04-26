import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { initGoogleSheetsAPI } from '../../services/googleSheetsService';

const OAuth2Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Processing Google OAuth callback');

        await initGoogleSheetsAPI();
        
        // The Google OAuth flow will handle the token automatically
        // Just need to redirect back to the previous page
        const returnPath = sessionStorage.getItem('returnPath') || '/';
        sessionStorage.removeItem('returnPath');
        
        navigate(returnPath);
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        setError(error.message || 'Authentication failed. Please try again.');
        
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        p: 3
      }}
    >
      {error ? (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
          {error}
        </Alert>
      ) : (
        <>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Completing Google Sheets authorization...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please wait while we complete the setup.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default OAuth2Callback;