import React from 'react';
import {
  Box,
  Typography,
  Container,
  Link,
  Grid,
  IconButton,
  Divider,
  Paper,
  Stack,
  Button
} from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        bgcolor: '#f8f9fa',
        borderTop: '1px solid',
        borderColor: 'divider',
        position: 'relative'
      }}
    >
      {/* Scroll to top button */}
      <Box
        sx={{
          position: 'absolute',
          top: -25,
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <IconButton
          onClick={scrollToTop}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'translateY(-3px)',
              boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          <ArrowUpwardIcon />
        </IconButton>
      </Box>

      {/* Main footer content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2 }}>
          <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 2 }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography
                variant="h5"
                component="div"
                align="center"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  display: 'block',
                  mb: 2
                }}
              >
                LeadFinder
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph align="center">
                LeadFinder provides the most accurate and comprehensive business lead data for retail shop owners. Our platform helps you find verified leads and export them directly to Google Sheets.
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom align="center">
                Connect With Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'center' }}>
                {[
                  { icon: <GitHubIcon />, name: 'GitHub', href: 'https://github.com/Tilakmp2003' },
                  { icon: <TwitterIcon />, name: 'Twitter', href: 'https://x.com/tikpicksolution' },
                  { icon: <LinkedInIcon />, name: 'LinkedIn', href: 'https://www.linkedin.com/in/tilak-mp-619060250/' },
                  { icon: <LanguageIcon />, name: 'Portfolio', href: 'https://tilak-retrofolio.vercel.app/' }
                ].map((social, index) => (
                  <IconButton
                    key={index}
                    color="primary"
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      bgcolor: 'rgba(46, 125, 50, 0.1)',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        transform: 'translateY(-3px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '16.67%' }, p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              {[
                { text: 'Home', href: '/' },
                { text: 'Search Leads', href: '/results' },
                { text: 'About Us', href: '#' },
                { text: 'Contact', href: '#' },
                { text: 'Blog', href: '#' }
              ].map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  underline="hover"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    '&:hover': {
                      color: 'primary.main',
                      pl: 0.5
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Stack>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '16.67%' }, p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Resources
            </Typography>
            <Stack spacing={1}>
              {[
                { text: 'Help Center', href: '#' },
                { text: 'API Documentation', href: '#' },
                { text: 'Pricing', href: '#' },
                { text: 'FAQs', href: '#' },
                { text: 'Privacy Policy', href: '#' }
              ].map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  underline="hover"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    '&:hover': {
                      color: 'primary.main',
                      pl: 0.5
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Stack>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom align="center">
              Contact Us
            </Typography>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Stack spacing={2} alignItems="center">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon color="primary" />
                  <Typography variant="body2" color="text.secondary" align="center">
                    2022, Mullai Nagar, Madurai
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon color="primary" />
                  <Typography variant="body2" color="text.secondary" align="center">
                    +91 6383867022
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="primary" />
                  <Typography variant="body2" color="text.secondary" align="center">
                    rxtilak3@gmail.com
                  </Typography>
                </Box>
              </Stack>
            </Box>


          </Box>
        </Box>
      </Container>

      {/* Copyright section */}
      <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)', py: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: { xs: 1, md: 0 } }}>
              © {new Date().getFullYear()} LeadFinder. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link href="#" color="text.secondary" underline="hover">
                <Typography variant="body2">Terms of Service</Typography>
              </Link>
              <Link href="#" color="text.secondary" underline="hover">
                <Typography variant="body2">Privacy Policy</Typography>
              </Link>
              <Link href="#" color="text.secondary" underline="hover">
                <Typography variant="body2">Cookies</Typography>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
