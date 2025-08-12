import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Grid,
  Badge,
} from '@mui/material';
import {
  Instagram as InstagramIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Cookie as CookieIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import axios from 'axios';

// Updated interface for Instagram accounts from new API
interface InstagramAccount {
  id: string;
  username: string;
  userId: string;
  workspaceEmail: string;
  profilePicture: string;
  fullName: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  mediaCount: number;
  isVerified: boolean;
  isPrivate: boolean;
  isActive: boolean;
  connectionSource: 'extension' | 'manual' | 'oauth';
  authStatus: 'valid' | 'invalid' | 'expired' | 'unknown';
  lastAuthCheck: string | null;
  connectedAt: string;
  lastUsed: string | null;
  lastUpdated: string;
  hasCookies: boolean;
  hasHeaders: boolean;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAccountData, setNewAccountData] = useState({
    username: '',
    accessToken: '',
  });

  // Get user email from Redux state (assuming it's stored there)
  const user = useAppSelector((state) => state.auth?.user);
  const userEmail = user?.email || 'test@example.com'; // Fallback for testing

  useEffect(() => {
    fetchAccounts();
  }, [userEmail]);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/instagram/accounts/all`, {
        params: {
          workspaceEmail: userEmail
        }
      });

      if (response.data.success) {
        setAccounts(response.data.data.accounts);
      } else {
        setError(response.data.message || 'Failed to fetch accounts');
      }
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      setError(error.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAccounts = async () => {
    setIsRefreshing(true);
    await fetchAccounts();
    setIsRefreshing(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (authStatus: string) => {
    switch (authStatus) {
      case 'valid': return 'success';
      case 'invalid': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (authStatus: string) => {
    switch (authStatus) {
      case 'valid': return 'Connected';
      case 'invalid': return 'Invalid';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  const handleConnectAccount = async () => {
    setIsLoading(true);
    // This would integrate with the Chrome extension or manual connection
    // For now, we'll just show a message
    setTimeout(() => {
      setConnectDialogOpen(false);
      setNewAccountData({ username: '', accessToken: '' });
      setIsLoading(false);
      // Refresh accounts after connection
      fetchAccounts();
    }, 2000);
  };

  const handleToggleStatus = async (accountId: string) => {
    // This would call an API to toggle account status
    setAccounts(accounts.map(account => 
      account.id === accountId 
        ? { ...account, isActive: !account.isActive }
        : account
    ));
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<InstagramAccount | null>(null);

  const handleDeleteAccount = async (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      setAccountToDelete(account);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      setIsLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/instagram/accounts/${accountToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }

      // Remove the account from the local state
      setAccounts(accounts.filter(account => account.id !== accountToDelete.id));
      
      // Show success message
      setError('');
      // You could add a success notification here
      
    } catch (error) {
      console.error('Delete account error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const EmptyState = () => (
    <Paper
      elevation={0}
      sx={{
        p: 8,
        textAlign: 'center',
        bgcolor: 'background.paper',
        border: '2px dashed',
        borderColor: 'grey.300',
        borderRadius: 3,
      }}
    >
      <Box sx={{ mb: 4 }}>
        <InstagramIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
        <Typography variant="h4" gutterBottom color="text.primary">
          Connect Your Instagram Accounts
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
          Start your influencer outreach journey by connecting your Instagram accounts. 
          Manage multiple accounts, automate interactions, and grow your network effectively.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Multi-Account Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connect and manage multiple Instagram accounts from one dashboard
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Automated Growth
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Automate follows, messages, and engagement to grow your audience
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <VisibilityIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Real-time Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track performance and optimize your outreach strategies
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        size="large"
        startIcon={<AddIcon />}
        onClick={() => setConnectDialogOpen(true)}
        sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
      >
        Connect Your First Account
      </Button>
    </Paper>
  );

  const AccountCard = ({ account }: { account: InstagramAccount }) => (
    <Card
      sx={{
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge
              badgeContent={
                account.connectionSource === 'extension' ? (
                  <SecurityIcon sx={{ fontSize: 12 }} />
                ) : null
              }
              color="primary"
            >
              <Avatar
                src={account.profilePicture}
                sx={{ width: 56, height: 56 }}
              >
                {account.username.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  @{account.username}
                </Typography>
                {account.isVerified && (
                  <CheckCircleIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                )}
              </Box>
              <Chip
                icon={account.authStatus === 'valid' ? <CheckCircleIcon /> : <ErrorIcon />}
                label={getStatusText(account.authStatus)}
                color={getStatusColor(account.authStatus) as any}
                size="small"
                sx={{ mt: 0.5 }}
              />
              {account.fullName && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {account.fullName}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Authentication Status */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<CookieIcon />}
            label={account.hasCookies ? 'Cookies ✓' : 'No Cookies'}
            size="small"
            color={account.hasCookies ? 'success' : 'default'}
            variant={account.hasCookies ? 'filled' : 'outlined'}
          />
          <Chip
            icon={<SecurityIcon />}
            label={account.hasHeaders ? 'Headers ✓' : 'No Headers'}
            size="small"
            color={account.hasHeaders ? 'success' : 'default'}
            variant={account.hasHeaders ? 'filled' : 'outlined'}
          />
          <Chip
            label={account.connectionSource.toUpperCase()}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main" fontWeight={600}>
              {formatNumber(account.followersCount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Followers
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main" fontWeight={600}>
              {formatNumber(account.followingCount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Following
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main" fontWeight={600}>
              {formatNumber(account.mediaCount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Posts
            </Typography>
          </Box>
        </Box>

        {/* Additional Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Connected: {new Date(account.connectedAt).toLocaleDateString()}
          </Typography>
          {account.lastAuthCheck && (
            <Typography variant="caption" color="text.secondary" display="block">
              Last Check: {new Date(account.lastAuthCheck).toLocaleDateString()}
            </Typography>
          )}
          {account.lastUsed && (
            <Typography variant="caption" color="text.secondary" display="block">
              Last Used: {new Date(account.lastUsed).toLocaleDateString()}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {account.isPrivate ? 'Private Account' : 'Public Account'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant={account.isActive ? 'contained' : 'outlined'}
              color={account.isActive ? 'success' : 'primary'}
              onClick={() => handleToggleStatus(account.id)}
            >
              {account.isActive ? 'Active' : 'Inactive'}
            </Button>
            <IconButton size="small" color="error" onClick={() => handleDeleteAccount(account.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Instagram Accounts
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your connected Instagram accounts and monitor their performance
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshAccounts}
              disabled={isRefreshing}
              sx={{ px: 3 }}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            {accounts.length > 0 && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setConnectDialogOpen(true)}
                sx={{ px: 3 }}
              >
                Connect Account
              </Button>
            )}
          </Box>
        </Box>

        {/* Stats Overview */}
        {accounts.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight={600} color="primary.main">
                    {accounts.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Accounts
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {accounts.filter(acc => acc.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Accounts
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight={600} color="secondary.main">
                    {formatNumber(accounts.reduce((sum, acc) => sum + acc.followersCount, 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Followers
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <InstagramIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight={600} color="error.main">
                    {accounts.filter(acc => acc.authStatus === 'valid').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valid Auth
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && accounts.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Content */}
      {!isLoading && accounts.length === 0 && !error ? (
        <EmptyState />
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)' 
          }, 
          gap: 3 
        }}>
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </Box>
      )}

      {/* Connect Account Dialog */}
      <Dialog
        open={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InstagramIcon color="primary" />
            <Typography variant="h6">Connect Instagram Account</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              To connect your Instagram account, please use our Chrome extension:
            </Typography>
            <Typography variant="body2" component="ol" sx={{ pl: 2, mb: 2 }}>
              <li>Install the InstaMessage Chrome Extension</li>
              <li>Open Instagram in a new tab and log in</li>
              <li>Click the extension icon and enter your workspace email</li>
              <li>Click "Connect Account" to link your Instagram account</li>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The extension will securely capture your authentication data and connect it to your workspace.
            </Typography>
          </Alert>
          
          <Box sx={{ 
            textAlign: 'center', 
            py: 3,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}>
            <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
              Chrome Extension Required
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manual account connection is not available. Please use the Chrome extension for secure authentication.
            </Typography>
            <Button
              variant="outlined"
              href="chrome://extensions/"
              target="_blank"
              startIcon={<InstagramIcon />}
            >
              Manage Extensions
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setConnectDialogOpen(false)} variant="contained">
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorIcon color="error" />
            <Typography variant="h6">Delete Instagram Account</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>This action will remove the account connection and clear all authentication data:</strong>
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 1 }}>
              <li>Cookies and session data will be cleared</li>
              <li>API access will be revoked</li>
              <li>Account will be deactivated</li>
              <li>Workspace association will be removed</li>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The account record will be kept for audit purposes but all sensitive data will be permanently removed.
            </Typography>
          </Alert>
          
          {accountToDelete && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}>
              <Avatar
                src={accountToDelete.profilePicture}
                sx={{ width: 64, height: 64, mx: 'auto', mb: 2 }}
              >
                {accountToDelete.username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ mb: 1 }}>
                @{accountToDelete.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {accountToDelete.fullName}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteAccount}
            variant="contained"
            color="error"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {isLoading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accounts;
