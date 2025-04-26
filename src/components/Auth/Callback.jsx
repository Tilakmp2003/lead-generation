import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback: Processing OAuth redirect');

        // Get the hash or query parameters from the URL
        const hashParams = window.location.hash;
        const queryParams = window.location.search;

        console.log('Hash params:', hashParams);
        console.log('Query params:', queryParams);

        // Let Supabase handle the OAuth redirect and session setting
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error processing OAuth callback:', error.message);
          setError(error.message);
          return;
        }

        if (data?.session) {
          console.log('Successfully authenticated with OAuth');
          console.log('User:', data.session.user.email);

          // Redirect to home page
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          console.log('No session found after OAuth callback');

          setError('Authentication failed. Please try again.');

          // Redirect to login page
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Error in OAuth callback:', error);
        setError(error.message || 'Authentication failed. Please try again.');

        // Redirect to login page
        setTimeout(() => {
          navigate('/login');
        }, 2000);
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
            Completing authentication...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please wait while we log you in.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default Callback;
