import React from 'react';
import {
  Box,
  Drawer,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Campaign as CampaignIcon,
  Instagram as InstagramIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../store/authSlice';
import { toggleSidebar } from '../store/uiSlice';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const menuItems = [
    { text: 'Messages', icon: <ChatIcon />, path: '/messages' },
    { text: 'Campaigns', icon: <CampaignIcon />, path: '/campaigns' },
    { text: 'Accounts', icon: <InstagramIcon />, path: '/accounts' },
  ];

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleProfileMenuClose();
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: sidebarOpen ? drawerWidth : 0 }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="persistent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: '#1a1f36', // Flat dark blue color similar to screenshot
              color: 'white',
              borderRight: 'none',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
              borderRadius: '0px',
            },
          }}
          open={sidebarOpen}
        >
          <Toolbar sx={{ 
            px: 3, 
            py: 2.5, 
            minHeight: '70px !important', 
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: '#7582eb',
                  width: 36,
                  height: 36,
                  fontSize: '1.1rem',
                  fontWeight: 700
                }}
              >
                OM
              </Avatar>
              <Box>
                <Typography 
                  variant="h5" 
                  noWrap 
                  component="div" 
                  sx={{
                    color: 'white',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.1,
                    fontSize: '1.4rem'
                  }}
                >
                  OutFlo
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    letterSpacing: '0.02em'
                  }}
                >
                  Outreach Platform
                </Typography>
              </Box>
            </Box>
          </Toolbar>
          
          {/* Menu Items */}
          <List sx={{ px: 0, pt: 2, flexGrow: 1 }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: '0px',
                    py: 1.5,
                    px: 2,
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(255,255,255,0.08)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        height: '100%',
                        bgcolor: '#7582eb',
                      }
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path 
                        ? 'linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)' 
                        : 'rgba(255,255,255,0.8)',
                      minWidth: 36,
                      mr: 2.5,
                      fontSize: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path ? 600 : 500,
                      fontSize: '0.95rem',
                      letterSpacing: '0.01em',
                      color: location.pathname === item.path ? 'white' : 'rgba(255,255,255,0.9)'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Profile Section at Bottom */}
          <Box sx={{ mt: 'auto', p: 1, pb: 2 }}>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
            <Box
              onClick={handleProfileMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderRadius: '0px',
                cursor: 'pointer',
                background: 'transparent',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  background: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              <Avatar 
                alt={user?.firstName} 
                src={user?.avatar}
                sx={{ 
                  width: 36, 
                  height: 36,
                  fontSize: '1rem',
                  fontWeight: 600,
                  bgcolor: '#7582eb',
                  mr: 2
                }}
              >
                {user?.firstName?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body1" fontWeight={600} noWrap sx={{ color: 'white', mb: 0.5 }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" noWrap sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  <Box 
                    component="span" 
                    sx={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '0px', 
                      bgcolor: '#4CAF50',
                      display: 'inline-block'
                    }} 
                  />
                  Active Account
                </Typography>
              </Box>
            </Box>
          </Box>
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          transition: 'width 0.3s ease, margin 0.3s ease',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
        }}
      >
        {/* Toggle Button */}
        <Box sx={{ position: 'fixed', top: 15, left: sidebarOpen ? 260 : 15, zIndex: 1100, transition: 'left 0.3s ease' }}>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={handleToggleSidebar}
            sx={{ 
              p: 1,
              borderRadius: '0px',
              backgroundColor: 'white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(0,0,0,0.05)',
              '&:hover': {
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }
            }}
          >
            <MenuIcon sx={{ color: '#333' }} />
          </IconButton>
        </Box>
        
        <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, pt: { xs: 6, sm: 7 } }}>
          {children}
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 1,
            mt: 1,
            minWidth: 200,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid',
            borderColor: 'rgba(0,0,0,0.08)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ 
          px: 3, 
          py: 2.5, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(94, 114, 228, 0.05) 0%, rgba(130, 94, 228, 0.05) 100%)',
        }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            {user?.email}
          </Typography>
        </Box>
        <MenuItem 
          onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}
          sx={{ py: 2, px: 3, gap: 2, fontSize: '0.9rem' }}
        >
          <AccountIcon color="primary" sx={{ fontSize: '1.25rem' }} />
          <Typography variant="body2" fontWeight={500}>Profile Settings</Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => { navigate('/accounts'); handleProfileMenuClose(); }}
          sx={{ py: 2, px: 3, gap: 2, fontSize: '0.9rem' }}
        >
          <InstagramIcon sx={{ color: '#C13584', fontSize: '1.25rem' }} />
          <Typography variant="body2" fontWeight={500}>Instagram Accounts</Typography>
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem 
          onClick={handleLogout}
          sx={{ 
            py: 2, 
            px: 3, 
            gap: 2,
            color: 'error.main',
            borderTop: '1px solid',
            borderColor: 'rgba(0,0,0,0.05)',
            mt: 1,
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.contrastText'
            }
          }}
        >
          <LogoutIcon sx={{ fontSize: '1.25rem' }} />
          <Typography variant="body2" fontWeight={600}>Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;
