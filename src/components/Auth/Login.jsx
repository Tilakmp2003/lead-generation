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
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 8,
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold">
          Login to Your Account
        </Typography>

        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Access your lead generation dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
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
            sx={{ mb: 2 }}
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
            sx={{ mb: 3 }}
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
              fontSize: '1rem'
            }}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
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
            fontSize: '1rem'
          }}
        >
          Continue with Google
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'primary.main', fontWeight: 'bold', textDecoration: 'none' }}>
              Register now
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
