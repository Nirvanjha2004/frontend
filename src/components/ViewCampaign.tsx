import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack
} from '@mui/icons-material';
import CreateCampaign from '../pages/CreateCampaign';
import { apiCall } from '../utils/api';

const ViewCampaign: React.FC = () => {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState<string>('Campaign Details');
  const [loading, setLoading] = useState(true);

  const handleGoBack = () => {
    navigate('/campaigns');
  };

  useEffect(() => {
    const fetchCampaignName = async () => {
      if (!campaignId) return;
      
      try {
        const response = await apiCall(`/api/campaigns/${campaignId}`);
        const data = await response.json();
        
        if (data.success && data.data.campaign) {
          setCampaignName(data.data.campaign.title || data.data.campaign.name || 'Campaign Details');
        }
      } catch (error) {
        console.error('Error fetching campaign name:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignName();
  }, [campaignId]);

  if (!campaignId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Campaign ID not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with navigation */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton 
            onClick={handleGoBack}
            sx={{ mr: 1 }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : campaignName}
            </Typography>
          </Box>
        </Box>
        
        <Breadcrumbs>
          <Link 
            color="inherit" 
            href="/campaigns"
            onClick={(e) => {
              e.preventDefault();
              navigate('/campaigns');
            }}
            sx={{ cursor: 'pointer' }}
          >
            Campaigns
          </Link>
          <Typography color="text.primary">{campaignName}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Campaign content */}
      <CreateCampaign 
        viewMode={true}
        campaignId={campaignId}
        onClose={handleGoBack}
      />
    </Box>
  );
};

export default ViewCampaign;
