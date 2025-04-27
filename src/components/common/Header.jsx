import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useScrollTrigger,
  Slide,
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';

// Hide AppBar on scroll down
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const location = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate('/login');
  };

  const isMenuItemActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Search Leads', icon: <SearchIcon />, path: '/results' },
  ];

  return (
    <>
      <HideOnScroll>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Container maxWidth="lg">
            <Toolbar 
              disableGutters 
              sx={{ 
                py: { xs: 1, md: 1.5 },
                gap: 2
              }}
            >
              {/* Logo */}
              <Typography
                variant="h5"
                component={Link}
                to="/"
                sx={{
                  flexGrow: { xs: 1, md: 0 },
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  mr: { md: 4 }
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: { xs: 36, md: 40 },
                    height: { xs: 36, md: 40 },
                    boxShadow: '0 2px 10px rgba(46, 125, 50, 0.3)',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <SearchIcon />
                </Avatar>
                <Box component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  LeadFinder
                </Box>
              </Typography>

              {/* Desktop Navigation */}
              <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                gap: 1,
                alignItems: 'center',
                flexGrow: 1, // Allow this box to grow and fill space
                justifyContent: 'center' // Center the items within this box
              }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    component={Link}
                    to={item.path}
                    color="inherit"
                    sx={{
                      px: 2,
                      py: 1,
                      color: isMenuItemActive(item.path) ? 'primary.main' : 'text.primary',
                      fontWeight: isMenuItemActive(item.path) ? 600 : 500,
                      position: 'relative',
                      borderRadius: 2,
                      '&::after': isMenuItemActive(item.path) ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '3px',
                        bgcolor: 'primary.main',
                        borderRadius: '3px 3px 0 0'
                      } : {},
                      '&:hover': {
                        bgcolor: 'rgba(46, 125, 50, 0.04)'
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>

              {/* User Actions */}
              <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                gap: 2,
                alignItems: 'center',
                ml: 'auto'
              }}>
                {isAuthenticated ? (
                  <Button
                    onClick={handleUserMenuOpen}
                    sx={{
                      color: 'text.primary',
                      fontWeight: 500,
                      borderRadius: 2,
                      px: 2,
                      '&:hover': {
                        bgcolor: 'rgba(46, 125, 50, 0.04)'
                      }
                    }}
                    startIcon={
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'primary.main',
                          fontSize: '1rem'
                        }}
                      >
                        {user?.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() :
                         user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                    }
                  >
                    {user?.user_metadata?.name || user?.email?.split('@')[0] || 'My Account'}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      component={Link}
                      to="/login"
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to="/register"
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1
                      }}
                    >
                      Register
                    </Button>
                  </>
                )}
              </Box>

              {/* Mobile Menu Button */}
              <IconButton
                color="inherit"
                aria-label="open menu"
                edge="end"
                onClick={handleMobileMenuToggle}
                sx={{
                  display: { md: 'none' },
                  color: 'text.primary',
                  p: 1
                }}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        PaperProps={{
          sx: {
            width: '80%',
            maxWidth: 300,
            borderRadius: '12px 0 0 12px',
            p: 2
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            Menu
          </Typography>
          <IconButton onClick={handleMobileMenuToggle} color="inherit">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={isMenuItemActive(item.path)}
              sx={{
                borderRadius: 2,
                mb: 1,
                bgcolor: isMenuItemActive(item.path) ? 'rgba(46, 125, 50, 0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(46, 125, 50, 0.05)'
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: isMenuItemActive(item.path) ? 'primary.main' : 'inherit',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isMenuItemActive(item.path) ? 600 : 400
                }}
              />
            </ListItem>
          ))}

          <Divider sx={{ my: 2 }} />

          {isAuthenticated ? (
            <>
              <ListItem
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: 'rgba(46, 125, 50, 0.1)'
                }}
              >
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText
                  primary={user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                  secondary={user?.email}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                />
              </ListItem>
              <ListItem
                button
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'rgba(46, 125, 50, 0.05)'
                  }
                }}
              >
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem
                button
                component={Link}
                to="/login"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'rgba(46, 125, 50, 0.05)'
                  }
                }}
              >
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem
                button
                component={Link}
                to="/register"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'rgba(46, 125, 50, 0.05)'
                  }
                }}
              >
                <ListItemIcon>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary="Register" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <MenuItem 
          disabled 
          sx={{ 
            py: 1.5,
            opacity: 0.8 
          }}
        >
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <Typography color="text.primary">
            {user?.email}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleLogout}
          sx={{ 
            py: 1.5,
            '&:hover': {
              bgcolor: 'rgba(46, 125, 50, 0.04)'
            }
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <Typography color="primary.main">Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Header;
