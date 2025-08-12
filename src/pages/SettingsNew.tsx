import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Instagram as InstagramIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../hooks/redux';

const Settings: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // Mock Instagram accounts data
  const instagramAccounts = [
    {
      id: '1',
      username: 'brandaccount1',
      displayName: 'Brand Account 1',
      followers: 15420,
      isVerified: true,
      isActive: true,
      profilePicture: '',
    },
    {
      id: '2',
      username: 'brandaccount2',
      displayName: 'Brand Account 2',
      followers: 8930,
      isVerified: false,
      isActive: false,
      profilePicture: '',
    },
  ];

  const handleEditAccount = (account: any) => {
    setSelectedAccount(account);
    setOpenAccountDialog(true);
  };

  const handleDeleteAccount = (accountId: string) => {
    console.log('Delete account:', accountId);
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Manage your account settings and preferences
      </Typography>

      <Box display="flex" flexDirection="column" gap={3}>
        {/* Profile and Notification Settings Row */}
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          {/* Profile Settings */}
          <Box flex={1}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Profile Information
                </Typography>
                <Box component="form" sx={{ mt: 2 }}>
                  <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={2}>
                    <TextField
                      fullWidth
                      label="First Name"
                      defaultValue={user?.firstName || ''}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      defaultValue={user?.lastName || ''}
                      margin="normal"
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Email"
                    defaultValue={user?.email || ''}
                    margin="normal"
                    disabled
                  />
                  <TextField
                    fullWidth
                    label="Company"
                    defaultValue=""
                    margin="normal"
                  />
                  <Box mt={3}>
                    <Button variant="contained" sx={{ mr: 2 }}>
                      Save Changes
                    </Button>
                    <Button variant="outlined">Cancel</Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Notification Settings */}
          <Box flex={1}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Notification Preferences
                </Typography>
                <Box mt={2} display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Email Notifications"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Receive campaign updates via email
                    </Typography>
                  </Box>

                  <Box>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Push Notifications"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Get real-time notifications in browser
                    </Typography>
                  </Box>

                  <Box>
                    <FormControlLabel
                      control={<Switch />}
                      label="SMS Notifications"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Receive important alerts via SMS
                    </Typography>
                  </Box>

                  <Box>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Marketing Emails"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Stay updated with product news and tips
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Instagram Accounts */}
        <Box>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Connected Instagram Accounts
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAccountDialog(true)}
                >
                  Add Account
                </Button>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                Connect your Instagram accounts to use them for campaign outreach. 
                Make sure you have the necessary permissions for business use.
              </Alert>

              <List>
                {instagramAccounts.map((account) => (
                  <ListItem
                    key={account.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1,
                    }}
                  >
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <InstagramIcon />
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            @{account.username}
                          </Typography>
                          {account.isVerified && (
                            <VerifiedIcon color="primary" fontSize="small" />
                          )}
                          <Chip
                            label={account.isActive ? 'Active' : 'Inactive'}
                            color={account.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {account.displayName} • {account.followers.toLocaleString()} followers
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => handleEditAccount(account)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteAccount(account.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Security and API Settings Row */}
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          {/* Security Settings */}
          <Box flex={1}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Security
                </Typography>
                <Box mt={2} display="flex" flexDirection="column" gap={2}>
                  <Button variant="outlined" fullWidth>
                    Change Password
                  </Button>
                  <Button variant="outlined" fullWidth>
                    Two-Factor Authentication
                  </Button>
                  <Button variant="outlined" fullWidth>
                    Download Data
                  </Button>
                  <Divider />
                  <Button variant="outlined" color="error" fullWidth>
                    Delete Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* API Settings */}
          <Box flex={1}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  API & Integrations
                </Typography>
                <Box mt={2}>
                  <TextField
                    fullWidth
                    label="API Key"
                    defaultValue="sk-1234567890abcdef"
                    InputProps={{
                      readOnly: true,
                    }}
                    margin="normal"
                    helperText="Use this key to integrate with external applications"
                  />
                  <Box mt={2} display="flex" gap={2}>
                    <Button variant="outlined">
                      Regenerate API Key
                    </Button>
                    <Button variant="outlined">
                      View Documentation
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Add/Edit Account Dialog */}
      <Dialog
        open={openAccountDialog}
        onClose={() => setOpenAccountDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedAccount ? 'Edit Instagram Account' : 'Add Instagram Account'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            To connect your Instagram account, you'll need to authorize our application 
            through Instagram's official OAuth flow.
          </Alert>
          <TextField
            fullWidth
            label="Instagram Username"
            margin="normal"
            defaultValue={selectedAccount?.username || ''}
          />
          <FormControlLabel
            control={<Switch defaultChecked={selectedAccount?.isActive ?? true} />}
            label="Use for campaigns"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAccountDialog(false)}>Cancel</Button>
          <Button variant="contained">
            {selectedAccount ? 'Update' : 'Connect Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
