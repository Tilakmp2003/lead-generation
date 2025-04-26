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
  TextField
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
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Paper
        elevation={isHovered ? 12 : 6}
        sx={{
          p: { xs: 2.5, sm: 3, md: 5 },
          borderRadius: { xs: 3, md: 4 },
          transition: 'all 0.3s ease',
          transform: { xs: 'none', md: isHovered ? 'translateY(-5px)' : 'translateY(0)' },
          background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)',
          border: '1px solid rgba(0,0,0,0.05)',
          width: '100%',
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
              fontWeight: 600,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              color: 'black',
            }}
          >
            Find Retail Shop Owners
          </Typography>
          <Typography
            variant="subtitle1"
            paragraph
            sx={{
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              px: { xs: 1, sm: 0 },
              color: 'black'
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
            maxWidth: 900,
            mx: 'auto',
            position: 'relative',
            px: { xs: 0.5, sm: 1, md: 2 },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -15,
              left: { xs: -5, md: -15 },
              right: { xs: -5, md: -15 },
              bottom: -15,
              border: '2px dashed rgba(46, 125, 50, 0.2)',
              borderRadius: 5,
              zIndex: -1,
              display: { xs: 'none', md: 'block' }
            }
          }}
        >
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
            <Grid item xs={12} sm={6} md={5}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="sector-label">Business Sector</InputLabel>
                <Select
                  labelId="sector-label"
                  id="sector-select"
                  value={sector}
                  label="Business Sector"
                  onChange={handleSectorChange}
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon color="primary" />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {businessSectors.map((sector) => (
                    <MenuItem key={sector} value={sector}>
                      {sector}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={5}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  id="location-select"
                  value={location}
                  label="Location"
                  onChange={handleLocationChange}
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <LocationOnIcon color="primary" />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {locations.map((loc) => (
                    <MenuItem key={loc} value={loc}>
                      {loc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Custom location input field - only shown when "Others" is selected */}
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
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon color="primary" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={location === 'Others' ? 12 : 6} md={location === 'Others' ? 12 : 2}
              sx={{ mt: { xs: 1, md: location === 'Others' ? 2 : 0 } }}>
              <Zoom in={true} style={{ transitionDelay: '250ms' }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    height: '56px',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}
                  startIcon={loading ? null : <SearchIcon />}
                  disabled={loading || !sector || !location || (location === 'Others' && !customLocation.trim())}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </Zoom>
            </Grid>
          </Grid>

          <Box sx={{
            mt: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            gap: { xs: 1.5, md: 1 },
            justifyContent: 'center',
            alignItems: { xs: 'flex-start', sm: 'center' },
            px: { xs: 1, md: 0 }
          }}>
            <Typography variant="body2" color="text.secondary" sx={{
              mr: { xs: 0, sm: 1 },
              mb: { xs: 1, sm: 0 },
              textAlign: { xs: 'center', sm: 'left' },
              width: { xs: '100%', sm: 'auto' }
            }}>
              Popular searches:
            </Typography>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              justifyContent: 'center',
              width: { xs: '100%', sm: 'auto' }
            }}>
              {[
                { sector: 'Electronics', location: 'Madurai' },
                { sector: 'Fashion', location: 'Chennai' },
                { sector: 'Grocery', location: 'Bangalore' }
              ].map((item, index) => (
                <Chip
                  key={index}
                  label={`${item.sector} in ${item.location}`}
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSector(item.sector);
                    setLocation(item.location);

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

                    // Submit the search immediately when clicking on a popular search
                    setTimeout(() => {
                      // Use the selected location directly since it's not "Others"
                      navigate(`/results?sector=${encodeURIComponent(item.sector)}&location=${encodeURIComponent(item.location)}`);
                    }, 100);
                  }}
                  sx={{
                    cursor: 'pointer',
                    height: '28px',
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
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SearchForm;
