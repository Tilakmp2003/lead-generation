import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const TermsOfService = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Terms of Service
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Acceptance of Terms
          </Typography>
          <Typography paragraph>
            By accessing or using Lead Generation Tool, you agree to be bound by these Terms of Service and our Privacy Policy.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Service Description
          </Typography>
          <Typography paragraph>
            Lead Generation Tool provides business lead generation services by collecting and verifying business information from various sources including Google Places API. We allow users to search, view, and export this data to Google Sheets.
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. Google API Services
          </Typography>
          <Typography paragraph>
            Our application uses Google API Services. By using these features, you agree to be bound by the Google Terms of Service. We access Google Sheets and Drive APIs solely to export lead data at your request.
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. User Obligations
          </Typography>
          <Typography paragraph>
            You agree to:
            - Provide accurate registration information
            - Use the service for lawful purposes only
            - Not abuse or misuse the API services
            - Respect rate limits and usage guidelines
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. Data Usage and Privacy
          </Typography>
          <Typography paragraph>
            We handle all data in accordance with our Privacy Policy and the Google API Services User Data Policy. We only access and store information necessary for the functioning of our service.
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Intellectual Property
          </Typography>
          <Typography paragraph>
            All content and functionality on Lead Generation Tool is the exclusive property of our company and protected by copyright laws.
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. Limitation of Liability
          </Typography>
          <Typography paragraph>
            We strive to maintain accurate data but cannot guarantee the accuracy or completeness of business information. Use the service at your own risk.
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. Contact Information
          </Typography>
          <Typography paragraph>
            For questions about these terms, contact:
            Email: princymagdaline2003@gmail.com
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Last updated: April 26, 2025
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfService;