import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import LoginIcon from '@mui/icons-material/Login';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsSubmitting(true);

      // Attempt to login with provided credentials
      console.log('Attempting to login with email and password');
      const result = await login(email, password);

      if (!result.success) {
        console.error('Login failed:', result.error);
        setError(result.error);

        return;
      }

      console.log('Login successful');
      // Redirect to home page after successful login
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please try again.');

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsSubmitting(true);

      console.log('Initiating Google OAuth login...');

      // Use real Google OAuth flow
      const result = await loginWithGoogle();

      if (!result.success) {
        console.error('Google login failed:', result.error);
        setError(result.error);

        setIsSubmitting(false);
        return;
      }

      // The redirect will be handled by Supabase OAuth
      console.log('Google OAuth initiated, redirecting to Google...');
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message || 'Failed to login with Google. Please try again.');

      setIsSubmitting(false);
    }
  };

  return (
    <Box 
      sx={{
        minHeight: 'calc(100vh - 64px)', // Adjust for header height
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 4 },
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 3,
            bgcolor: 'background.paper',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              color: 'text.primary',
              mb: 1
            }}
          >
            Welcome Back
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4,
              color: 'text.secondary',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Log in to access your lead generation dashboard
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              autoComplete="email"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }
              }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              autoComplete="current-password"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
              sx={{
                py: 1.5,
                mb: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(46, 125, 50, 0.3)'
                }
              }}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Divider 
            sx={{ 
              my: 3,
              '&::before, &::after': {
                borderColor: 'divider'
              }
            }}
          >
            <Typography 
              variant="body2" 
              sx={{
                color: 'text.secondary',
                px: 2,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            startIcon={<GoogleIcon />}
            sx={{
              py: 1.5,
              mb: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'rgba(46, 125, 50, 0.04)'
              }
            }}
          >
            Continue with Google
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#2e7d32',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                Register now
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
