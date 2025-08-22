import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
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
  Avatar,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  FilterList as FilterIcon,
  SortByAlpha as SortIcon,
  Add,
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
  const theme = useTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);


  function handleRefresh(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    setError(null);
    setLoading(true);
    fetchCampaigns();
    if (onRefresh) onRefresh();
  }
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

  const handleCampaignAction = async (campaignId: string, action: 'start' | 'pause' | 'stop' | 'resume') => {
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

  const getStatusColorHex = (status: string): string => {
    const colors: Record<string, string> = {
      active: theme.palette.success.main,
      running: theme.palette.success.main,
      completed: theme.palette.primary.main,
      paused: theme.palette.warning.main,
      draft: theme.palette.info.main,
      failed: theme.palette.error.main,
      stopped: theme.palette.grey[500]
    };
    return colors[status] || theme.palette.grey[500];
  };

  const getProgressPercentage = (campaign: Campaign): number => {
    const total = campaign.stats?.totalActions || 0;
    const completed = campaign.stats?.completedActions || 0;

    if (total === 0) return 0;
    return Math.min(Math.round((completed / total) * 100), 100);
  };

  const getProgressColor = (campaign: Campaign): string => {
    const percentage = getProgressPercentage(campaign);

    if (percentage >= 80) return theme.palette.success.main;
    if (percentage >= 50) return theme.palette.primary.main;
    if (percentage >= 25) return theme.palette.warning.main;
    return theme.palette.info.main;
  };

  const formatDate = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };

  const getCampaignActionButton = (campaign: Campaign) => {
    switch (campaign.status) {
      case 'active':
      case 'running':
        return (
          <>
            <Tooltip title="Pause Campaign">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCampaignAction(campaign._id, 'pause');
                }}
                sx={{ color: theme.palette.warning.main }}
              >
                <Pause fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Stop Campaign">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCampaignAction(campaign._id, 'stop');
                }}
                sx={{ color: theme.palette.error.main }}
              >
                <Stop fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        );
      case 'paused':
        return (
          <>
            <Tooltip title="Resume Campaign">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCampaignAction(campaign._id, 'resume');
                }}
                sx={{ color: theme.palette.success.main }}
              >
                <PlayArrow fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Stop Campaign">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCampaignAction(campaign._id, 'stop');
                }}
                sx={{ color: theme.palette.error.main }}
              >
                <Stop fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        );
      default:
        return (
          <Tooltip title="Start Campaign">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleCampaignAction(campaign._id, 'start');
              }}
              sx={{ color: theme.palette.success.main }}
            >
              <PlayArrow fontSize="small" />
            </IconButton>
          </Tooltip>
        );
    }
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
      {/* Header with actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            Your Campaigns
          </Typography>
          <Chip
            label={`${campaigns.length} total`}
            size="small"
            sx={{
              background: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 500,
              px: 1
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<FilterIcon />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<SortIcon />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Sort
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Campaigns Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: theme.palette.divider
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, py: 2.5 }}>Campaign</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2.5 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2.5 }}>Leads</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2.5 }}>Actions</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2.5 }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2.5 }}>Created</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, py: 2.5 }}>Manage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" color="text.secondary" fontWeight={500}>
                        No campaigns found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Create your first campaign to start reaching out to influencers
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => navigate('/campaigns/create')}
                        startIcon={<Add />}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 500,
                          px: 3
                        }}
                      >
                        Create Campaign
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow
                    key={campaign._id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        cursor: 'pointer'
                      },
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => navigate(`/campaigns/${campaign._id}/view`)}
                  >
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
