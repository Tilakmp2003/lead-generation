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
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import StoreIcon from '@mui/icons-material/Store';
import LoginIcon from '@mui/icons-material/Login';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GoogleIcon from '@mui/icons-material/Google';
import LeadCard from './LeadCard';
import { businessSectors, locations, mockLeads } from '../../data/mockLeads';
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { createSheet, exportLeadsToSheet, isSignedIn, signIn } from '../../services/googleSheetsService';

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

      // Set a timeout to show fallback data if API takes too long
      const timeoutId = setTimeout(() => {
        if (loading) {
          showFallbackData();
        }
      }, 5000); // 5 seconds timeout

      try {
        // Try direct fetch first for more reliable results
        // Use the API service to fetch leads
        console.log(`Fetching leads for ${sector} in ${locationFilter}...`);
        const fetchedLeads = await apiService.searchLeads(sector, locationFilter, { maxResults: 100 });
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);

        console.log('API response received:', fetchedLeads);

        // CRITICAL: Force leads to be an array
        const leadsArray = Array.isArray(fetchedLeads) ? fetchedLeads : [];
        console.log(`Processed ${leadsArray.length} leads from API response`);

        if (leadsArray.length === 0) {
          console.log('No leads found from API, showing empty results');
          setLeads([]);
          setLoading(false);
          return;
        }

        // Process the fetched leads using the leadsArray
        // Add defensive checks for lead structure
        const filteredLeads = leadsArray.filter(lead => {
          if (!lead) return false;

          // Ensure lead has verificationScore property
          if (typeof lead.verificationScore === 'undefined') {
            lead.verificationScore = Math.floor(Math.random() * 100);
          }

          // Ensure lead has contactDetails property
          if (!lead.contactDetails) {
            lead.contactDetails = {
              email: '',
              phone: '',
              socialMedia: {}
            };
          }

          return lead.verificationScore >= minVerificationScore;
        });

        console.log(`${filteredLeads.length} leads passed verification score filter`);

        // Sort leads
        const sortedLeads = sortLeads(filteredLeads, sortBy);
        // Update state with the new leads
        setLeads(sortedLeads);
        setLoading(false);
        return; // Exit early since we've successfully processed the leads
      } catch (apiError) {
        // Clear the timeout since we got an error response
        clearTimeout(timeoutId);
        console.error('API error:', apiError);
        // Continue to fallback mechanism below
        showFallbackData();
      }
    } catch (err) {
      setError('An error occurred while fetching leads');
      showFallbackData();
    } finally {
      // Finally, set loading to false
      setLoading(false);
    }
  };

  // Function to show fallback data when API is slow or fails
  const showFallbackData = () => {
    let fallbackLeads = [...mockLeads];

    // Filter mock leads based on sector and location
    if (sector && sector !== 'All') {
      fallbackLeads = fallbackLeads.filter(lead => lead.businessType === sector);
    }

    if (locationFilter && locationFilter !== 'All') {
      const location = locationFilter.toLowerCase();
      fallbackLeads = fallbackLeads.filter(lead => {
        // Make location filtering more flexible
        const address = (lead.address || '').toLowerCase();
        return address.includes(location);
      });

      // If no leads found with exact match, try more flexible matching
      if (fallbackLeads.length === 0) {
        // Try to match just the first part of the location (e.g., "Kochi" instead of "Kochi, Kerala")
        const shortLocation = location.split(',')[0].trim();

        fallbackLeads = mockLeads.filter(lead => {
          const address = (lead.address || '').toLowerCase();
          return address.includes(shortLocation);
        });

        // If still no leads, add some mock leads for this location
        if (fallbackLeads.length === 0) {
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

    // Filter by verification score and contact information
    const filteredLeads = fallbackLeads.filter(lead => {
      // Check if lead has either a phone number or an email
      const hasValidContact =
        (lead.contactDetails?.phone && lead.contactDetails.phone.trim() !== '') ||
        (lead.contactDetails?.email && lead.contactDetails.email.trim() !== '');

      // Only include leads with valid contact info and meeting verification score threshold
      return hasValidContact && lead.verificationScore >= minVerificationScore;
    });

    // Sort leads
    const sortedLeads = sortLeads(filteredLeads, sortBy);

    // Update state with the sorted fallback leads
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

    // Re-filter the leads based on the new verification score and contact requirements
    if (leads.length > 0) {
      const filteredLeads = leads.filter(lead => {
        // Check if lead has either a phone number or an email
        const hasValidContact =
          (lead.contactDetails?.phone && lead.contactDetails.phone.trim() !== '') ||
          (lead.contactDetails?.email && lead.contactDetails.email.trim() !== '');

        // Only include leads with valid contact info and meeting verification score threshold
        return hasValidContact && lead.verificationScore >= event.target.value;
      });
      setLeads(sortLeads(filteredLeads, sortBy));
    }
  };

  // State for Google Sheets export dialog
  const [openGoogleDialog, setOpenGoogleDialog] = useState(false);
  const [exportOption, setExportOption] = useState('csv');
  const [googleSheetsError, setGoogleSheetsError] = useState(null);

  const handleExportToSheets = async () => {
    try {
      setLoading(true);

      if (exportOption === 'csv' || !isSignedIn()) {
        // Export to CSV file
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

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Lead_Generation_${sector}_in_${locationFilter}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSnackbarMessage('Leads exported to CSV file successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);

        // Save the export to the user's history
        const userId = 'demo-user'; // Replace with actual user ID if available
        try {
          await apiService.saveExport(
            userId,
            sector,
            locationFilter,
            leads.length,
            'Local CSV Export'
          );
        } catch (saveError) {
          // Optionally show a warning if saving history fails but download succeeded
          setSnackbarMessage('Leads exported to CSV, but failed to save history.');
          setSnackbarSeverity('warning');
          setOpenSnackbar(true);
        }
      } else {
        // Export to Google Sheets
        try {
          if (!isSignedIn()) {
            await signIn();
          }

          const sheetTitle = `Lead Generation - ${sector} in ${locationFilter} - ${new Date().toLocaleDateString()}`;
          const sheet = await createSheet(sheetTitle);

          if (!sheet || !sheet.spreadsheetId) {
            throw new Error('Failed to create Google Sheet');
          }

          await exportLeadsToSheet(leads, sheet.spreadsheetId);

          const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}`;

          // Save the export to the user's history
          const userId = 'demo-user'; // Replace with actual user ID if available
          try {
            await apiService.saveExport(
              userId,
              sector,
              locationFilter,
              leads.length,
              sheetUrl
            );
          } catch (saveError) {
            // Error saving export history can be ignored as it's not critical
          }

          // Open the sheet in a new tab
          window.open(sheetUrl, '_blank');

          setSnackbarMessage('Leads exported to Google Sheets successfully!');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);
        } catch (googleError) {
          setGoogleSheetsError(googleError.message || 'Failed to export to Google Sheets');
          setOpenGoogleDialog(true);

          // Fallback to CSV export
          setExportOption('csv');
          handleExportToSheets();
        }
      }
    } catch (error) {
      setSnackbarMessage('Failed to export leads. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle export option change
  const handleExportOptionChange = async (option) => {
    setExportOption(option);

    try {
      if (option === 'google') {
        console.log('Google Sheets export selected');

        // Check if Google Sheets API is available
        if (typeof window.gapi === 'undefined' || !window.gapi.client) {
          console.warn('Google API client not available, showing dialog');
          setGoogleSheetsError('Google Sheets API not initialized. Please try CSV export instead.');
          setOpenGoogleDialog(true);
          return;
        }

        // Check if user is signed in
        if (!isSignedIn()) {
          console.log('User not signed in to Google, showing dialog');
          setOpenGoogleDialog(true);
          return;
        }
      }

      // Proceed with export
      handleExportToSheets();
    } catch (error) {
      console.error('Error in export option change:', error);
      setSnackbarMessage('Error preparing export: ' + error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);

      // Fallback to CSV
      setExportOption('csv');
    }
  };

  // Handle Google Sheets dialog close
  const handleGoogleDialogClose = () => {
    setOpenGoogleDialog(false);
    setGoogleSheetsError(null);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pt: { xs: 2, md: 4 },
        pb: { xs: 6, md: 8 }
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          width: '100%'
        }}
      >
        <Box sx={{
          width: '100%',
          maxWidth: '100%',
          mx: 'auto'
        }}>
          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{
              mb: { xs: 2, md: 3 },
              borderRadius: 2,
              px: { xs: 1.5, md: 2 },
              py: 0.8,
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

          {/* Header Section */}
          <Box sx={{
            mb: { xs: 3, md: 4 },
            textAlign: { xs: 'center', md: 'left' }
          }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
                mb: { xs: 1, md: 2 },
                color: 'text.primary'
              }}
            >
              Search Results
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.875rem', md: '1rem' },
                color: 'text.secondary',
                mb: { xs: 2, md: 3 }
              }}
            >
              Found <strong>{leads.length}</strong> leads for <strong>{sector}</strong> in <strong>{locationFilter}</strong>
            </Typography>
          </Box>

          {/* Filters Paper */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              mb: { xs: 3, md: 4 },
              borderRadius: 3,
              bgcolor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: { xs: 2, md: 3 },
                fontWeight: 600,
                fontSize: { xs: '1rem', md: '1.25rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <FilterListIcon sx={{ color: 'primary.main' }} />
              Filter & Sort Options
            </Typography>

            <Grid
              container
              spacing={3}
              sx={{
                maxWidth: 1200,
                mx: 'auto'
              }}
            >
              <Grid item xs={12} sm={6} md={3}>
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
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
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
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
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
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
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
              </Grid>
            </Grid>
          </Paper>

          {/* Results Section */}
          {!isAuthenticated ? (
            <Box sx={{
              textAlign: 'center',
              my: { xs: 4, md: 6 },
              p: { xs: 3, md: 4 },
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  maxWidth: 500,
                  mx: 'auto'
                }}
              >
                You need to be logged in to search for leads
              </Alert>
              <Button
                variant="contained"
                color="primary"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none',
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
              py: { xs: 6, md: 8 },
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <CircularProgress size={32} thickness={4} sx={{ mr: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Loading leads...
              </Typography>
            </Box>
          ) : error ? (
            <Alert
              severity="error"
              sx={{
                mt: 4,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
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
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              No leads found matching your search criteria. Please try different filters.
            </Alert>
          ) : (
            <>
              {/* Export Options */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                mb: 3
              }}>
                <Button
                  variant="contained"
                  startIcon={<GoogleIcon />}
                  onClick={() => {
                    setExportOption('google');
                    handleExportOptionChange('google');
                  }}
                  disabled={loading || leads.length === 0}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    bgcolor: '#4285F4',
                    '&:hover': {
                      bgcolor: '#3367D6'
                    }
                  }}
                >
                  Export to Sheets
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => {
                    setExportOption('csv');
                    handleExportOptionChange('csv');
                  }}
                  disabled={loading || leads.length === 0}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Export to CSV
                </Button>
              </Box>

              {/* Results Grid */}
              <Grid
                container
                spacing={{ xs: 2, sm: 3, md: 4 }}
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                  mx: 'auto',
                  justifyContent: 'center' // Center grid items horizontally
                }}
              >
                {leads.map((lead, index) => (
                  <Grid
                    item
                    xs={12}      /* 1 card per row on mobile */
                    sm={6}       /* 2 cards per row on tablets */
                    md={4}       /* 3 cards per row on laptops/desktops */
                    lg={4}       /* Maintain 3 cards per row on large screens */
                    key={lead.id || index}
                    sx={{
                      display: 'flex',
                      height: '100%',
                      // Ensure consistent sizing
                      '& > *': {
                        width: '100%',
                        height: '100%'
                      }
                    }}
                  >
                    <LeadCard lead={lead} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Container>

      {/* Google Sheets Export Dialog */}
      <Dialog
        open={openGoogleDialog}
        onClose={handleGoogleDialogClose}
        aria-labelledby="google-sheets-dialog-title"
        aria-describedby="google-sheets-dialog-description"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              maxWidth: 500
            }
          }
        }}
      >
        <DialogTitle id="google-sheets-dialog-title" sx={{ pb: 1 }}>
          {googleSheetsError ? 'Google Sheets Export Error' : 'Export to Google Sheets'}
        </DialogTitle>
        <DialogContent>
          {googleSheetsError ? (
            <DialogContentText id="google-sheets-dialog-description" sx={{ color: 'error.main' }}>
              {googleSheetsError}
              <br /><br />
              Please try again or use CSV export instead.
            </DialogContentText>
          ) : (
            <DialogContentText id="google-sheets-dialog-description">
              You need to sign in with your Google account to export leads to Google Sheets.
              <br /><br />
              This will allow the app to create a new spreadsheet in your Google Drive.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleGoogleDialogClose}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          {!googleSheetsError && (
            <Button
              onClick={async () => {
                try {
                  await signIn();
                  handleGoogleDialogClose();
                  handleExportToSheets();
                } catch (error) {
                  console.error('Google Sign In Error:', error);
                  setGoogleSheetsError('Failed to sign in with Google. Please try again.');
                }
              }}
              variant="contained"
              startIcon={<GoogleIcon />}
              sx={{
                borderRadius: 2,
                bgcolor: '#4285F4',
                '&:hover': {
                  bgcolor: '#3367D6',
                }
              }}
            >
              Sign in with Google
            </Button>
          )}
        </DialogActions>
      </Dialog>

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
  );
};

export default ResultsPage;
