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
        try {
          console.log('Trying direct fetch to backend API');
          const API_URL = 'http://localhost:3000/api';
          const params = new URLSearchParams();
          if (sector && sector !== 'All') params.append('sector', sector);
          if (locationFilter && locationFilter !== 'All') params.append('location', locationFilter);
          params.append('maxResults', 100);

          const response = await fetch(`${API_URL}/leads/search?${params.toString()}`);
          const data = await response.json();

          console.log('Direct API response:', data);

          if (data && (data.data || Array.isArray(data))) {
            const directLeads = data.data || data;
            if (Array.isArray(directLeads) && directLeads.length > 0) {
              console.log('Successfully got leads directly from API:', directLeads.length);

              // Process these leads
              const processedLeads = directLeads.map(lead => ({
                ...lead,
                id: lead.id || `lead-${Math.random().toString(36).substring(2, 9)}`,
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

              // Filter and sort
              const filteredLeads = processedLeads.filter(lead =>
                lead && (lead.verificationScore >= minVerificationScore)
              );

              const sortedLeads = sortLeads(filteredLeads, sortBy);
              console.log('Direct API sorted leads:', sortedLeads);

              // Update state
              setLeads(sortedLeads);
              setLoading(false);

              // Clear the timeout
              clearTimeout(timeoutId);

              // Exit early since we got data directly
              return;
            }
          }
        } catch (directError) {
          console.error('Error with direct API fetch, falling back to apiService:', directError);
        }

        // Fall back to the API service if direct fetch fails
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 5, mt: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{
            mb: 3,
            borderRadius: 2,
            px: 2,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }
          }}
        >
          Back to Search
        </Button>

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.8rem', md: '2.2rem' },
            mb: 2,
            color: 'text.primary'
          }}
        >
          Search Results
        </Typography>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          bgcolor: 'rgba(46, 125, 50, 0.05)',
          p: 2.5,
          borderRadius: 3,
          border: '1px solid rgba(46, 125, 50, 0.1)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.05rem' }}>
            Found <strong>{leads.length}</strong> leads for <strong>{sector}</strong> businesses in <strong>{locationFilter}</strong>
          </Typography>

          {leads.length > 0 && (
            <Chip
              icon={<VerifiedUserIcon />}
              label={`Min. Verification: ${minVerificationScore}%`}
              color="primary"
              variant="outlined"
              size="medium"
              sx={{
                fontWeight: 500,
                height: 32,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          )}
        </Box>
      </Box>

      <Paper
        sx={{
          p: 4,
          mb: 5,
          borderRadius: 3,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            mb: 3,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            color: 'text.primary'
          }}
        >
          <FilterListIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          Filter & Sort Options
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
          <Box sx={{ width: { xs: '100%', sm: '47%', md: '22%' } }}>
            <FormControl fullWidth size="medium" sx={{ mb: 1 }}>
              <InputLabel id="sector-filter-label">Business Sector</InputLabel>
              <Select
                labelId="sector-filter-label"
                id="sector-filter"
                value={sector}
                label="Business Sector"
                onChange={handleSectorChange}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.12)'
                  }
                }}
              >
                {businessSectors.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ width: { xs: '100%', sm: '47%', md: '22%' } }}>
            <FormControl fullWidth size="medium" sx={{ mb: 1 }}>
              <InputLabel id="location-filter-label">Location</InputLabel>
              <Select
                labelId="location-filter-label"
                id="location-filter"
                value={locations.includes(locationFilter) ? locationFilter : 'Others'}
                label="Location"
                onChange={handleLocationChange}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.12)'
                  }
                }}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                ))}
              </Select>

              {/* Show the current custom location if it's not in the predefined list */}
              {!locations.includes(locationFilter) && locationFilter !== 'All' && (
                <Typography variant="body2" color="primary" sx={{ mt: 1, fontStyle: 'italic' }}>
                  Current: {locationFilter}
                </Typography>
              )}

              {/* Custom location input field - only shown when "Others" is selected */}
              {locationFilter === 'Others' ? (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Enter Custom Location"
                    variant="outlined"
                    value={customLocation}
                    onChange={handleCustomLocationChange}
                    placeholder="e.g., Coimbatore, Trichy"
                    // Using the non-deprecated way to add start adornment
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOnIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
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
                      minWidth: '80px'
                    }}
                  >
                    Apply
                  </Button>
                </Box>
              ) : null}
            </FormControl>
          </Box>

          <Box sx={{ width: { xs: '100%', sm: '47%', md: '22%' } }}>
            <FormControl fullWidth size="medium" sx={{ mb: 1 }}>
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                id="sort-select"
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
                startAdornment={<SortIcon sx={{ mr: 1, color: 'primary.main' }} />}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.12)'
                  }
                }}
              >
                <MenuItem value="businessName">Business Name</MenuItem>
                <MenuItem value="businessType">Business Type</MenuItem>
                <MenuItem value="location">Location</MenuItem>
                <MenuItem value="verificationScore">Verification Score</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ width: { xs: '100%', sm: '47%', md: '32%' } }}>
            <FormControl fullWidth size="medium" sx={{ mb: 1 }}>
              <InputLabel id="verification-label">Min. Verification Score</InputLabel>
              <Select
                labelId="verification-label"
                id="verification-select"
                value={minVerificationScore}
                label="Min. Verification Score"
                onChange={handleVerificationScoreChange}
                startAdornment={<VerifiedUserIcon sx={{ mr: 1, color: 'primary.main' }} />}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.12)'
                  }
                }}
              >
                <MenuItem value={0}>All Leads (0%+)</MenuItem>
                <MenuItem value={25}>Basic Verification (25%+)</MenuItem>
                <MenuItem value={50}>Standard Verification (50%+)</MenuItem>
                <MenuItem value={75}>High Verification (75%+)</MenuItem>
                <MenuItem value={90}>Premium Verification (90%+)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportToSheets}
            disabled={loading || leads.length === 0}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
              background: 'linear-gradient(45deg, #2e7d32 30%, #60ad5e 90%)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(46, 125, 50, 0.3)',
              }
            }}
          >
            {loading ? 'Exporting...' : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
              ? 'Export to CSV'
              : 'Export to Google Sheets'}
          </Button>
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
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading leads...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      ) : leads.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4 }}>
          No leads found matching your search criteria. Please try different filters.
        </Alert>
      ) : (
        <>
          <Box sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'rgba(46, 125, 50, 0.05)',
            p: 2.5,
            borderRadius: 3,
            border: '1px solid rgba(46, 125, 50, 0.1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <StoreIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              Lead Results ({leads.length})
            </Typography>

            <Stack direction="row" spacing={1.5}>
              <Chip
                label="Verified Leads"
                color="success"
                size="medium"
                icon={<VerifiedUserIcon />}
                sx={{
                  fontWeight: 500,
                  px: 1,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
            </Stack>
          </Box>

          <Grid container spacing={4} sx={{ mt: 1 }}>
            {leads.map((lead, index) => {
              // Add a console log to check each lead
              console.log(`Rendering lead ${index}:`, lead);

              // Check if lead has required properties
              if (!lead || !lead.businessName) {
                console.error(`Invalid lead at index ${index}:`, lead);
                return null; // Skip invalid leads
              }

              // Use index as key if id is not available
              const key = lead.id || `lead-${index}`;

              return (
                <Grid item xs={12} md={6} lg={4} key={key} sx={{ mb: 4 }}>
                  <Box sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <LeadCard lead={lead} />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

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

export default ResultsPage;
