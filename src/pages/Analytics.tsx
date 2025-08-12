import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import {
  Campaign,
  ThumbUp,
  Message,
  Visibility,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data
const engagementData = [
  { month: 'Jan', engagement: 4.2, followers: 1200 },
  { month: 'Feb', engagement: 5.1, followers: 1350 },
  { month: 'Mar', engagement: 4.8, followers: 1450 },
  { month: 'Apr', engagement: 6.2, followers: 1600 },
  { month: 'May', engagement: 5.9, followers: 1750 },
  { month: 'Jun', engagement: 7.1, followers: 1900 },
];

const campaignPerformance = [
  { name: 'Fashion Week', reach: 45000, engagement: 6.2, conversions: 120 },
  { name: 'Summer Sale', reach: 32000, engagement: 4.8, conversions: 89 },
  { name: 'Brand Launch', reach: 28000, engagement: 8.1, conversions: 156 },
  { name: 'Holiday Special', reach: 51000, engagement: 5.4, conversions: 98 },
];

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('6months');

  const stats = [
    {
      title: 'Total Reach',
      value: '2.4M',
      change: '+12.5%',
      icon: <Visibility />,
      color: 'primary.main',
    },
    {
      title: 'Engagement Rate',
      value: '5.8%',
      change: '+0.8%',
      icon: <ThumbUp />,
      color: 'success.main',
    },
    {
      title: 'Active Campaigns',
      value: '12',
      change: '+3',
      icon: <Campaign />,
      color: 'info.main',
    },
    {
      title: 'Avg. Response Rate',
      value: '28%',
      change: '+5.2%',
      icon: <Message />,
      color: 'warning.main',
    },
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your campaign performance and engagement metrics
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1month">Last Month</MenuItem>
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined">Export Report</Button>
        </Box>
      </Box>

      {/* Stats Cards */}
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
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={stat.change.startsWith('+') ? 'success.main' : 'error.main'}
                  >
                    {stat.change} from last period
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: stat.color,
                    color: 'white',
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Charts */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '2fr 1fr'
          },
          gap: 3,
          mb: 4
        }}
      >
        {/* Engagement Trend */}
        <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Engagement Trend
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#667eea"
                      strokeWidth={2}
                      name="Engagement Rate (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="followers"
                      stroke="#764ba2"
                      strokeWidth={2}
                      name="Followers Gained"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

        {/* Top Performing Hashtags */}
        <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top Hashtags
              </Typography>
              <Box>
                {['#fashion', '#lifestyle', '#beauty', '#travel', '#fitness'].map((hashtag, index) => (
                  <Box
                    key={hashtag}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={1}
                    borderBottom={index < 4 ? 1 : 0}
                    borderColor="divider"
                  >
                    <Typography variant="body2">{hashtag}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.floor(Math.random() * 1000) + 500} posts
                    </Typography>
                  </Box>
                ))}
            </Box>
          </CardContent>
        </Card>
      </Box>      {/* Campaign Performance */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Campaign Performance
          </Typography>
          <Box height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reach" fill="#667eea" name="Reach" />
                <Bar dataKey="conversions" fill="#764ba2" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Analytics;
