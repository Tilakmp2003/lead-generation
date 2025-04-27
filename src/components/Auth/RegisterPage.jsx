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
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { LoadingButton } from '@mui/lab';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData({
      ...formData,
      [name]: name === 'agreeTerms' ? checked : value
    });
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }
    
    // For demo purposes, accept any valid registration
    onLogin();
    navigate('/');
  };
  
  const handleGoogleRegister = () => {
    // Simulate Google registration
    onLogin();
    navigate('/');
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
            flexDirection: { xs: 'column', md: 'row-reverse' }
          }}
        >
          {/* Left Side - Features */}
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
              Start Growing Your Business Today
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
              Join thousands of businesses using our platform to find verified leads and expand their network
            </Typography>

            <Box sx={{ position: 'relative' }}>
              <Stack spacing={2}>
                {[
                  'Free trial with no credit card required',
                  'Access to 1000+ verified business contacts',
                  'Advanced lead filtering and export tools',
                  'Premium support and regular updates'
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

          {/* Right Side - Registration Form */}
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
                Create Account
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                }}
              >
                Get started with your free account today
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
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    error={Boolean(errors.firstName)}
                    helperText={errors.firstName}
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    error={Boolean(errors.lastName)}
                    helperText={errors.lastName}
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
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Business Name"
                variant="outlined"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                error={Boolean(errors.businessName)}
                helperText={errors.businessName}
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

              <FormControlLabel
                control={
                  <Checkbox 
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
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
                    I agree to the{' '}
                    <Link
                      component={RouterLink}
                      to="/terms"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link
                      component={RouterLink}
                      to="/privacy"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Privacy Policy
                    </Link>
                  </Typography>
                }
              />

              <LoadingButton
                type="submit"
                variant="contained"
                fullWidth
                loading={loading}
                disabled={!agreeToTerms}
                size="large"
                sx={{
                  mt: { xs: 2, md: 3 },
                  height: { xs: '48px', md: '56px' },
                  borderRadius: { xs: 1.5, md: 2 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  textTransform: 'none'
                }}
              >
                Create Account
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
                  Or sign up with
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
                  onClick={handleGoogleSignup}
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
                  onClick={handleLinkedInSignup}
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
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Log in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
