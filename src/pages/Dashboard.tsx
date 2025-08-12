import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Paper,
  Divider,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Instagram as InstagramIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // Mock data for SaaS-style metrics
  const metrics = {
    totalCampaigns: 8,
    activeCampaigns: 3,
    totalFollowers: 245000,
    engagement: 8.7,
    monthlyGrowth: 23.5,
    connectedAccounts: 2,
  };

  const recentActivity = [
    {
      id: 1,
      type: 'campaign',
      title: 'Fashion Influencer Campaign launched',
      time: '2 hours ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'account',
      title: 'New Instagram account connected',
      time: '5 hours ago',
      status: 'info',
    },
    {
      id: 3,
      type: 'engagement',
      title: 'Reached 1000 new followers',
      time: '1 day ago',
      status: 'success',
    },
  ];

  const quickActions = [
    {
      title: 'Create Campaign',
      description: 'Start a new influencer outreach campaign',
      icon: <CampaignIcon sx={{ fontSize: 32 }} />,
      color: 'primary.main',
      action: () => navigate('/campaigns/create'),
    },
    {
      title: 'Connect Account',
      description: 'Add another Instagram account',
      icon: <InstagramIcon sx={{ fontSize: 32 }} />,
      color: 'secondary.main',
      action: () => navigate('/accounts'),
    },
    {
      title: 'View Analytics',
      description: 'Check your performance metrics',
      icon: <TimelineIcon sx={{ fontSize: 32 }} />,
      color: 'success.main',
      action: () => navigate('/campaigns'),
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Welcome back, {user?.firstName || 'User'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Here's what's happening with your influencer outreach campaigns today.
        </Typography>
      </Box>

      {/* Key Metrics Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <CampaignIcon sx={{ fontSize: 32, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={700}>
                {metrics.totalCampaigns}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total Campaigns
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {metrics.activeCampaigns} active
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <PeopleIcon sx={{ fontSize: 32, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={700}>
                {formatNumber(metrics.totalFollowers)}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total Reach
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              +{metrics.monthlyGrowth}% this month
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 32, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={700}>
                {metrics.engagement}%
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Avg Engagement
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Above industry avg
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <InstagramIcon sx={{ fontSize: 32, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={700}>
                {metrics.connectedAccounts}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Connected Accounts
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              All active
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
        gap: 4 
      }}>
        {/* Quick Actions */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Get started with these common tasks
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, 
              gap: 2 
            }}>
              {quickActions.map((action, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: action.color,
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                  onClick={action.action}
                >
                  <Box sx={{ color: action.color, mb: 2 }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Latest updates from your campaigns
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentActivity.map((activity, index) => (
                <Box key={activity.id}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: activity.status === 'success' ? 'success.main' : 'primary.main',
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {activity.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                  {index < recentActivity.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Box>
            
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 3 }}
              onClick={() => navigate('/campaigns')}
            >
              View All Campaigns
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Getting Started Section for New Users */}
      {metrics.totalCampaigns === 0 && (
        <Card sx={{ mt: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <RocketIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Ready to launch your first campaign?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Connect your Instagram accounts and start reaching out to influencers in your niche.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<InstagramIcon />}
                onClick={() => navigate('/accounts')}
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                Connect Account
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<CampaignIcon />}
                onClick={() => navigate('/campaigns/create')}
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Create Campaign
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Dashboard;
