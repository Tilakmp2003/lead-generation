import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import StoreIcon from '@mui/icons-material/Store';
import LoginIcon from '@mui/icons-material/Login';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LeadCard from './LeadCard';
import { businessSectors, locations, mockLeads } from '../../data/mockLeads';
import { isSignedIn, signIn, createSheet, exportLeadsToSheet } from '../../services/googleSheetsService';
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const { isAuthenticated } = useAuth();

  // Set default values if not provided in URL
  const [sector, setSector] = useState(queryParams.get('sector') || 'All');
  const [locationFilter, setLocationFilter] = useState(queryParams.get('location') || 'All');
  const [customLocation, setCustomLocation] = useState('');
  const [leads, setLeads] = useState([]);
  const [sortBy, setSortBy] = useState('businessName');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const [minVerificationScore, setMinVerificationScore] = useState(0);
  const [error, setError] = useState(null);

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      // Clear previous leads to show loading state
      setLeads([]);

      // In development mode, bypass authentication check
      if (!isAuthenticated && process.env.NODE_ENV !== 'development') {
        setError('Please log in to search for leads');
        setLeads([]);
        return;
      }

      console.log('Fetching leads with:', { sector, locationFilter });

      // Set a timeout to show fallback data if API takes too long
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.log('API request taking too long, showing fallback data');
          showFallbackData();
        }
      }, 5000); // 5 seconds timeout

      try {
        // Try direct fetch first for more reliable results
        // Use the API service to fetch leads
        console.log('Calling API service with:', { sector, locationFilter });
        const fetchedLeads = await apiService.searchLeads(sector, locationFilter, { maxResults: 100 });
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);

        console.log('Fetched leads:', fetchedLeads);
        console.log('Fetched leads type:', typeof fetchedLeads);
        console.log('Is array?', Array.isArray(fetchedLeads));

        // CRITICAL: Force leads to be an array
        const leadsArray = Array.isArray(fetchedLeads) ? fetchedLeads : [];

        console.log('Leads array:', leadsArray);
        console.log('Leads array length:', leadsArray.length);

        if (leadsArray.length === 0) {
          console.log('No leads returned from API');
          setLeads([]);
          setLoading(false);
          return;
        }

        // Process the fetched leads using the leadsArray
        const filteredLeads = leadsArray.filter(lead =>
          lead && (lead.verificationScore >= minVerificationScore)
        );

        console.log(`Filtered ${leadsArray.length} leads to ${filteredLeads.length} based on verification score ${minVerificationScore}`);
        console.log('Filtered leads:', filteredLeads);

        // Sort leads
        const sortedLeads = sortLeads(filteredLeads, sortBy);
        console.log('Sorted leads:', sortedLeads);

        // Update state with the new leads
        setLeads(sortedLeads);
        setLoading(false);
        return; // Exit early since we've successfully processed the leads
      } catch (apiError) {
        // Clear the timeout since we got an error response
        clearTimeout(timeoutId);
        console.error('Error fetching leads from API, falling back to mock data:', apiError);
        // Continue to fallback mechanism below
      }

      // Call the showFallbackData function
      showFallbackData();
    } catch (err) {
      console.error('Error in fetchLeads:', err);
      setError('An error occurred while fetching leads');
      showFallbackData();
    } finally {
      // Finally, set loading to false
      setLoading(false);
    }
  };

  // Function to show fallback data when API is slow or fails
  const showFallbackData = () => {
    console.log('Using fallback mock data');

    // Filter mock leads based on sector and location
    let fallbackLeads = [...mockLeads];
    console.log('Total mock leads available:', fallbackLeads.length);

    if (sector && sector !== 'All') {
      fallbackLeads = fallbackLeads.filter(lead => lead.businessType === sector);
      console.log(`After filtering by sector "${sector}":`, fallbackLeads.length);
    }

    if (locationFilter && locationFilter !== 'All') {
      const location = locationFilter.toLowerCase();
      console.log(`Filtering by location "${location}"`);

      fallbackLeads = fallbackLeads.filter(lead => {
        // Make location filtering more flexible
        const address = (lead.address || '').toLowerCase();
        const includes = address.includes(location);
        console.log(`Lead address: "${address}", includes "${location}": ${includes}`);
        return includes;
      });

      console.log(`After filtering by location "${locationFilter}":`, fallbackLeads.length);

      // If no leads found with exact match, try more flexible matching
      if (fallbackLeads.length === 0) {
        console.log('No leads found with exact location match, trying flexible matching');

        // Try to match just the first part of the location (e.g., "Kochi" instead of "Kochi, Kerala")
        const shortLocation = location.split(',')[0].trim();

        fallbackLeads = mockLeads.filter(lead => {
          const address = (lead.address || '').toLowerCase();
          return address.includes(shortLocation);
        });

        console.log(`After flexible location matching with "${shortLocation}":`, fallbackLeads.length);

        // If still no leads, add some mock leads for this location
        if (fallbackLeads.length === 0) {
          console.log(`Creating mock leads for ${locationFilter}`);

          // Create 5 mock leads for this location
          for (let i = 0; i < 5; i++) {
            fallbackLeads.push({
              id: `mock-${locationFilter}-${i}`,
              businessName: `${locationFilter} Business ${i+1}`,
              businessType: sector !== 'All' ? sector : ['Retail', 'Electronics', 'Fashion', 'Grocery'][Math.floor(Math.random() * 4)],
              ownerName: `Owner ${i+1}`,
              contactDetails: {
                email: `contact${i+1}@${locationFilter.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                socialMedia: {
                  linkedin: `linkedin.com/company/${locationFilter.toLowerCase().replace(/[^a-z0-9]/g, '')}-business-${i+1}`,
                  twitter: `twitter.com/${locationFilter.toLowerCase().replace(/[^a-z0-9]/g, '')}_biz_${i+1}`
                }
              },
              address: `${i+1} Main Street, ${locationFilter}, India`,
              description: `A leading business in ${locationFilter} providing quality services.`,
              verificationScore: Math.floor(Math.random() * 100)
            });
          }

          console.log(`Created ${fallbackLeads.length} mock leads for ${locationFilter}`);
        }
      }
    }

    // Add a random verification score to each lead if not present
    // Also ensure required fields exist to prevent errors
    fallbackLeads = fallbackLeads.map(lead => ({
      ...lead,
      id: lead.id || `mock-${Math.random().toString(36).substring(2, 9)}`,
      businessName: lead.businessName || 'Unknown Business',
      businessType: lead.businessType || 'Retail',
      verificationScore: lead.verificationScore || Math.floor(Math.random() * 100),
      contactDetails: {
        ...(lead.contactDetails || {}),
        email: lead.contactDetails?.email || '',
        phone: lead.contactDetails?.phone || '',
        website: lead.contactDetails?.website || '',
        socialMedia: lead.contactDetails?.socialMedia || {}
      },
      address: lead.address || 'Address not available',
      description: lead.description || 'No description available'
    }));

    // Filter by verification score
    const filteredLeads = fallbackLeads.filter(lead =>
      lead.verificationScore >= minVerificationScore
    );

    console.log(`Using ${fallbackLeads.length} mock leads, filtered to ${filteredLeads.length} based on verification score ${minVerificationScore}`);

    // Sort leads
    const sortedLeads = sortLeads(filteredLeads, sortBy);

    console.log('Setting leads state with:', sortedLeads);
    setLeads(sortedLeads);
  };

  // Sort leads based on selected option
  const sortLeads = (leadsToSort, sortOption) => {
    const sortedLeads = [...leadsToSort];

    if (sortOption === 'businessName') {
      sortedLeads.sort((a, b) => a.businessName.localeCompare(b.businessName));
    } else if (sortOption === 'businessType') {
      sortedLeads.sort((a, b) => a.businessType.localeCompare(b.businessType));
    } else if (sortOption === 'location') {
      sortedLeads.sort((a, b) => a.address.localeCompare(b.address));
    } else if (sortOption === 'verificationScore') {
      sortedLeads.sort((a, b) => b.verificationScore - a.verificationScore);
    }

    return sortedLeads;
  };

  useEffect(() => {
    // Update URL with current filters
    const params = new URLSearchParams();
    if (sector) params.set('sector', sector);
    if (locationFilter) params.set('location', locationFilter);
    navigate(`/results?${params.toString()}`, { replace: true });

    // Fetch leads when filters change
    fetchLeads();
  }, [sector, locationFilter, navigate]);

  // Log when leads state changes
  useEffect(() => {
    console.log('Leads state changed:', leads);
  }, [leads]);

  // Re-sort leads when sortBy changes
  useEffect(() => {
    if (leads.length > 0) {
      setLeads(sortLeads([...leads], sortBy));
    }
  }, [sortBy]);

  const handleSectorChange = (event) => {
    setSector(event.target.value);
  };

  const handleLocationChange = (event) => {
    const value = event.target.value;
    console.log('Location dropdown changed to:', value);

    if (value === 'Others') {
      // If "Others" is selected, update locationFilter to "Others" to show the input field
      // but don't trigger a search yet
      console.log('Setting locationFilter to "Others" and clearing customLocation');
      setLocationFilter('Others');
      setCustomLocation('');
    } else {
      // For predefined locations, update the filter immediately
      console.log('Setting locationFilter to:', value);
      setLocationFilter(value);
    }
  };

  // Handle custom location input change
  const handleCustomLocationChange = (event) => {
    const value = event.target.value;
    console.log('Custom location input changed to:', value);
    setCustomLocation(value);
  };

  // Handle custom location submission
  const handleCustomLocationSubmit = () => {
    console.log('Custom location submit button clicked with value:', customLocation);
    if (customLocation.trim()) {
      console.log('Setting locationFilter to custom location:', customLocation.trim());
      setLocationFilter(customLocation.trim());
    }
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    // The useEffect will handle the sorting
  };

  const handleVerificationScoreChange = (event) => {
    setMinVerificationScore(event.target.value);

    // Re-filter the leads based on the new verification score
    if (leads.length > 0) {
      const filteredLeads = leads.filter(lead =>
        lead.verificationScore >= event.target.value
      );
      setLeads(sortLeads(filteredLeads, sortBy));
    }
  };

  const handleExportToSheets = async () => {
    try {
      setLoading(true);

      // Check if we're in development mode
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (isDevelopment) {
        // In development, create a CSV file for download instead of using Google Sheets
        console.log('Development environment detected. Creating CSV file instead of using Google Sheets.');

        // Create CSV content
        const headers = [
          'Business Name',
          'Business Type',
          'Owner Name',
          'Email',
          'Phone',
          'Social Media',
          'Address',
          'Description',
          'Verification Score'
        ];

        const rows = leads.map(lead => [
          lead.businessName,
          lead.businessType,
          lead.ownerName || '',
          lead.contactDetails.email || '',
          lead.contactDetails.phone || '',
          Object.values(lead.contactDetails.socialMedia || {}).join(', '),
          lead.address || '',
          lead.description || '',
          lead.verificationScore || 0
        ]);

        // Combine headers and rows
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        // Create a blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Lead_Generation_${sector}_in_${locationFilter}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message
        setSnackbarMessage('Leads exported to CSV file successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);

        // Save the export to the user's history
        const userId = 'demo-user';
        try {
          await apiService.saveExport(
            userId,
            sector,
            locationFilter,
            leads.length,
            'Local CSV Export'
          );
        } catch (saveError) {
          console.error('Error saving export history:', saveError);
        }
      } else {
        // Production environment - use Google Sheets API

        // Check if user is signed in to Google
        if (!isSignedIn()) {
          await signIn();
        }

        // Create a new Google Sheet
        const sheet = await createSheet(`Lead Generation - ${sector} in ${locationFilter}`);

        // Export leads to the sheet
        await exportLeadsToSheet(leads, sheet.spreadsheetId);

        // Save the export to the user's history (if logged in)
        // In a real app, you would get the user ID from authentication
        const userId = 'demo-user';
        try {
          await apiService.saveExport(
            userId,
            sector,
            locationFilter,
            leads.length,
            `https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}`
          );
        } catch (saveError) {
          console.error('Error saving export history:', saveError);
          // Show warning but continue
          setSnackbarMessage('Leads exported successfully, but there was an error saving to your history.');
          setSnackbarSeverity('warning');
          setOpenSnackbar(true);

          // Open the sheet in a new tab
          window.open(`https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}`, '_blank');
          return;
        }

        // Show success message
        setSnackbarMessage('Leads exported to Google Sheets successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);

        // Open the sheet in a new tab
        window.open(`https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}`, '_blank');
      }
    } catch (error) {
      console.error('Error exporting leads:', error);

      // Provide more specific error messages
      if (error.message && error.message.includes('sign in')) {
        setSnackbarMessage('Failed to sign in to Google. Please try again.');
      } else if (error.message && error.message.includes('permission')) {
        setSnackbarMessage('Permission denied. Please check your Google account permissions.');
      } else if (error.message && error.message.includes('quota')) {
        setSnackbarMessage('API quota exceeded. Please try again later.');
      } else {
        setSnackbarMessage('Failed to export leads. Please try again.');
      }

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
    <Container maxWidth="lg" sx={{ mt: { xs: 1, md: 4 }, mb: { xs: 6, md: 8 }, px: { xs: 1, sm: 3, md: 4 } }}>
      <Box sx={{ mb: { xs: 2, md: 5 }, mt: { xs: 0.5, md: 2 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{
            mb: { xs: 1.5, md: 3 },
            borderRadius: 2,
            px: { xs: 1.5, md: 2 },
            py: 0.8,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: { xs: '0.75rem', md: '0.9rem' },
            bgcolor: 'rgba(46, 125, 50, 0.05)',
            color: 'primary.main',
            border: '1px solid',
            borderColor: 'primary.main',
            '&:hover': {
              bgcolor: 'rgba(46, 125, 50, 0.1)',
            }
          }}
        >
          Back to Search
        </Button>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1, sm: 2 },
          mb: { xs: 2, md: 4 }
        }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.8rem', md: '2.2rem' },
              color: 'text.primary'
            }}
          >
            Search Results
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap'
          }}>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.875rem', md: '1rem' },
                color: 'text.secondary'
              }}
            >
              Found <strong>{leads.length}</strong> leads for <strong>{sector}</strong> in <strong>{locationFilter}</strong>
            </Typography>

            {leads.length > 0 && (
              <Chip
                icon={<VerifiedUserIcon sx={{ fontSize: { xs: '0.9rem', md: '1.25rem' } }} />}
                label={`Min. Verification: ${minVerificationScore}%`}
                color="primary"
                variant="outlined"
                size="small"
                sx={{
                  fontWeight: 500,
                  height: { xs: 24, md: 32 },
                  fontSize: { xs: '0.7rem', md: '0.875rem' },
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '& .MuiChip-label': { px: { xs: 1, md: 1.5 } }
                }}
              />
            )}
          </Box>
        </Box>

        <Paper
          sx={{
            p: { xs: 1.5, sm: 2.5, md: 4 },
            mb: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{
              mb: { xs: 2, sm: 2.5, md: 3 },
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              color: 'text.primary',
              fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }
            }}
          >
            <FilterListIcon sx={{ mr: 1.5, fontSize: { xs: '1.1rem', md: '1.5rem' }, color: 'primary.main' }} />
            Filter & Sort Options
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 2, sm: 2.5, md: 3 }
          }}>
            <Box sx={{ width: '100%' }}>
              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel id="sector-filter-label" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Business Sector</InputLabel>
                <Select
                  labelId="sector-filter-label"
                  id="sector-filter"
                  value={sector}
                  label="Business Sector"
                  onChange={handleSectorChange}
                  sx={{
                    borderRadius: 2,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.12)'
                    }
                  }}
                >
                  {businessSectors.map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ width: '100%' }}>
              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel id="location-filter-label" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Location</InputLabel>
                <Select
                  labelId="location-filter-label"
                  id="location-filter"
                  value={locations.includes(locationFilter) ? locationFilter : 'Others'}
                  label="Location"
                  onChange={handleLocationChange}
                  sx={{
                    borderRadius: 2,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.12)'
                    }
                  }}
                >
                  {locations.map((loc) => (
                    <MenuItem key={loc} value={loc} sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{loc}</MenuItem>
                  ))}
                </Select>

                {/* Show the current custom location if it's not in the predefined list */}
                {!locations.includes(locationFilter) && locationFilter !== 'All' && (
                  <Typography variant="body2" color="primary" sx={{
                    mt: 1,
                    fontStyle: 'italic',
                    fontSize: { xs: '0.7rem', md: '0.75rem' }
                  }}>
                    Current: {locationFilter}
                  </Typography>
                )}

                {/* Custom location input field - only shown when "Others" is selected */}
                {locationFilter === 'Others' ? (
                  <Box sx={{
                    mt: 1.5,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 1 }
                  }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Enter Custom Location"
                      variant="outlined"
                      value={customLocation}
                      onChange={handleCustomLocationChange}
                      placeholder="e.g., Coimbatore, Trichy"
                      // Using direct props instead of deprecated InputProps
                      startAdornment={
                        <InputAdornment position="start">
                          <LocationOnIcon color="primary" fontSize="small" sx={{ fontSize: { xs: '0.9rem', md: '1.25rem' } }} />
                        </InputAdornment>
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.75rem', md: '0.875rem' }
                        },
                        '& .MuiOutlinedInput-input': {
                          fontSize: { xs: '0.75rem', md: '0.875rem' }
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCustomLocationSubmit}
                      disabled={!customLocation.trim()}
                      sx={{
                        borderRadius: 2,
                        minWidth: { xs: '100%', sm: '80px' },
                        height: { xs: '32px', sm: 'auto' },
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        py: { xs: 0.5, md: 1 }
                      }}
                    >
                      Apply
                    </Button>
                  </Box>
                ) : null}
              </FormControl>
            </Box>

            <Box sx={{ width: '100%' }}>
              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel id="sort-label" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Sort By</InputLabel>
                <Select
                  labelId="sort-label"
                  id="sort-select"
                  value={sortBy}
                  label="Sort By"
                  onChange={handleSortChange}
                  startAdornment={<SortIcon sx={{ mr: 1, color: 'primary.main', fontSize: { xs: '0.9rem', md: '1.25rem' } }} />}
                  sx={{
                    borderRadius: 2,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.12)'
                    }
                  }}
                >
                  <MenuItem value="businessName" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Business Name</MenuItem>
                  <MenuItem value="businessType" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Business Type</MenuItem>
                  <MenuItem value="location" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Location</MenuItem>
                  <MenuItem value="verificationScore" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Verification Score</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ width: '100%' }}>
              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel id="verification-label" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Min. Verification Score</InputLabel>
                <Select
                  labelId="verification-label"
                  id="verification-select"
                  value={minVerificationScore}
                  label="Min. Verification Score"
                  onChange={handleVerificationScoreChange}
                  startAdornment={<VerifiedUserIcon sx={{ mr: 1, color: 'primary.main', fontSize: { xs: '0.9rem', md: '1.25rem' } }} />}
                  sx={{
                    borderRadius: 2,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.12)'
                    }
                  }}
                >
                  <MenuItem value={0} sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>All Leads (0%+)</MenuItem>
                  <MenuItem value={25} sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Basic Verification (25%+)</MenuItem>
                  <MenuItem value={50} sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Standard Verification (50%+)</MenuItem>
                  <MenuItem value={75} sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>High Verification (75%+)</MenuItem>
                  <MenuItem value={90} sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Premium Verification (90%+)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>

        {!isAuthenticated ? (
          <Box sx={{ textAlign: 'center', my: 8 }}>
            <Alert severity="info" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              You need to be logged in to search for leads
            </Alert>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '1rem'
              }}
            >
              Log in to continue
            </Button>
          </Box>
        ) : loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            py: 8,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 3,
            backdropFilter: 'blur(8px)'
          }}>
            <CircularProgress size={32} thickness={4} sx={{ mr: 2 }} />
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Loading leads...
            </Typography>
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 4,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(211, 47, 47, 0.1)'
            }}
          >
            {error}
          </Alert>
        ) : leads.length === 0 ? (
          <Alert 
            severity="info"
            sx={{ 
              mt: 4,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(2, 136, 209, 0.1)'
            }}
          >
            No leads found matching your search criteria. Please try different filters.
          </Alert>
        ) : (
          <>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: { xs: 2, md: 3 },
              mt: { xs: 3, md: 4 },
              px: { xs: 1, md: 2 }
            }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <StoreIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                Lead Results ({leads.length})
              </Typography>

              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportToSheets}
                disabled={loading || leads.length === 0}
                sx={{
                  borderRadius: 2,
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.2 },
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                  background: 'linear-gradient(45deg, #2e7d32 30%, #60ad5e 90%)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(46, 125, 50, 0.3)',
                  }
                }}
              >
                {loading ? 'Exporting...' : 'Export to Google Sheets'}
              </Button>
            </Box>

            <Grid 
              container 
              spacing={{ xs: 2, sm: 3, md: 4 }} 
              sx={{ 
                mt: { xs: 0.5, md: 1 },
                mx: { xs: -1, sm: -2 },
                width: { xs: 'calc(100% + 16px)', sm: 'calc(100% + 32px)' }
              }}
            >
              {leads.map((lead, index) => (
                <Grid item xs={12} sm={6} lg={4} key={lead.id || index}>
                  <LeadCard lead={lead} />
                </Grid>
              ))}
            </Grid>
          </>
        )}

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
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: 2
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default ResultsPage;
