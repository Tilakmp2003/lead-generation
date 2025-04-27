import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Paper,
  Avatar,
  Divider
} from '@mui/material';
import SearchForm from './SearchForm';
import StoreIcon from '@mui/icons-material/Store';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';

const HomePage = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section with Background Image */}
      <Box sx={{
        position: 'relative',
        height: { xs: '500px', md: '600px' },
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8)), url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1,
        }
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: 'black',
                  mb: 3,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                  textAlign: 'center'
                }}
              >
                Find Retail Shop Owners in Any Location
              </Typography>
              <Typography
                variant="h5"
                paragraph
                sx={{
                  mb: 4,
                  color: 'black',
                  maxWidth: '800px',
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                  textAlign: 'center',
                  mx: 'auto'
                }}
              >
                Get verified contact details of retail shop owners and export them directly to Google Sheets
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Search Form Section */}
      <Box id="search-section" sx={{ py: 8 }}> {/* Adjusted padding since stats section is removed */}
        <SearchForm />
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              mb: { xs: 1, md: 2 },
              fontWeight: 600,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
            }}
          >
            How It Works
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            sx={{
              mb: { xs: 4, md: 6 },
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 2, sm: 0 }
            }}
          >
            Our lead generation process is simple, fast, and effective
          </Typography>

          <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center" sx={{ mx: 'auto' }}>
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  width: '100%',
                  maxWidth: 350,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  '&:hover': {
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    transform: 'translateY(-10px)',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.light',
                      boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)'
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                </Box>
                <Typography variant="h5" component="h3" gutterBottom align="center" fontWeight="bold">
                  1. Search
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary">
                  Select your target business sector and location to find relevant retail shop owners.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  width: '100%',
                  maxWidth: 350,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  '&:hover': {
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    transform: 'translateY(-10px)',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.light',
                      boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)'
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                </Box>
                <Typography variant="h5" component="h3" gutterBottom align="center" fontWeight="bold">
                  2. Review Leads
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary">
                  Browse through verified leads with complete contact information and business details.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  width: '100%',
                  maxWidth: 350,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  '&:hover': {
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    transform: 'translateY(-10px)',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.light',
                      boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)'
                    }}
                  >
                    <CloudDownloadIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                </Box>
                <Typography variant="h5" component="h3" gutterBottom align="center" fontWeight="bold">
                  3. Export
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary">
                  Export selected leads directly to Google Sheets for your marketing campaigns.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          align="center"
          sx={{
            mb: { xs: 1, md: 2 },
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
          }}
        >
          Why Choose Our Lead Generation Tool?
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{
            mb: { xs: 4, md: 6 },
            maxWidth: 700,
            mx: 'auto',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 2, sm: 0 }
          }}
        >
          We provide the most accurate and comprehensive business lead data
        </Typography>

        <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center" sx={{ mx: 'auto' }}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card sx={{
              height: '100%',
              overflow: 'visible',
              width: '100%',
              maxWidth: 350,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  mt: -4
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    boxShadow: '0 8px 20px rgba(46, 125, 50, 0.3)',
                    border: '5px solid white'
                  }}
                >
                  <StoreIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Box>
              <CardContent sx={{ pt: 0 }}>
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  align="center"
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  Comprehensive Database
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="body1"
                  paragraph
                  align="center"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    height: '4.5em'
                  }}
                >
                  Access our extensive database of retail shop owners across multiple business sectors and locations, updated daily with new verified leads.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['10,000+ business listings', 'Daily updates', 'Multiple business categories'].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                      <Typography variant="body2" noWrap>{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card sx={{
              height: '100%',
              overflow: 'visible',
              width: '100%',
              maxWidth: 350,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  mt: -4
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    boxShadow: '0 8px 20px rgba(46, 125, 50, 0.3)',
                    border: '5px solid white'
                  }}
                >
                  <VerifiedUserIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Box>
              <CardContent sx={{ pt: 0 }}>
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  align="center"
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  Verified Leads
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="body1"
                  paragraph
                  align="center"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    height: '4.5em'
                  }}
                >
                  All leads are verified using our AI-powered authentication system to ensure accuracy and reliability, giving you confidence in your outreach.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['AI verification system', 'Multi-source validation', '99% accuracy rate'].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                      <Typography variant="body2" noWrap>{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card sx={{
              height: '100%',
              overflow: 'visible',
              width: '100%',
              maxWidth: 350,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  mt: -4
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    boxShadow: '0 8px 20px rgba(46, 125, 50, 0.3)',
                    border: '5px solid white'
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Box>
              <CardContent sx={{ pt: 0 }}>
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  align="center"
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  Location-Based Search
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="body1"
                  paragraph
                  align="center"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    height: '4.5em'
                  }}
                >
                  Find retail shop owners in specific locations to target your marketing efforts effectively and maximize your conversion rates.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['Precise location filtering', 'City and region targeting', 'Neighborhood-level search'].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                      <Typography variant="body2" noWrap>{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          position: 'relative',
          px: { xs: 2, sm: 3, md: 4 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
            zIndex: -1,
          }
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: -1,
            opacity: 0.1
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: '5%',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '15%',
              right: '10%',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)'
            }}
          />
        </Box>

        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                position: 'relative',
                display: 'inline-block',
                color: 'black',
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: { xs: 60, md: 80 },
                  height: 4,
                  backgroundColor: 'black',
                  borderRadius: 2
                }
              }}
            >
              What Our Customers Say
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mt: 3,
                maxWidth: 700,
                mx: 'auto',
                color: 'black',
                fontWeight: 500,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                px: { xs: 2, sm: 0 }
              }}
            >
              Hear from businesses that have transformed their lead generation process
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {[
              {
                name: 'Rajesh Kumar',
                position: 'Marketing Director',
                company: 'TechSolutions Inc.',
                quote: 'This lead generation tool has transformed our outreach strategy. We\'ve seen a 40% increase in conversion rates since we started using it.',
                avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                rating: 5
              },
              {
                name: 'Priya Sharma',
                position: 'Sales Manager',
                company: 'Global Retail',
                quote: 'The accuracy of the leads is impressive. Almost every contact we reached out to was valid, saving us countless hours of verification work.',
                avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                rating: 5
              },
              {
                name: 'Arun Singh',
                position: 'Business Development',
                company: 'Innovate Partners',
                quote: 'The Google Sheets integration is a game-changer. It fits perfectly into our existing workflow and makes lead management effortless.',
                avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
                rating: 5
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    height: '100%',
                    width: '100%',
                    maxWidth: 350,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 4,
                    color: 'text.primary',
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  {/* Quote icon */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      left: 30,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 24,
                      fontWeight: 'bold',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    "
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Star rating */}
                    <Box sx={{ display: 'flex', mb: 2, color: 'warning.main' }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} fontSize="small" />
                      ))}
                    </Box>

                    <Typography
                      variant="body1"
                      paragraph
                      sx={{
                        mb: 3,
                        fontStyle: 'italic',
                        flex: 1,
                        color: 'text.primary',
                        lineHeight: 1.6
                      }}
                    >
                      "{testimonial.quote}"
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={testimonial.avatar}
                        sx={{
                          width: 64,
                          height: 64,
                          mr: 2,
                          border: '3px solid white',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {testimonial.position}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box sx={{ py: { xs: 8, md: 10 }, textAlign: 'center', px: { xs: 2, sm: 3, md: 4 } }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
            }}
          >
            Ready to Generate Quality Leads?
          </Typography>
          <Typography
            variant="h6"
            paragraph
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              px: { xs: 2, sm: 0 }
            }}
          >
            Start searching for retail shop owners and export their contact details to Google Sheets today.
          </Typography>

        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
