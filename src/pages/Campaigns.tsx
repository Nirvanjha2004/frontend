import React from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CampaignList from '../components/CampaignList';

const Campaigns: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateCampaign = () => {
    navigate('/campaigns/create');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Campaigns
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your influencer outreach campaigns
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateCampaign}
          size="large"
        >
          Create Campaign
        </Button>
      </Box>

      {/* Campaign List */}
      <CampaignList />
    </Box>
  );
};

export default Campaigns;