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

  // State for Google Sheets export dialog
  const [openGoogleDialog, setOpenGoogleDialog] = useState(false);
  const [exportOption, setExportOption] = useState('csv');
  const [googleSheetsError, setGoogleSheetsError] = useState(null);

  const handleExportToSheets = async () => {
    try {
      setLoading(true);

      if (exportOption === 'csv' || !isSignedIn()) {
        // Export to CSV file
        console.log('Creating CSV file for download.');

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
          console.error('Error saving export history:', saveError);
          // Optionally show a warning if saving history fails but download succeeded
          setSnackbarMessage('Leads exported to CSV, but failed to save history.');
          setSnackbarSeverity('warning');
          setOpenSnackbar(true); // Re-open snackbar with warning
        }
      } else {
        // Export to Google Sheets
        try {
          console.log('Exporting to Google Sheets...');

          // Check if user is signed in to Google
          if (!isSignedIn()) {
            console.log('User not signed in to Google, requesting sign in...');
            await signIn();
          }

          // Create a new Google Sheet
          const sheetTitle = `Lead Generation - ${sector} in ${locationFilter} - ${new Date().toLocaleDateString()}`;
          console.log('Creating new Google Sheet:', sheetTitle);
          const sheet = await createSheet(sheetTitle);

          if (!sheet || !sheet.spreadsheetId) {
            throw new Error('Failed to create Google Sheet');
          }

          console.log('Sheet created with ID:', sheet.spreadsheetId);

          // Export leads to the sheet
          await exportLeadsToSheet(leads, sheet.spreadsheetId);

          // Show success message with link to the sheet
          const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}`;
          console.log('Leads exported successfully to:', sheetUrl);

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
            console.error('Error saving export history:', saveError);
          }

          // Open the sheet in a new tab
          window.open(sheetUrl, '_blank');

          setSnackbarMessage('Leads exported to Google Sheets successfully!');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);
        } catch (googleError) {
          console.error('Error exporting to Google Sheets:', googleError);
          setGoogleSheetsError(googleError.message || 'Failed to export to Google Sheets');
          setOpenGoogleDialog(true);

          // Fallback to CSV export
          setExportOption('csv');
          handleExportToSheets();
        }
      }
    } catch (error) {
      // Catch errors specifically related to export
      console.error('Error exporting leads:', error);
      setSnackbarMessage('Failed to export leads. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle export option change
  const handleExportOptionChange = (option) => {
    setExportOption(option);
    if (option === 'google' && !isSignedIn()) {
      // If Google Sheets is selected but user is not signed in, show dialog
      setOpenGoogleDialog(true);
    } else {
      handleExportToSheets();
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
        pt: { xs: 3, sm: 4, md: 5, lg: 6 },
        pb: { xs: 6, sm: 8, md: 10 }
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{
          px: { xs: 2, sm: 4, md: 6, lg: 8 }
        }}
      >
        <Box sx={{ 
          maxWidth: 1600,
          mx: 'auto'
        }}>
          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{
              mb: { xs: 2, sm: 3, md: 4 },
              borderRadius: { xs: 1.5, md: 2 },
              px: { xs: 2, md: 3 },
              py: { xs: 1, md: 1.5 },
              fontSize: { xs: '0.875rem', sm: '0.925rem', md: '1rem' },
              textTransform: 'none',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            Back to Search
          </Button>

          <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem', lg: '2.5rem' },
                color: 'text.primary',
                mb: { xs: 1, sm: 2 }
              }}
            >
              Search Results
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                color: 'text.secondary'
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
              mb: { xs: 3, sm: 4, md: 5 },
              borderRadius: { xs: 2, md: 3 },
              bgcolor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: { xs: 2, sm: 3, md: 4 },
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
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
              spacing={{ xs: 2, sm: 3, md: 4 }}
              sx={{ 
                maxWidth: 1400,
                mx: 'auto'
              }}
            >
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                    Business Sector
                  </InputLabel>
                  <Select
                    value={sector}
                    label="Business Sector"
                    onChange={handleSectorChange}
                    sx={{
                      borderRadius: { xs: 1.5, md: 2 },
                      '& .MuiSelect-select': {
                        fontSize: { xs: '0.875rem', md: '1rem' }
                      }
                    }}
                  >
                    {businessSectors.map((sector) => (
                      <MenuItem 
                        key={sector} 
                        value={sector}
                        sx={{ 
                          fontSize: { xs: '0.875rem', md: '1rem' },
                          py: { xs: 1, md: 1.5 }
                        }}
                      >
                        {sector}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                    Location
                  </InputLabel>
                  <Select
                    value={locationFilter}
                    label="Location"
                    onChange={handleLocationChange}
                    sx={{
                      borderRadius: { xs: 1.5, md: 2 },
                      '& .MuiSelect-select': {
                        fontSize: { xs: '0.875rem', md: '1rem' }
                      }
                    }}
                  >
                    {locations.map((loc) => (
                      <MenuItem 
                        key={loc} 
                        value={loc}
                        sx={{ 
                          fontSize: { xs: '0.875rem', md: '1rem' },
                          py: { xs: 1, md: 1.5 }
                        }}
                      >
                        {loc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {locationFilter === 'Others' && (
                  <Box sx={{
                    mt: 1.5,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 1.5 }
                  }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Enter Custom Location"
                      variant="outlined"
                      value={customLocation}
                      onChange={handleCustomLocationChange}
                      placeholder="e.g., Coimbatore, Trichy"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: { xs: 1.5, md: 2 },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', md: '1rem' }
                        },
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.875rem', md: '1rem' }
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCustomLocationSubmit}
                      disabled={!customLocation.trim()}
                      sx={{
                        borderRadius: { xs: 1.5, md: 2 },
                        minWidth: { xs: '100%', sm: '120px' },
                        height: { xs: '36px', sm: '40px' },
                        fontSize: { xs: '0.875rem', md: '1rem' }
                      }}
                    >
                      Apply
                    </Button>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                    Sort By
                  </InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={handleSortChange}
                    sx={{
                      borderRadius: { xs: 1.5, md: 2 },
                      '& .MuiSelect-select': {
                        fontSize: { xs: '0.875rem', md: '1rem' }
                      }
                    }}
                  >
                    <MenuItem value="rating" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Rating (High to Low)</MenuItem>
                    <MenuItem value="reviews" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Reviews (Most to Least)</MenuItem>
                    <MenuItem value="name" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Business Name (A-Z)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                    Verification Score
                  </InputLabel>
                  <Select
                    value={minVerificationScore}
                    label="Verification Score"
                    onChange={handleVerificationScoreChange}
                    sx={{
                      borderRadius: { xs: 1.5, md: 2 },
                      '& .MuiSelect-select': {
                        fontSize: { xs: '0.875rem', md: '1rem' }
                      }
                    }}
                  >
                    <MenuItem value={0} sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>All Leads</MenuItem>
                    <MenuItem value={50} sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Basic Verification (50%+)</MenuItem>
                    <MenuItem value={75} sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>High Verification (75%+)</MenuItem>
                    <MenuItem value={90} sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Premium Verification (90%+)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Export Actions */}
            <Box sx={{ 
              mt: { xs: 3, sm: 4 },
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 3 },
              justifyContent: 'center'
            }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleExportCSV}
                startIcon={<FileDownloadIcon />}
                sx={{
                  borderRadius: { xs: 1.5, md: 2 },
                  py: { xs: 1, md: 1.5 },
                  px: { xs: 2, md: 3 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  textTransform: 'none'
                }}
              >
                Export to CSV
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleExportGoogleSheets}
                startIcon={<GoogleIcon />}
                sx={{
                  borderRadius: { xs: 1.5, md: 2 },
                  py: { xs: 1, md: 1.5 },
                  px: { xs: 2, md: 3 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  textTransform: 'none'
                }}
              >
                Export to Google Sheets
              </Button>
            </Box>
          </Paper>

          {/* Results Grid */}
          <Grid
            container
            spacing={{ xs: 2, sm: 3, md: 4 }}
            sx={{
              maxWidth: 1600,
              mx: 'auto'
            }}
          >
            {leads.map((lead, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                lg={4} 
                xl={3}
                key={lead.id || index}
                sx={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <LeadCard lead={lead} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Google Sheets Export Dialog */}
      <Dialog
        open={openGoogleDialog}
        onClose={handleGoogleDialogClose}
        aria-labelledby="google-sheets-dialog-title"
        aria-describedby="google-sheets-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, md: 3 },
            p: { xs: 2, sm: 3 },
            width: '100%',
            maxWidth: { xs: '90%', sm: 500 }
          }
        }}
      >
        <DialogTitle 
          id="google-sheets-dialog-title" 
          sx={{ 
            pb: 1,
            fontSize: { xs: '1.25rem', md: '1.5rem' }
          }}
        >
          {googleSheetsError ? 'Google Sheets Export Error' : 'Export to Google Sheets'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="google-sheets-dialog-description" 
            sx={{ 
              color: googleSheetsError ? 'error.main' : 'text.secondary',
              fontSize: { xs: '0.875rem', md: '1rem' }
            }}
          >
            {googleSheetsError ? (
              <>
                {googleSheetsError}
                <br /><br />
                Please try again or use CSV export instead.
              </>
            ) : (
              'Your leads will be exported to a new Google Sheets document. You can then share and collaborate on this document with your team.'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pt: 2 }}>
          <Button 
            onClick={handleGoogleDialogClose}
            sx={{ 
              fontSize: { xs: '0.875rem', md: '1rem' },
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          {!googleSheetsError && (
            <Button 
              onClick={handleGoogleExportConfirm}
              variant="contained" 
              color="primary"
              sx={{ 
                fontSize: { xs: '0.875rem', md: '1rem' },
                textTransform: 'none'
              }}
            >
              Export
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
            fontSize: { xs: '0.875rem', md: '1rem' },
            borderRadius: { xs: 1.5, md: 2 }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResultsPage;
