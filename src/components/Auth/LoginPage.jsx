import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  Grid,
  Link,
  Divider,
  Alert,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  Stack
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { LoadingButton } from '@mui/lab';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  
  const handleSubmit = (event) => {
    event.preventDefault();
    
    // For demo purposes, accept any email/password
    if (email && password) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        navigate('/');
      }, 1000);
    } else {
      setErrors({
        email: !email && 'Email is required',
        password: !password && 'Password is required'
      });
    }
  };
  
  const handleGoogleLogin = () => {
    // Simulate Google login
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1000);
  };

  const handleLinkedInLogin = () => {
    // Simulate LinkedIn login
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1000);
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 4, md: 6, lg: 8 }
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: '100%',
            maxWidth: { xs: '400px', md: '900px' },
            borderRadius: { xs: 2, md: 3 },
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' }
          }}
        >
          {/* Left Side - Login Form */}
          <Box
            sx={{
              flex: { md: '0 0 50%' },
              p: { xs: 3, sm: 4, md: 5 },
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                  color: 'text.primary',
                  mb: { xs: 1, md: 2 }
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                }}
              >
                Log in to access your lead generation dashboard
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 2, md: 3 }
              }}
            >
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={Boolean(errors.email)}
                helperText={errors.email}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 1.5, md: 2 },
                    height: { xs: '48px', md: '56px' }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                error={Boolean(errors.password)}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="large"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 1.5, md: 2 },
                    height: { xs: '48px', md: '56px' }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: { xs: 1, md: 2 }
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{ 
                        '& .MuiSvgIcon-root': { 
                          fontSize: { xs: '1.25rem', md: '1.5rem' } 
                        } 
                      }}
                    />
                  }
                  label={
                    <Typography 
                      sx={{ 
                        fontSize: { xs: '0.875rem', md: '1rem' },
                        color: 'text.secondary'
                      }}
                    >
                      Remember me
                    </Typography>
                  }
                />
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  sx={{
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>

              <LoadingButton
                type="submit"
                variant="contained"
                fullWidth
                loading={loading}
                size="large"
                sx={{
                  mt: { xs: 2, md: 3 },
                  height: { xs: '48px', md: '56px' },
                  borderRadius: { xs: 1.5, md: 2 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  textTransform: 'none'
                }}
              >
                Log In
              </LoadingButton>

              <Divider sx={{ my: { xs: 3, md: 4 } }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    px: 2,
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  Or continue with
                </Typography>
              </Divider>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: { xs: 2, md: 3 }
                }}
              >
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleLogin}
                  sx={{
                    height: { xs: '48px', md: '56px' },
                    borderRadius: { xs: 1.5, md: 2 },
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    textTransform: 'none'
                  }}
                >
                  Google
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LinkedInIcon />}
                  onClick={handleLinkedInLogin}
                  sx={{
                    height: { xs: '48px', md: '56px' },
                    borderRadius: { xs: 1.5, md: 2 },
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    textTransform: 'none'
                  }}
                >
                  LinkedIn
                </Button>
              </Box>
            </Box>

            <Box sx={{ 
              mt: { xs: 3, md: 4 }, 
              textAlign: 'center' 
            }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.875rem', md: '1rem' }
                }}
              >
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>

          {/* Right Side - Image and Features */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flex: '0 0 50%',
              flexDirection: 'column',
              justifyContent: 'center',
              p: 5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url(/path/to/your/pattern.svg)',
                backgroundSize: 'cover',
                opacity: 0.1
              }
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 3,
                position: 'relative',
                fontSize: { md: '2rem', lg: '2.25rem' }
              }}
            >
              Unlock Business Opportunities
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                position: 'relative',
                fontSize: { md: '1rem', lg: '1.125rem' },
                opacity: 0.9
              }}
            >
              Access verified leads and grow your business network with our powerful lead generation platform
            </Typography>

            <Box sx={{ position: 'relative' }}>
              <Stack spacing={2}>
                {[
                  'Access to verified business contacts',
                  'Export leads to Google Sheets',
                  'Advanced filtering options',
                  'Real-time verification scores'
                ].map((feature, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: { md: '1.5rem', lg: '1.75rem' } }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { md: '1rem', lg: '1.125rem' },
                        opacity: 0.9
                      }}
                    >
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
