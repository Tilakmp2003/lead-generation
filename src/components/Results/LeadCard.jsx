import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Link,
  IconButton,
  Tooltip,
  Avatar,
  CardHeader,
  CardActions,
  Button,
  Collapse,
  Paper,
  Badge
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import VerifiedIcon from '@mui/icons-material/Verified';
import StoreIcon from '@mui/icons-material/Store';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LanguageIcon from '@mui/icons-material/Language';
import GoogleIcon from '@mui/icons-material/Google';

const LeadCard = ({ lead }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Add error handling for missing lead data
  if (!lead) {
    console.error('Lead data is missing');
    return (
      <Card sx={{ height: '100%', p: 3, borderRadius: 3, boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}>
        <Typography variant="body1" color="error">Error: Invalid lead data</Typography>
      </Card>
    );
  }

  // Ensure contactDetails exists
  if (!lead.contactDetails) {
    console.error('Lead contactDetails is missing:', lead);
    lead.contactDetails = {}; // Create empty object to prevent errors
  }

  // Log lead data for debugging
  console.log('Processing lead in LeadCard:', lead);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'facebook':
        return <FacebookIcon />;
      case 'linkedin':
        return <LinkedInIcon />;
      case 'instagram':
        return <InstagramIcon />;
      case 'twitter':
        return <TwitterIcon />;
      default:
        return null;
    }
  };

  const handleCopyContact = () => {
    // Build contact info with available data
    let contactInfo = `Business: ${lead.businessName}\n`;

    if (lead.ownerName) {
      contactInfo += `Owner: ${lead.ownerName}\n`;
    }

    if (lead.contactDetails.email) {
      contactInfo += `Email: ${lead.contactDetails.email}\n`;
    }

    if (lead.contactDetails.phone) {
      contactInfo += `Phone: ${lead.contactDetails.phone}\n`;
    }

    if (lead.contactDetails.website) {
      contactInfo += `Website: ${lead.contactDetails.website}\n`;
    }

    contactInfo += `Address: ${lead.address}\n`;

    if (lead.googleMapsUrl) {
      contactInfo += `Google Maps: ${lead.googleMapsUrl}\n`;
    }

    if (lead.description) {
      contactInfo += `\nDescription: ${lead.description}\n`;
    }

    contactInfo += `\nSource: ${lead.source}`;

    navigator.clipboard.writeText(contactInfo.trim());
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Generate initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate a color based on business type
  const getAvatarColor = (type) => {
    const colors = {
      'Electronics': '#3f51b5',
      'Fashion': '#e91e63',
      'Grocery': '#4caf50',
      'Retail': '#ff9800',
      'Home Decor': '#9c27b0'
    };

    return colors[type] || '#2e7d32';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        borderRadius: 3,
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.12)'
        }
      }}
    >
      {/* Verification Score Badge */}
      <Badge
        sx={{
          position: 'absolute',
          top: -12,
          right: 24,
          zIndex: 1
        }}
        badgeContent={
          <Tooltip title={`Verification Score: ${lead.verificationScore || 0}%`}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: lead.verificationScore >= 75 ? 'success.main' :
                         lead.verificationScore >= 50 ? 'primary.main' :
                         lead.verificationScore >= 25 ? 'warning.main' : 'error.main',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                border: '2px solid white'
              }}
            >
              <VerifiedIcon fontSize="small" />
            </Avatar>
          </Tooltip>
        }
      >
        <Box sx={{ width: 1, height: 1 }} />
      </Badge>

      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: getAvatarColor(lead.businessType),
              width: 64,
              height: 64,
              boxShadow: '0 6px 12px rgba(0,0,0,0.12)',
              ml: 1
            }}
          >
            {getInitials(lead.businessName)}
          </Avatar>
        }
        title={
          <Typography
            variant="h6"
            component="h3"
            fontWeight="bold"
            noWrap
            sx={{
              fontSize: '1.25rem',
              height: '30px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {lead.businessName}
          </Typography>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.8 }}>
            <StoreIcon fontSize="small" sx={{ mr: 0.8, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {lead.businessType}
            </Typography>
          </Box>
        }
        action={
          <Chip
            label={lead.address ? lead.address.split(',')[0] : 'Unknown'} // Show only city, with fallback
            size="small"
            color="primary"
            sx={{
              mt: 1.5,
              mr: 1.5,
              fontWeight: 500,
              fontSize: '0.8rem',
              height: 28,
              background: 'linear-gradient(45deg, #2e7d32 30%, #60ad5e 90%)',
              boxShadow: '0 2px 6px rgba(46, 125, 50, 0.2)',
            }}
          />
        }
        sx={{
          pb: 1,
          pt: 3,
          px: 3,
          height: '100px'
        }}
      />

      <CardContent sx={{
        pt: 1,
        flexGrow: 1,
        px: 3,
        pb: 3,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 2.5,
          mt: 1,
          height: '40px'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ color: 'text.secondary' }}>
              Source:
            </Typography>
            <Chip
              label={lead.source || 'Unknown'}
              size="small"
              color="default"
              sx={{
                ml: 1.5,
                height: 28,
                fontWeight: 500,
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '& .MuiChip-label': { px: 1.5 }
              }}
            />
          </Box>

          <Chip
            label={`${lead.verificationScore || 0}% Verified`}
            size="small"
            color={
              lead.verificationScore >= 75 ? "success" :
              lead.verificationScore >= 50 ? "primary" :
              lead.verificationScore >= 25 ? "warning" : "error"
            }
            sx={{
              height: 28,
              fontWeight: 500,
              '& .MuiChip-label': { px: 1.5 }
            }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 3, flexGrow: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: 'rgba(46, 125, 50, 0.05)',
              borderRadius: 3,
              border: '1px solid rgba(46, 125, 50, 0.1)',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            {lead.contactDetails.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <EmailIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
                <Link
                  href={`mailto:${lead.contactDetails.email}`}
                  underline="hover"
                  sx={{
                    fontWeight: 500,
                    color: 'primary.main',
                    '&:hover': {
                      color: 'primary.dark'
                    }
                  }}
                >
                  {lead.contactDetails.email}
                </Link>
              </Box>
            )}

            {lead.contactDetails.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: lead.contactDetails.website ? 1.5 : 0 }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
                <Link
                  href={`tel:${lead.contactDetails.phone}`}
                  underline="hover"
                  sx={{
                    fontWeight: 500,
                    color: 'primary.main',
                    '&:hover': {
                      color: 'primary.dark'
                    }
                  }}
                >
                  {lead.contactDetails.phone}
                </Link>
              </Box>
            )}

            {lead.contactDetails.website && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LanguageIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
                <Link
                  href={lead.contactDetails.website.startsWith('http') ? lead.contactDetails.website : `https://${lead.contactDetails.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{
                    fontWeight: 500,
                    color: 'primary.main',
                    '&:hover': {
                      color: 'primary.dark'
                    }
                  }}
                >
                  Website
                </Link>
              </Box>
            )}

            {/* Social Media Icons - Always visible */}
            {lead.contactDetails.socialMedia && Object.keys(lead.contactDetails.socialMedia).length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Object.entries(lead.contactDetails.socialMedia || {}).map(([platform, url]) => {
                    // Skip if URL is empty or undefined
                    if (!url) return null;

                    // Format URL properly
                    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;

                    return (
                      <Tooltip title={platform.charAt(0).toUpperCase() + platform.slice(1)} key={platform}>
                        <IconButton
                          size="small"
                          color="primary"
                          component="a"
                          href={formattedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                              bgcolor: 'rgba(25, 118, 210, 0.15)'
                            }
                          }}
                        >
                          {getSocialIcon(platform)}
                        </IconButton>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Paper>
        </Box>

        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          mb: 2.5,
          minHeight: '50px'
        }}>
          <LocationOnIcon fontSize="small" sx={{ mr: 1.5, mt: 0.3, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {lead.address || 'Address not available'}
          </Typography>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: 3,
                mb: 3
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, lineHeight: 1.6 }}>
                {lead.description}
              </Typography>
            </Paper>

            {/* Google Maps link if available */}
            {lead.googleMapsUrl && (
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  size="medium"
                  startIcon={<GoogleIcon />}
                  component="a"
                  href={lead.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    borderRadius: 3,
                    px: 2.5,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  View on Google Maps
                </Button>
              </Box>
            )}

            {/* Photos if available */}
            {lead.photos && lead.photos.length > 0 && (
              <Box sx={{ mt: 3, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ mb: 1.5 }}>
                  Photos
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {lead.photos.slice(0, 3).map((photo, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={photo.url}
                      alt={`${lead.businessName} photo ${index + 1}`}
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 2,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Additional information section - we've moved social media to the main card view */}
          </Box>
        </Collapse>
      </CardContent>

      <CardActions sx={{
        justifyContent: 'space-between',
        px: 3,
        py: 2.5,
        bgcolor: 'rgba(0, 0, 0, 0.02)',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <Button
          size="medium"
          startIcon={copied ? <VerifiedIcon /> : <ContentCopyIcon />}
          onClick={handleCopyContact}
          color={copied ? "success" : "primary"}
          variant="outlined"
          sx={{
            borderRadius: 3,
            px: 2.5,
            py: 0.8,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: copied ? '0 2px 8px rgba(76, 175, 80, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
            '&:hover': {
              boxShadow: copied ? '0 4px 12px rgba(76, 175, 80, 0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
            }
          }}
        >
          {copied ? "Copied!" : "Copy Contact"}
        </Button>

        <Button
          size="medium"
          onClick={handleExpandClick}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            borderRadius: 3,
            px: 2.5,
            py: 0.8,
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.05)'
            }
          }}
        >
          {expanded ? "Show Less" : "Show More"}
        </Button>
      </CardActions>
    </Card>
  );
};

export default LeadCard;
