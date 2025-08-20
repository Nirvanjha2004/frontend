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
  Container,
  IconButton,
  Chip,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Instagram as InstagramIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Rocket as RocketIcon,
  Add as AddIcon,
  Launch as LaunchIcon,
  Email as EmailIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // Mock data for SaaS-style metrics matching the image
  const metrics = {
    totalCampaigns: 8,
    activeCampaigns: 2,
    totalLeads: 4770,
    totalReplies: 162,
    responseRate: 3.4,
    connectedAccounts: 2,
  };

  const metricCards = [
    {
      title: 'Total Campaigns',
      value: metrics.totalCampaigns.toString(),
      subtitle: 'All time',
      icon: <CampaignIcon sx={{ fontSize: 28 }} />,
      color: '#3B82F6', // Blue
      bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      progress: 75,
    },
    {
      title: 'Active Campaigns',
      value: metrics.activeCampaigns.toString(),
      subtitle: 'Currently running',
      icon: <LaunchIcon sx={{ fontSize: 28 }} />,
      color: '#10B981', // Green
      bgGradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
      progress: 100,
    },
    {
      title: 'Total Leads',
      value: metrics.totalLeads.toString(),
      subtitle: 'Prospects reached',
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: '#8B5CF6', // Purple
      bgGradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      progress: 85,
    },
    {
      title: 'Total Replies',
      value: metrics.totalReplies.toString(),
      subtitle: 'Engagement received',
      icon: <EmailIcon sx={{ fontSize: 28 }} />,
      color: '#F59E0B', // Orange
      bgGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      progress: 60,
    },
  ];

  const recentCampaigns = [
    {
      id: 1,
      name: 'test_rds',
      status: 'Stopped',
      leads: 20,
      sent: 0,
      accepted: 0,
      replies: 0,
      created: 'Jun 23, 2025',
      color: '#EF4444'
    },
    {
      id: 2,
      name: 'test_Hrishikesh',
      status: 'Stopped',
      leads: 539,
      sent: 49,
      accepted: 0,
      replies: 0,
      created: 'Jun 24, 2025',
      color: '#EF4444'
    },
    {
      id: 3,
      name: 'Sales Heads at Pharma',
      status: 'Active',
      leads: 10,
      sent: 3,
      accepted: 1,
      replies: 0,
      created: 'Jun 24, 2025',
      color: '#10B981'
    },
    {
      id: 4,
      name: 'test_campaign',
      status: 'Paused',
      leads: 10,
      sent: 4,
      accepted: 4,
      replies: 4,
      created: 'Jul 30, 2025',
      color: '#F59E0B'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10B981';
      case 'Paused': return '#F59E0B';
      case 'Stopped': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h3" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
              Campaign Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track your outreach campaigns with powerful analytics
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/campaigns/create')}
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
            Start New Campaign
          </Button>
        </Box>
      </Box>

      {/* Metrics Cards Grid */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
          },
          gap: 3,
          mb: 4 
        }}
      >
        {metricCards.map((metric, index) => (
          <Card 
            key={index}
            elevation={0}
            sx={{ 
              background: metric.bgGradient,
              color: 'white',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 30px ${metric.color}40`,
              },
              transition: 'all 0.3s ease',
            }}
          >
              {/* Background pattern */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '60%',
                  height: '100%',
                  opacity: 0.1,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '12px',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {metric.icon}
                  </Box>
                </Box>
                
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1 }}>
                  {metric.value}
                </Typography>
                
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1, opacity: 0.9 }}>
                  {metric.title}
                </Typography>
                
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
                  {metric.subtitle}
                </Typography>

                {/* Progress indicator */}
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={metric.progress}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white',
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
        ))}
      </Box>

      {/* Campaigns Table */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h5" fontWeight={600}>
              Recent Campaigns
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your campaign performance
            </Typography>
          </Box>
          
          {/* Table Header */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
            gap: 2,
            p: 2,
            bgcolor: 'grey.50',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'text.secondary'
          }}>
            <Box>CAMPAIGN NAME</Box>
            <Box>STATUS</Box>
            <Box>LEADS</Box>
            <Box>SENT</Box>
            <Box>ACCEPTED</Box>
            <Box>REPLIES</Box>
            <Box>CREATED</Box>
            <Box>ACTIONS</Box>
          </Box>
          
          {/* Table Rows */}
          {recentCampaigns.map((campaign, index) => (
            <Box 
              key={campaign.id}
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                gap: 2,
                p: 2,
                alignItems: 'center',
                borderBottom: index < recentCampaigns.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'grey.50'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: campaign.color, mr: 2, width: 32, height: 32 }}>
                  {campaign.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" fontWeight={500}>
                  {campaign.name}
                </Typography>
              </Box>
              
              <Chip 
                label={campaign.status}
                size="small"
                sx={{
                  bgcolor: `${getStatusColor(campaign.status)}20`,
                  color: getStatusColor(campaign.status),
                  fontWeight: 500,
                  border: `1px solid ${getStatusColor(campaign.status)}40`
                }}
              />
              
              <Typography variant="body2">{campaign.leads}</Typography>
              <Typography variant="body2">{campaign.sent}</Typography>
              <Typography variant="body2">{campaign.accepted}</Typography>
              <Typography variant="body2">{campaign.replies}</Typography>
              
              <Typography variant="body2" color="text.secondary">
                {campaign.created}
              </Typography>
              
              <Box>
                <IconButton size="small" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                  <AnalyticsIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Welcome Message for New Users */}
      {metrics.totalCampaigns === 0 && (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            mt: 4
          }}
        >
          <RocketIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome to OutFlo! 🚀
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Ready to start your first influencer outreach campaign?
          </Typography>
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
        </Paper>
      )}
    </Container>
  );
};

export default Dashboard;
