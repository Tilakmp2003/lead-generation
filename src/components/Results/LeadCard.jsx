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
  Stack,
  LinearProgress
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
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PublicIcon from '@mui/icons-material/Public';
import CategoryIcon from '@mui/icons-material/Category';
import ContactMailIcon from '@mui/icons-material/ContactMail';

const LeadCard = ({ lead }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      elevation={2}
      sx={{
        width: '100%',
        maxWidth: { xs: '400px', md: '450px' },
        borderRadius: { xs: 2, md: 3 },
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        {/* Business Info Section */}
        <Box sx={{ mb: { xs: 2, md: 2.5 } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
              mb: 1,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <StoreIcon color="primary" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
            {lead.businessName}
          </Typography>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.925rem' },
              mb: 0.5
            }}
          >
            <CategoryIcon fontSize="small" />
            {lead.businessType}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.925rem' }
            }}
          >
            <LocationOnIcon fontSize="small" />
            {lead.address}
          </Typography>
        </Box>

        {/* Verification Score */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: { xs: 2, md: 2.5 },
            p: 1.5,
            bgcolor: 'background.default',
            borderRadius: { xs: 1.5, md: 2 }
          }}
        >
          <VerifiedUserIcon
            sx={{
              color: lead.verificationScore >= 75 ? 'success.main' :
                     lead.verificationScore >= 50 ? 'warning.main' : 'error.main'
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                mb: 0.5,
                fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.925rem' }
              }}
            >
              Verification Score
            </Typography>
            <LinearProgress
              variant="determinate"
              value={lead.verificationScore}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: lead.verificationScore >= 75 ? 'success.main' :
                          lead.verificationScore >= 50 ? 'warning.main' : 'error.main'
                }
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: lead.verificationScore >= 75 ? 'success.main' :
                     lead.verificationScore >= 50 ? 'warning.main' : 'error.main',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
            }}
          >
            {lead.verificationScore}%
          </Typography>
        </Box>

        {/* Contact Details Section */}
        <Box sx={{ mb: { xs: 2, md: 2.5 } }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 1.5,
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <ContactMailIcon color="primary" />
            Contact Information
          </Typography>

          <Stack spacing={1}>
            {lead.contactDetails.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.925rem' },
                    color: 'text.secondary',
                    wordBreak: 'break-all'
                  }}
                >
                  {lead.contactDetails.email}
                </Typography>
              </Box>
            )}

            {lead.contactDetails.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.925rem' },
                    color: 'text.secondary'
                  }}
                >
                  {lead.contactDetails.phone}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Social Media Links */}
        {lead.contactDetails.socialMedia && Object.keys(lead.contactDetails.socialMedia).length > 0 && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1.5,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <PublicIcon color="primary" />
              Social Media
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              {Object.entries(lead.contactDetails.socialMedia).map(([platform, url]) => (
                <Chip
                  key={platform}
                  icon={getSocialIcon(platform)}
                  label={capitalizeFirstLetter(platform)}
                  component="a"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  clickable
                  size="small"
                  sx={{
                    borderRadius: { xs: 1.5, md: 2 },
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                    '& .MuiChip-icon': {
                      fontSize: { xs: '1rem', md: '1.25rem' }
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Description Section */}
        {lead.description && (
          <Box sx={{ mt: { xs: 2, md: 2.5 } }}>
            <Collapse in={expanded} collapsedSize={80}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.925rem' },
                  lineHeight: 1.6
                }}
              >
                {lead.description}
              </Typography>
            </Collapse>
            {lead.description.length > 150 && (
              <Button
                size="small"
                onClick={() => setExpanded(!expanded)}
                endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{
                  mt: 1,
                  fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                  textTransform: 'none'
                }}
              >
                {expanded ? 'Show less' : 'Read more'}
              </Button>
            )}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: { xs: 2, sm: 2.5, md: 3 }, pt: 0 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<ContactMailIcon />}
          onClick={() => window.open(`mailto:${lead.contactDetails.email}`)}
          sx={{
            borderRadius: { xs: 1.5, md: 2 },
            py: { xs: 1, md: 1.5 },
            textTransform: 'none',
            fontSize: { xs: '0.875rem', md: '1rem' }
          }}
        >
          Contact Business
        </Button>
      </CardActions>
    </Card>
  );
};

export default LeadCard;
