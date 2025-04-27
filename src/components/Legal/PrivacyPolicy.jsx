import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
            mb: { xs: 3, md: 4 },
            color: 'primary.main'
          }}
        >
          Privacy Policy
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
          <Section title="1. Information We Collect">
            When you use Lead Generation Tool, we collect:
            <ul>
              <li>Account information (name, email)</li>
              <li>Search history and preferences</li>
              <li>Usage data and analytics</li>
              <li>Google OAuth data for Sheets integration</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            We use your information to:
            <ul>
              <li>Provide lead generation services</li>
              <li>Export data to Google Sheets</li>
              <li>Improve our services</li>
              <li>Send important updates</li>
            </ul>
          </Section>

          <Section title="3. Google API Services User Data Policy">
            Our application's use and transfer of information received from Google APIs adheres to{' '}
            <a 
              href="https://developers.google.com/terms/api-services-user-data-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#2e7d32', textDecoration: 'none', borderBottom: '1px dotted #2e7d32' }}
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </Section>

          <Section title="4. Data Storage and Security">
            <ul>
              <li>We use industry-standard security measures</li>
              <li>Data is stored securely on Supabase servers</li>
              <li>We never share your data with third parties without consent</li>
            </ul>
          </Section>

          <Section title="5. OAuth Scope Usage">
            We request the following Google OAuth scopes:
            <ul>
              <li>/auth/drive.file: To create and manage Google Sheets with exported leads</li>
              <li>/auth/spreadsheets: To write lead data to your Google Sheets</li>
            </ul>
          </Section>

          <Section title="6. Contact Information">
            For privacy concerns, contact us at:{' '}
            <a 
              href="mailto:rxtilak3@gmail.com"
              style={{ color: '#2e7d32', textDecoration: 'none', borderBottom: '1px dotted #2e7d32' }}
            >
              rxtilak3@gmail.com
            </a>
          </Section>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mt: 4,
              pt: 2,
              borderTop: '1px solid rgba(0,0,0,0.1)',
              textAlign: 'center',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Last updated: April 26, 2025
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

// Helper component for sections
const Section = ({ title, children }) => (
  <Box sx={{ '& ul': { pl: 3, mt: 1, mb: 0 } }}>
    <Typography 
      variant="h6" 
      gutterBottom 
      sx={{ 
        fontWeight: 600,
        fontSize: { xs: '1.1rem', sm: '1.25rem' },
        color: 'text.primary',
        mb: 2
      }}
    >
      {title}
    </Typography>
    <Typography 
      component="div" 
      sx={{ 
        color: 'text.secondary',
        fontSize: { xs: '0.875rem', sm: '1rem' },
        lineHeight: 1.7
      }}
    >
      {children}
    </Typography>
  </Box>
);

export default PrivacyPolicy;