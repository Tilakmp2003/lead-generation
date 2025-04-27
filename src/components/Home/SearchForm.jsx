import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Container,
  Paper,
  Grid,
  InputAdornment,
  Chip,
  Zoom,
  Snackbar,
  Alert,
  TextField,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import LoginIcon from '@mui/icons-material/Login';
import { businessSectors, locations } from '../../data/mockLeads';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const SearchForm = () => {
  const [sector, setSector] = useState('');
  const [location, setLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSectorChange = (event) => {
    setSector(event.target.value);
  };

  const handleLocationChange = (event) => {
    const value = event.target.value;
    setLocation(value);

    // Reset custom location if not "Others"
    if (value !== 'Others') {
      setCustomLocation('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Make sure we have valid values before navigating
    if (!sector || !location) {
      setSnackbarMessage('Please select both a business sector and location');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Check if custom location is required but empty
    if (location === 'Others' && !customLocation.trim()) {
      setSnackbarMessage('Please enter a custom location');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setSnackbarMessage('Please log in to search for leads');
      setSnackbarSeverity('info');
      setOpenSnackbar(true);

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);

      return;
    }

    setLoading(true);
    console.log('Submitting search with:', { sector, location });

    try {
      // Determine which location to use (custom or selected)
      const locationToUse = location === 'Others' ? customLocation.trim() : location;

      // Navigate to results page with search parameters
      navigate(`/results?sector=${encodeURIComponent(sector)}&location=${encodeURIComponent(locationToUse)}`);
    } catch (error) {
      console.error('Error processing search:', error);
      setSnackbarMessage('There was an error processing your search. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="xl" sx={{ 
      px: { xs: 2, sm: 4, md: 6, lg: 8 }, 
      display: 'flex', 
      justifyContent: 'center' 
    }}>
      <Paper
        elevation={isHovered ? 12 : 6}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          borderRadius: { xs: 3, md: 4 },
          transition: 'all 0.3s ease',
          transform: { xs: 'none', md: isHovered ? 'translateY(-5px)' : 'translateY(0)' },
          background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)',
          border: '1px solid rgba(0,0,0,0.05)',
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' },
              color: 'text.primary',
              mb: { xs: 1.5, md: 2 }
            }}
          >
            Find Retail Shop Owners
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              maxWidth: 800,
              mx: 'auto',
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              px: { xs: 1, sm: 2, md: 0 },
              color: 'text.secondary',
              mb: { xs: 2, md: 3 }
            }}
          >
            Search for authenticated leads in your target location and export them to Google Sheets
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mt: { xs: 2, md: 3 },
            maxWidth: 1100,
            mx: 'auto',
            position: 'relative',
            px: { xs: 0, sm: 2, md: 3 },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -15,
              left: { xs: -10, sm: -15, md: -20 },
              right: { xs: -10, sm: -15, md: -20 },
              bottom: -15,
              border: '2px dashed rgba(46, 125, 50, 0.2)',
              borderRadius: { xs: 2, md: 3 },
              zIndex: -1,
              display: { xs: 'none', md: 'block' }
            }
          }}
        >
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="flex-start">
            <Grid item xs={12} sm={6} md={5}>
              <FormControl fullWidth variant="outlined" size="medium">
                <InputLabel id="sector-label">Business Sector</InputLabel>
                <Select
                  labelId="sector-label"
                  id="sector-select"
                  value={sector}
                  label="Business Sector"
                  onChange={handleSectorChange}
                  required
                  sx={{
                    borderRadius: { xs: 1.5, md: 2 },
                    height: { xs: '48px', sm: '52px', md: '56px' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.35rem', md: '1.5rem' } }} />
                    </InputAdornment>
                  }
                >
                  {businessSectors.map((sector) => (
                    <MenuItem 
                      key={sector} 
                      value={sector} 
                      sx={{ 
                        py: { xs: 1, sm: 1.25, md: 1.5 },
                        fontSize: { xs: '0.875rem', sm: '0.925rem', md: '1rem' }
                      }}
                    >
                      {sector}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={5}>
              <FormControl fullWidth variant="outlined" size="medium">
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  id="location-select"
                  value={location}
                  label="Location"
                  onChange={handleLocationChange}
                  required
                  sx={{
                    borderRadius: { xs: 1.5, md: 2 },
                    height: { xs: '48px', sm: '52px', md: '56px' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <LocationOnIcon color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.35rem', md: '1.5rem' } }} />
                    </InputAdornment>
                  }
                >
                  {locations.map((loc) => (
                    <MenuItem 
                      key={loc} 
                      value={loc} 
                      sx={{ 
                        py: { xs: 1, sm: 1.25, md: 1.5 },
                        fontSize: { xs: '0.875rem', sm: '0.925rem', md: '1rem' }
                      }}
                    >
                      {loc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {location === 'Others' && (
              <Grid item xs={12} md={10}>
                <TextField
                  fullWidth
                  label="Enter Custom Location"
                  variant="outlined"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  required
                  placeholder="e.g., Coimbatore, Trichy, Pondicherry"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: { xs: 1.5, md: 2 },
                      height: { xs: '48px', sm: '52px', md: '56px' },
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.875rem', sm: '0.925rem', md: '1rem' }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.875rem', sm: '0.925rem', md: '1rem' }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.35rem', md: '1.5rem' } }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            )}

            <Grid
              item
              xs={12}
              sm={location === 'Others' ? 12 : 6}
              md={location === 'Others' ? 12 : 2}
              sx={{
                mt: {
                  xs: location === 'Others' ? 0 : 1,
                  md: location === 'Others' ? 2 : 0
                }
              }}
            >
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading || (location === 'Others' && !customLocation.trim())}
                sx={{
                  height: { xs: '48px', sm: '52px', md: '56px' },
                  fontSize: { xs: '0.875rem', sm: '0.925rem', md: '1rem' },
                  borderRadius: { xs: 1.5, md: 2 },
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(46, 125, 50, 0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <>
                    <SearchIcon sx={{ mr: 1 }} />
                    Search Leads
                  </>
                )}
              </Button>
            </Grid>
          </Grid>

          <Box sx={{
            mt: { xs: 3, sm: 4, md: 5 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            gap: { xs: 1.5, md: 2 },
            justifyContent: 'center',
            alignItems: { xs: 'flex-start', sm: 'center' }
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{
                mr: { xs: 0, sm: 1 },
                mb: { xs: 1, sm: 0 },
                textAlign: { xs: 'center', sm: 'left' },
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
              }}
            >
              Popular searches:
            </Typography>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: 'center'
            }}>
              {[
                'Electronics in Madurai',
                'Fashion in Chennai',
                'Grocery in Bangalore'
              ].map((item) => (
                <Chip
                  key={item}
                  label={item}
                  variant="outlined"
                  onClick={() => {
                    setTimeout(() => {
                      const [sector, location] = item.split(' in ');
                      handleSectorChange({ target: { value: sector } });
                      handleLocationChange({ target: { value: location } });
                    }, 100);
                  }}
                  sx={{
                    cursor: 'pointer',
                    height: { xs: '28px', sm: '30px', md: '32px' },
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                    borderRadius: { xs: 1.5, md: 2 },
                    '&:hover': {
                      backgroundColor: 'rgba(46, 125, 50, 0.1)',
                      borderColor: 'primary.main'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            fontSize: { xs: '0.875rem', md: '1rem' },
            borderRadius: { xs: 1.5, md: 2 }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SearchForm;
