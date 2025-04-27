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
  Badge,
  Stack
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
        bgcolor: 'background.paper',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        mx: 'auto',
        width: '100%', // Keep width 100%
        // Remove maxWidth constraint for sm and up
        // maxWidth: { xs: '100%', sm: '450px' }, 
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: getAvatarColor(lead.businessType),
              width: { xs: 52, md: 60 },
              height: { xs: 52, md: 60 },
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '3px solid white'
            }}
          >
            {getInitials(lead.businessName)}
          </Avatar>
        }
        title={
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              lineHeight: 1.3,
              mb: 0.5,
              color: 'text.primary'
            }}
          >
            {lead.businessName}
          </Typography>
        }
        subheader={
          <Stack direction="row" spacing={1} alignItems="center">
            <StoreIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
              {lead.businessType}
            </Typography>
          </Stack>
        }
        action={
          <Chip
            label={lead.address?.split(',')[0] || 'Unknown Location'}
            size="small"
            color="primary"
            sx={{
              mt: 0.5,
              height: { xs: 26, md: 30 },
              fontSize: { xs: '0.7rem', md: '0.8rem' },
              fontWeight: 500,
              background: 'linear-gradient(45deg, #2e7d32 30%, #60ad5e 90%)',
              boxShadow: '0 2px 8px rgba(46, 125, 50, 0.25)',
            }}
          />
        }
        sx={{ p: { xs: 2, md: 2.5 } }}
      />

      <CardContent sx={{ pt: 0, px: { xs: 2, md: 2.5 }, pb: { xs: 2, md: 2.5 }, flexGrow: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 2 },
            mb: { xs: 2, md: 2.5 },
            bgcolor: 'rgba(46, 125, 50, 0.04)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'rgba(46, 125, 50, 0.15)'
          }}
        >
          <Stack spacing={1.5}>
            {lead.contactDetails.email && (
              <Link
                href={`mailto:${lead.contactDetails.email}`}
                underline="none"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'primary.main',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  '&:hover': { color: 'primary.dark' }
                }}
              >
                <EmailIcon sx={{ fontSize: '1.1rem', mr: 1 }} />
                {lead.contactDetails.email}
              </Link>
            )}

            {lead.contactDetails.phone && (
              <Link
                href={`tel:${lead.contactDetails.phone}`}
                underline="none"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'primary.main',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  '&:hover': { color: 'primary.dark' }
                }}
              >
                <PhoneIcon sx={{ fontSize: '1.1rem', mr: 1 }} />
                {lead.contactDetails.phone}
              </Link>
            )}

            {lead.contactDetails.website && (
              <Link
                href={lead.contactDetails.website.startsWith('http') ? lead.contactDetails.website : `https://${lead.contactDetails.website}`}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'primary.main',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  '&:hover': { color: 'primary.dark' }
                }}
              >
                <LanguageIcon sx={{ fontSize: '1.1rem', mr: 1 }} />
                Website
              </Link>
            )}
          </Stack>
        </Paper>

        {/* Address */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: { xs: 2, md: 2.5 } }}>
          <LocationOnIcon sx={{ fontSize: '1.1rem', mr: 1, mt: 0.3, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{
            fontSize: { xs: '0.75rem', md: '0.875rem' },
            lineHeight: 1.5
          }}>
            {lead.address}
          </Typography>
        </Box>

        {/* Social Media Links */}
        {lead.contactDetails.socialMedia && Object.keys(lead.contactDetails.socialMedia).length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: { xs: 2, md: 2.5 } }}>
            {Object.entries(lead.contactDetails.socialMedia).map(([platform, url]) => {
              if (!url) return null;
              const formattedUrl = url.startsWith('http') ? url : `https://${url}`;

              return (
                <Tooltip key={platform} title={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                  <IconButton
                    size="small"
                    component="a"
                    href={formattedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                      width: { xs: 32, md: 36 },
                      height: { xs: 32, md: 36 },
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.15)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {getSocialIcon(platform)}
                  </IconButton>
                </Tooltip>
              );
            })}
          </Stack>
        )}

        {/* Metadata */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 2 }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ mb: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.8rem' }, mr: 1 }}>
              Source:
            </Typography>
            <Chip
              label={lead.source || 'Unknown'}
              size="small"
              sx={{
                height: { xs: 20, md: 24 },
                fontSize: { xs: '0.65rem', md: '0.75rem' },
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '& .MuiChip-label': { px: 1 }
              }}
            />
          </Box>

          <Chip
            label={`${lead.verificationScore}% Verified`}
            size="small"
            color={
              lead.verificationScore >= 75 ? "success" :
              lead.verificationScore >= 50 ? "primary" :
              lead.verificationScore >= 25 ? "warning" : "error"
            }
            sx={{
              height: { xs: 20, md: 24 },
              fontSize: { xs: '0.65rem', md: '0.75rem' },
              '& .MuiChip-label': { px: 1 }
            }}
          />
        </Stack>

        {/* Show More Content */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                lineHeight: 1.6,
                mb: 2
              }}
            >
              {lead.description}
            </Typography>

            {lead.googleMapsUrl && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<GoogleIcon />}
                component="a"
                href={lead.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  mb: 2
                }}
              >
                View on Google Maps
              </Button>
            )}

            {lead.photos?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' }, fontWeight: 600 }}>
                  Photos
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {lead.photos.slice(0, 3).map((photo, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={photo.url}
                      alt={`${lead.businessName} photo ${index + 1}`}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        objectFit: 'cover',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>

      <CardActions sx={{
        px: { xs: 2, md: 2.5 },
        py: { xs: 1.5, md: 2 },
        bgcolor: 'rgba(0, 0, 0, 0.02)',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        gap: 1,
        justifyContent: 'space-between'
      }}>
        <Button
          size="small"
          startIcon={copied ? <VerifiedIcon /> : <ContentCopyIcon />}
          onClick={handleCopyContact}
          color={copied ? "success" : "primary"}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontSize: { xs: '0.75rem', md: '0.875rem' },
            px: { xs: 1.5, md: 2 },
            py: 0.75
          }}
        >
          {copied ? "Copied!" : "Copy Contact"}
        </Button>

        <Button
          size="small"
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {expanded ? "Show Less" : "Show More"}
        </Button>
      </CardActions>

      {/* Verification Badge */}
      <Badge
        sx={{
          position: 'absolute',
          top: -8,
          right: 16,
          zIndex: 1
        }}
        badgeContent={
          <Tooltip title={`Verification Score: ${lead.verificationScore}%`}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: lead.verificationScore >= 75 ? 'success.main' :
                         lead.verificationScore >= 50 ? 'primary.main' :
                         lead.verificationScore >= 25 ? 'warning.main' : 'error.main',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                border: '2px solid white'
              }}
            >
              <VerifiedIcon sx={{ fontSize: '1.1rem' }} />
            </Avatar>
          </Tooltip>
        }
      >
        <Box sx={{ width: 1, height: 1 }} />
      </Badge>
    </Card>
  );
};

export default LeadCard;
