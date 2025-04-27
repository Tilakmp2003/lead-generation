import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Privacy Policy
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Information We Collect
          </Typography>
          <Typography paragraph>
            When you use Lead Generation Tool, we collect:
            - Account information (name, email)
            - Search history and preferences
            - Usage data and analytics
            - Google OAuth data for Sheets integration
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. How We Use Your Information
          </Typography>
          <Typography paragraph>
            We use your information to:
            - Provide lead generation services
            - Export data to Google Sheets
            - Improve our services
            - Send important updates
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. Google API Services User Data Policy
          </Typography>
          <Typography paragraph>
            Our application's use and transfer of information received from Google APIs adheres to{' '}
            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
              Google API Services User Data Policy
            </a>, including the Limited Use requirements.
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. Data Storage and Security
          </Typography>
          <Typography paragraph>
            - We use industry-standard security measures
            - Data is stored securely on Supabase servers
            - We never share your data with third parties without consent
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. OAuth Scope Usage
          </Typography>
          <Typography paragraph>
            We request the following Google OAuth scopes:
            - /auth/drive.file: To create and manage Google Sheets with exported leads
            - /auth/spreadsheets: To write lead data to your Google Sheets
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Contact Information
          </Typography>
          <Typography paragraph>
            For privacy concerns, contact us at:
            Email: rxtilak3@gmail.com
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Last updated: April 26, 2025
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;