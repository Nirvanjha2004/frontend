import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  Stop,
  Refresh
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { apiCall } from '../utils/api';

interface Campaign {
  discoveredInfluencers: any;
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalLeads: number;
    totalActions: number;
    completedActions: number;
    failedActions: number;
    pendingActions: number;
    scheduledActions: number;
    leadsWithActivity: number;
    assignedAccounts: number;
  };
}

interface CampaignListProps {
  onRefresh?: () => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ onRefresh }) => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/campaigns');
      
      if (response.status === 401) {
        setError('Authentication required. Please log in to view campaigns.');
        return;
      }
      
      const data = await response.json();

      console.log('Fetched campaigns:', data);

      if (data.success) {
        setCampaigns(data.data.campaigns || []);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch campaigns');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error while fetching campaigns. Please make sure the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, campaign: Campaign) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
  };

  const handleViewCampaign = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}/view`);
    handleMenuClose();
  };

  const handleEditCampaign = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}/edit`);
    handleMenuClose();
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        const response = await apiCall(`/api/campaigns/${campaignId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchCampaigns(); // Refresh the list
        } else {
          alert('Failed to delete campaign');
        }
      } catch (err) {
        alert('Error deleting campaign');
      }
    }
    handleMenuClose();
  };

  const handleCampaignAction = async (campaignId: string, action: 'start' | 'pause' | 'stop') => {
    try {
      const response = await apiCall(`/api/campaigns/${campaignId}/${action}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        fetchCampaigns(); // Refresh the list
      } else {
        alert(`Failed to ${action} campaign`);
      }
    } catch (err) {
      alert(`Error ${action}ing campaign`);
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string): 'success' | 'primary' | 'warning' | 'info' | 'error' | 'default' => {
    const colors: Record<string, 'success' | 'primary' | 'warning' | 'info' | 'error' | 'default'> = {
      active: 'success',
      running: 'success',
      completed: 'primary',
      paused: 'warning',
      draft: 'info',
      failed: 'error',
      stopped: 'default'
    };
    return colors[status] || 'default';
  };

  const formatNumber = (num: number): string => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleRefresh = () => {
    fetchCampaigns();
    if (onRefresh) onRefresh();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button onClick={handleRefresh} variant="outlined">
            Retry
          </Button>
          {error.includes('Authentication required') && (
            <Button 
              onClick={() => window.location.href = '/login'} 
              variant="contained"
            >
              Go to Login
            </Button>
          )}
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header with refresh button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Your Campaigns
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {/* Campaigns Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Leads</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                      No campaigns found. Create your first campaign to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {campaign.title || campaign.name || 'Untitled Campaign'}
                        </Typography>
                        {campaign.description && (
                          <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 200 }}>
                            {campaign.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status}
                        color={getStatusColor(campaign.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatNumber(campaign.discoveredInfluencers?.length || 0)} total
                        </Typography>
                        {/* <Typography variant="caption" color="textSecondary">
                          {campaign.stats?.leadsWithActivity || 0} active
                        </Typography> */}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatNumber(campaign.stats?.totalActions || 0)} total
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {campaign.stats?.completedActions || 0} completed
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box display="flex" gap={0.5} mb={0.5}>
                          {(campaign.stats?.completedActions || 0) > 0 && (
                            <Chip label={`${campaign.stats?.completedActions} ✓`} size="small" color="success" />
                          )}
                          {(campaign.stats?.failedActions || 0) > 0 && (
                            <Chip label={`${campaign.stats?.failedActions} ✗`} size="small" color="error" />
                          )}
                          {(campaign.stats?.pendingActions || 0) > 0 && (
                            <Chip label={`${campaign.stats?.pendingActions} ⏳`} size="small" color="warning" />
                          )}
                          {(campaign.stats?.scheduledActions || 0) > 0 && (
                            <Chip label={`${campaign.stats?.scheduledActions} 📅`} size="small" color="info" />
                          )}
                        </Box>
                        {campaign.stats?.totalActions && campaign.stats.totalActions > 0 && (
                          <Typography variant="caption" color="textSecondary">
                            {Math.round(((campaign.stats?.completedActions || 0) / campaign.stats.totalActions) * 100)}% complete
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={new Date(campaign.createdAt).toLocaleString()}>
                        <Typography variant="body2">
                          {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={new Date(campaign.updatedAt).toLocaleString()}>
                        <Typography variant="body2">
                          {formatDistanceToNow(new Date(campaign.updatedAt), { addSuffix: true })}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={() => handleViewCampaign(campaign._id)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Actions">
                        <IconButton 
                          size="small"
                          onClick={(e) => handleMenuOpen(e, campaign)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => selectedCampaign && handleViewCampaign(selectedCampaign._id)}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => selectedCampaign && handleEditCampaign(selectedCampaign._id)}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Campaign
        </MenuItem>
        {selectedCampaign?.status === 'draft' || selectedCampaign?.status === 'paused' ? (
          <MenuItem onClick={() => selectedCampaign && handleCampaignAction(selectedCampaign._id, 'start')}>
            <PlayArrow fontSize="small" sx={{ mr: 1 }} />
            Start Campaign
          </MenuItem>
        ) : selectedCampaign?.status === 'active' || selectedCampaign?.status === 'running' ? (
          <MenuItem onClick={() => selectedCampaign && handleCampaignAction(selectedCampaign._id, 'pause')}>
            <Pause fontSize="small" sx={{ mr: 1 }} />
            Pause Campaign
          </MenuItem>
        ) : null}
        {(selectedCampaign?.status === 'active' || selectedCampaign?.status === 'running' || selectedCampaign?.status === 'paused') && (
          <MenuItem onClick={() => selectedCampaign && handleCampaignAction(selectedCampaign._id, 'stop')}>
            <Stop fontSize="small" sx={{ mr: 1 }} />
            Stop Campaign
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => selectedCampaign && handleDeleteCampaign(selectedCampaign._id)}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Campaign
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CampaignList;
