import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  TipsAndUpdates as TipsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CampaignList from '../components/CampaignList';

const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleCreateCampaign = () => {
    navigate('/campaigns/create');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          mb: 4,
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h3" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
            Campaigns
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage your influencer outreach campaigns
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateCampaign}
          sx={{
            borderRadius: '12px',
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Create Campaign
        </Button>
      </Box>
      
      {/* Quick Tips Paper */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2),
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TipsIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" fontWeight={600}>
            Campaign Tips
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
          • Target micro-influencers with 5k-50k followers for better engagement rates
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
          • Use personalized messages based on influencer content to increase response rate
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          • Set clear campaign goals and track performance using the analytics dashboard
        </Typography>
      </Paper>

      {/* Campaign List */}
      <CampaignList />
    </Container>
  );
};

export default Campaigns;