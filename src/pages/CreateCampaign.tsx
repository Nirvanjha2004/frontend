import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Slider,
  FormControlLabel,
  Switch,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Container,
  Badge,
  Avatar,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Instagram as InstagramIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  CloudUpload as CloudUploadIcon,
  FileDownload as FileDownloadIcon,
  Campaign as CampaignIcon,
  Launch as LaunchIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Upload as UploadIcon,
  Message as MessageIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createCampaign, updateCampaign, fetchCampaign } from '../store/campaignSlice';
import { csvUploadAPI, instagramAPI } from '../services/api';
import { apiCall } from '../utils/api';

const steps = [
  'Basic Information & Creator Upload',
  'Message Sequence',
  'Sender Accounts',
  'Scheduling & Settings',
  'Review & Launch'
];

interface CampaignFormData {
  name: string;
  description: string;
  csvFile: File | null;
  csvUsernames: string[];
  csvPreview: string[];
  csvUserDetails?: any[];
  selectedCreators?: any[];
  filters: {
    followerRange: { min: number; max: number };
    engagementRate: { min: number; max: number };
    location: string[];
    categories: string[];
    verifiedOnly: boolean;
    privateAccountsOnly: boolean;
  };
  messageSequence: Array<{
    stepNumber: number;
    messageType: 'follow' | 'message' | 'unfollow';
    content?: string;
    delayHours: number;
    isActive: boolean;
  }>;
  senderAccounts: Array<{
    username: string;
    userId: string;
    isActive: boolean;
  }>;
  operationalHours: {
    start: string;
    end: string;
    timezone: string;
    weekDays: number[];
  };
  settings: {
    maxDailyFollows: number;
    maxDailyMessages: number;
    followUpDelay: number;
    randomizeDelay: boolean;
    delayVariation: number;
  };
}

interface CreateCampaignProps {
  viewMode?: boolean;
  campaignId?: string;
  campaignData?: any;
  onClose?: () => void;
}

const CreateCampaign: React.FC<CreateCampaignProps> = ({ 
  viewMode = false, 
  campaignId,
  campaignData: propCampaignData,
  onClose 
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.campaigns);
  const { user } = useAppSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    csvFile: null,
    csvUsernames: [],
    csvPreview: [],
    csvUserDetails: [],
    selectedCreators: [],
    filters: {
      followerRange: { min: 1000, max: 100000 },
      engagementRate: { min: 1, max: 10 },
      location: [],
      categories: [],
      verifiedOnly: false,
      privateAccountsOnly: false,
    },
    messageSequence: [
      {
        stepNumber: 1,
        messageType: 'follow',
        delayHours: 0,
        isActive: true,
      },
      {
        stepNumber: 2,
        messageType: 'message',
        content: 'Hi! I love your content and would love to collaborate. Check out our brand!',
        delayHours: 72,
        isActive: true,
      },
    ],
    senderAccounts: [],
    operationalHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC',
      weekDays: [1, 2, 3, 4, 5],
    },
    settings: {
      maxDailyFollows: 50,
      maxDailyMessages: 20,
      followUpDelay: 48,
      randomizeDelay: true,
      delayVariation: 30,
    },
  });

  const [csvUploadError, setCsvUploadError] = useState<string>('');
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [selectedCreators, setSelectedCreators] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [instagramAccountsLoading, setInstagramAccountsLoading] = useState(false);
  const [instagramAccountsError, setInstagramAccountsError] = useState<string>('');
  const [localCampaignData, setLocalCampaignData] = useState<any>(null);
  const [loading, setLoading] = useState(viewMode && !propCampaignData);

  // Restore selected creators when activeStep changes back to 0
  useEffect(() => {
    if (activeStep === 0 && formData.selectedCreators && formData.selectedCreators.length > 0) {
      const selectedUsernames = new Set(formData.selectedCreators.map(creator => creator.username));
      setSelectedCreators(selectedUsernames);
    }
  }, [activeStep, formData.selectedCreators]);

  // Remove the old useEffect that fetches campaign data
  // Replace with this new one that handles both prop data and API fetching
  useEffect(() => {
    const initializeCampaignData = async () => {
      if (viewMode) {
        // In view mode, use prop data if available, otherwise fetch
        if (propCampaignData) {
          setLocalCampaignData(propCampaignData);
          setLoading(false);
        } else if (campaignId) {
          try {
            setLoading(true);
            const response = await apiCall(`/api/campaigns/${campaignId}`);
            const data = await response.json();
            
            if (data.success && data.data.campaign) {
              setLocalCampaignData(data.data.campaign);
            }
          } catch (error) {
            console.error('Error fetching campaign data:', error);
          } finally {
            setLoading(false);
          }
        }
      } else if (id && id !== 'create') {
        // Edit mode - use Redux
        dispatch(fetchCampaign(id));
      }
    };

    initializeCampaignData();
  }, [viewMode, propCampaignData, campaignId, id, dispatch]);

  // Map API response to form data when campaign data is available
  useEffect(() => {
    if (localCampaignData && viewMode) {
      const campaign = localCampaignData;
      
      // Map the API response structure to form data
      setFormData(prev => ({
        ...prev,
        name: campaign.name || '',
        description: campaign.description || '',
        csvUsernames: campaign.selectedInfluencers?.map((inf: any) => inf.username) || [],
        csvUserDetails: campaign.selectedInfluencers || [],
        selectedCreators: campaign.selectedInfluencers || [],
        filters: {
          followerRange: campaign.filters?.followerRange || { min: 1000, max: 100000 },
          engagementRate: campaign.filters?.engagementRate || { min: 1, max: 10 },
          location: campaign.filters?.location || [],
          categories: campaign.filters?.categories || [],
          verifiedOnly: campaign.filters?.verifiedOnly || false,
          privateAccountsOnly: campaign.filters?.privateAccountsOnly || false,
        },
        messageSequence: campaign.messageSequence || prev.messageSequence,
        senderAccounts: campaign.senderAccounts || [],
        operationalHours: campaign.operationalHours || prev.operationalHours,
        settings: {
          maxDailyFollows: campaign.settings?.maxDailyFollows || campaign.daily_outreach_limit || 50,
          maxDailyMessages: campaign.settings?.maxDailyMessages || 20,
          followUpDelay: campaign.settings?.followUpDelay || 48,
          randomizeDelay: campaign.settings?.randomizeDelay || true,
          delayVariation: campaign.settings?.delayVariation || 30,
        },
      }));

      // Set selected creators for the UI
      if (campaign.selectedInfluencers) {
        const selectedUsernames = new Set(campaign.selectedInfluencers.map((inf: any) => inf.username));
        //@ts-ignore
        setSelectedCreators(selectedUsernames);
      }
    }
  }, [localCampaignData, viewMode]);

  // Fetch Instagram accounts for workspace
  const fetchInstagramAccounts = async () => {
    if (!user?.email) return;

    setInstagramAccountsLoading(true);
    setInstagramAccountsError('');

    try {
      const response = await instagramAPI.getWorkspaceAccounts(user.email);
      
      if (response.data.success && response.data.data.accounts) {
        const accounts = response.data.data.accounts.map(acc => ({
          username: acc.username,
          userId: acc.userId,
          isActive: acc.isActive && acc.status === 'active'
        }));

        setFormData(prev => ({
          ...prev,
          senderAccounts: accounts
        }));
      } else {
        setInstagramAccountsError('No Instagram accounts found for this workspace');
      }
    } catch (error: any) {
      console.error('Error fetching Instagram accounts:', error);
      setInstagramAccountsError(
        error.response?.data?.message || 'Failed to fetch Instagram accounts'
      );
    } finally {
      setInstagramAccountsLoading(false);
    }
  };

  console.log('formdata', formData)

  useEffect(() => {
    // Fetch Instagram accounts when user is available
    if (user?.email) {
      fetchInstagramAccounts();
    }
  }, [user]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleContinueToMessageSequence = () => {
    // Store selected creators in formData for later use
    const selectedCreatorsList = Array.from(selectedCreators).map(username => 
      formData.csvUserDetails?.find(creator => creator.username === username)
    ).filter(Boolean);
    
    setFormData(prev => ({
      ...prev,
      selectedCreators: selectedCreatorsList
    }));
    
    // Advance to next step (Message Sequence)
    setActiveStep(1);
  };

  // CSV Upload Handlers
  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvUploadError('Please upload a CSV file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setCsvUploadError('File size must be less than 5MB');
      return;
    }

    setIsProcessingCsv(true);
    setCsvUploadError('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvContent = e.target?.result as string;
        const usernames = parseCsvContent(csvContent);
        
        if (usernames.length === 0) {
          setCsvUploadError('No valid usernames found in CSV file');
          setIsProcessingCsv(false);
          return;
        }

        if (usernames.length > 100) {
          setCsvUploadError('Maximum 100 usernames allowed per CSV file');
          setIsProcessingCsv(false);
          return;
        }

        // Fetch user details from the API
        try {
          const response = await csvUploadAPI.getBatchUserDetails(usernames);
          
          if (response.data.success) {
            const { users, failedUsernames, totalSuccess, totalFailed } = response.data.data;
            
            setFormData(prev => ({
              ...prev,
              csvFile: file,
              csvUsernames: usernames,
              csvPreview: usernames.slice(0, 10), // Show first 10 for preview
              csvUserDetails: users // Store the fetched user details
            }));

            if (totalFailed > 0) {
              setCsvUploadError(`Warning: Could not fetch details for ${totalFailed} usernames: ${failedUsernames.join(', ')}`);
            }
          } else {
            setCsvUploadError('Failed to fetch user details from Instagram');
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          setCsvUploadError('Failed to fetch user details. Please try again.');
        }
        
        setIsProcessingCsv(false);
      } catch (error) {
        setCsvUploadError('Error parsing CSV file: ' + (error as Error).message);
        setIsProcessingCsv(false);
      }
    };
    
    reader.onerror = () => {
      setCsvUploadError('Error reading file');
      setIsProcessingCsv(false);
    };
    
    reader.readAsText(file);
  };

  const parseCsvContent = (csvContent: string): string[] => {
    const lines = csvContent.split('\n');
    const usernames = new Set<string>();
    
    lines.forEach((line, index) => {
      if (!line.trim() || line.startsWith('#')) {
        return; // Skip empty lines and comments
      }
      
      // Skip header row (check if line contains header keywords)
      if (index === 0 && line.toLowerCase().includes('username')) {
        return;
      }
      
      // Split by comma and only process the FIRST column (username column)
      const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
      const firstValue = values[0]; // Only process first column as username
      
      if (!firstValue) return;
      
      let username = null;
      
      // Extract username from various formats
      if (firstValue.includes('instagram.com/')) {
        // URL format: https://instagram.com/username or https://www.instagram.com/username
        const urlMatch = firstValue.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
        if (urlMatch) {
          username = urlMatch[1];
        }
      } else if (firstValue.startsWith('@')) {
        // @username format
        username = firstValue.slice(1);
      } else if (/^[a-zA-Z0-9._]+$/.test(firstValue)) {
        // Direct username format
        username = firstValue;
      }
      
      // Validate username format
      if (username && /^[a-zA-Z0-9._]{1,30}$/.test(username)) {
        usernames.add(username.toLowerCase());
      }
    });
    
    return Array.from(usernames);
  };

  const handleRemoveCsvFile = () => {
    setFormData(prev => ({
      ...prev,
      csvFile: null,
      csvUsernames: [],
      csvPreview: [],
      csvUserDetails: [],
      selectedCreators: []
    }));
    setCsvUploadError('');
    setSelectedCreators(new Set());
    setSearchQuery('');
  };

  const downloadSampleCsv = () => {
    const sampleData = `username
johndoe
@janedoe
https://instagram.com/influencer1
https://www.instagram.com/influencer2
creator_name
travel_blogger`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_usernames.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Selection handlers
  const handleSelectAllCreators = (checked: boolean) => {
    if (checked) {
      const allUsernames = new Set(formData.csvUserDetails?.map(creator => creator.username) || []);
      setSelectedCreators(allUsernames);
    } else {
      setSelectedCreators(new Set());
    }
  };

  const handleSelectCreator = (username: string, checked: boolean) => {
    const newSelected = new Set(selectedCreators);
    if (checked) {
      newSelected.add(username);
    } else {
      newSelected.delete(username);
    }
    setSelectedCreators(newSelected);
  };

  // Filter creators based on search
  const filteredCreators = formData.csvUserDetails?.filter(creator =>
    creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Initialize selections when creators are loaded
  React.useEffect(() => {
    if (formData.csvUserDetails && formData.csvUserDetails.length > 0) {
      const allUsernames = new Set(formData.csvUserDetails.map(creator => creator.username));
      setSelectedCreators(allUsernames);
    }
  }, [formData.csvUserDetails]);

  const handleAddMessageStep = () => {
    const newStep = {
      stepNumber: formData.messageSequence.length + 1,
      messageType: 'message' as const,
      content: '',
      delayHours: 24, // Default 24 hours, but minimum 3 hours enforced
      isActive: true,
    };
    setFormData(prev => ({
      ...prev,
      messageSequence: [...prev.messageSequence, newStep]
    }));
  };

  const handleEditMessageStep = (stepNumber: number) => {
    setEditingMessage(stepNumber);
    setMessageDialogOpen(true);
  };

  const handleSaveMessageStep = (stepNumber: number, content: string, delayHours: number) => {
    setFormData(prev => ({
      ...prev,
      messageSequence: prev.messageSequence.map(step =>
        step.stepNumber === stepNumber
          ? { 
              ...step, 
              content, 
              delayHours: step.messageType === 'follow' && stepNumber === 1 
                ? delayHours // Allow 0 delay for initial follow step
                : Math.max(3, delayHours) // Minimum 3 hours for all other steps
            }
          : step
      )
    }));
    setMessageDialogOpen(false);
    setEditingMessage(null);
  };

  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
    setEditingMessage(null);
  };

  const handleRemoveMessageStep = (stepNumber: number) => {
    setFormData(prev => ({
      ...prev,
      messageSequence: prev.messageSequence.filter(step => step.stepNumber !== stepNumber)
    }));
  };

  const handleSenderAccountToggle = (username: string) => {
    setFormData(prev => ({
      ...prev,
      senderAccounts: prev.senderAccounts.map(acc =>
        acc.username === username ? { ...acc, isActive: !acc.isActive } : acc
      )
    }));
  };

  const handleSubmit = async () => {
    try {
      if (id && id !== 'create') {
        await dispatch(updateCampaign({ id, data: formData }));
      } else {
        await dispatch(createCampaign(formData));
      }
      navigate('/campaigns');
    } catch (error) {
      console.error('Failed to save campaign:', error);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBasicInformationAndCreators();
      case 1:
        return renderMessageSequence();
      case 2:
        return renderSenderAccounts();
      case 3:
        return renderSchedulingSettings();
      case 4:
        return renderReviewLaunch();
      default:
        return null;
    }
  };

  const renderCreatorCard = (creator: any, index: number) => (
    <Box 
      key={creator.username} 
      sx={{ 
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 3,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
          borderColor: 'primary.main'
        }
      }}
    >
      {/* Header with profile info */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ position: 'relative', mr: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: `linear-gradient(45deg, ${
                ['#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'][index % 6]
              } 0%, ${
                ['#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#f093fb'][index % 6]
              } 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            {creator.username.charAt(0).toUpperCase()}
          </Box>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h6" 
            noWrap 
            sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 0.5 }}
          >
            {creator.fullName || creator.full_name || 'No display name'}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            noWrap
          >
            @{creator.username}
          </Typography>
        </Box>
        {/* Enrichment status badge */}
        {creator.enriched_at && (
          <Chip
            label="Enriched"
            size="small"
            color="success"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        )}
      </Box>

      {/* Main metrics grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '1rem' }}>
            {(creator.followersCount || creator.followers_count)?.toLocaleString() || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Followers
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold', fontSize: '1rem' }}>
            {creator.engagement_rate ? 
              `${(creator.engagement_rate * 100).toFixed(2)}%` : 
              creator.engagementRate ? `${creator.engagementRate}%` : 'N/A'
            }
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Engagement
          </Typography>
        </Box>
      </Box>

      {/* Engagement breakdown */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'primary.50', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {(creator.avg_likes || creator.averageLikes)?.toLocaleString() || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Avg Likes
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'secondary.50', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {(creator.avg_comments || creator.averageComments)?.toLocaleString() || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Avg Comments
          </Typography>
        </Box>
      </Box>

      {/* Additional metrics (if available from enrichment) */}
      {(creator.media_count || creator.posts_analyzed) && (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'info.50', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
              {(creator.media_count || creator.mediaCount || 0).toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Total Posts
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'warning.50', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
              {creator.posts_analyzed || creator.recentPostsCount || 12}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Posts Analyzed
            </Typography>
          </Box>
        </Box>
      )}

      {/* Data source and timestamp */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f0f0f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={creator.source === 'facebook_graph_api' ? 'Live Data' : 'Cached'}
            size="small"
            color={creator.source === 'facebook_graph_api' ? 'success' : 'default'}
            variant="outlined"
            sx={{ fontSize: '0.65rem', height: '20px' }}
          />
          {creator.enriched_at && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {new Date(creator.enriched_at).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );

  const renderBasicInformationAndCreators = () => (
    <Box>
      {viewMode && localCampaignData && (
        <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <InstagramIcon sx={{ mr: 1, color: 'primary.main' }} />
              Campaign Overview
            </Typography>
            
            {/* Replace Grid with Box layout */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { 
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: 'repeat(4, 1fr)'
                },
                gap: 3,
                mb: 3
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {localCampaignData.discoveredInfluencers?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Influencers
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {localCampaignData.statistics?.creators_discovered || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Discovered
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                  {localCampaignData.statistics?.follows_sent || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Follows Sent
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {localCampaignData.daily_outreach_limit || 50}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Daily Limit
                </Typography>
              </Box>
            </Box>

            {/* Campaign Status */}
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Chip
                  label={localCampaignData.status || 'active'}
                  color={
                    localCampaignData.status === 'active' ? 'success' :
                    localCampaignData.status === 'paused' ? 'warning' :
                    localCampaignData.status === 'completed' ? 'info' : 'default'
                  }
                  variant="outlined"
                  sx={{ mr: 2 }}
                />
                <Typography variant="body2" color="text.secondary" component="span">
                  Created: {new Date(localCampaignData.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Updated: {new Date(localCampaignData.updatedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ mr: 1 }} />
            {viewMode ? 'Campaign Influencers' : 'Upload Target Influencers'}
          </Typography>
          
          {viewMode ? (
            // View Mode: Show influencers table
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                List of influencers in this campaign with their current status.
              </Typography>
              
              {formData.csvUserDetails && formData.csvUserDetails.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Full Name</TableCell>
                        <TableCell>Followers</TableCell>
                        <TableCell>Engagement Rate</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.csvUserDetails.map((influencer: any, index: number) => (
                        <TableRow key={influencer.username || index} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  background: `linear-gradient(45deg, ${
                                    ['#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'][index % 6]
                                  } 0%, ${
                                    ['#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#f093fb'][index % 6]
                                  } 100%)`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  mr: 2
                                }}
                              >
                                {(influencer.username || '?').charAt(0).toUpperCase()}
                              </Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                @{influencer.username}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {influencer.fullName || influencer.full_name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {(influencer.followersCount || influencer.followers_count)?.toLocaleString() || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {influencer.engagement_rate ? 
                                `${(influencer.engagement_rate * 100).toFixed(2)}%` : 
                                influencer.engagementRate ? `${influencer.engagementRate}%` : 'N/A'
                              }
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={influencer.overallStatus || 'not_started'}
                              color={
                                influencer.overallStatus === 'completed' ? 'success' :
                                influencer.overallStatus === 'active' ? 'primary' :
                                influencer.overallStatus === 'failed' ? 'error' : 'default'
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No influencers found for this campaign.
                </Alert>
              )}
            </Box>
          ) : (
            // Create/Edit Mode: Show upload interface
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload a CSV file containing Instagram usernames or URLs. Supported formats: @username, username, or full Instagram URLs.
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={downloadSampleCsv}
                  sx={{ mb: 2 }}
                >
                  Download Sample CSV
                </Button>
              </Box>

              <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center', mb: 2 }}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  style={{ display: 'none' }}
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    disabled={isProcessingCsv}
                    size="large"
                  >
                    {isProcessingCsv ? 'Processing...' : 'Upload CSV File'}
                  </Button>
                </label>
                
                {csvUploadError && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {csvUploadError}
                  </Typography>
                )}
              </Box>

              {formData.csvFile && (
                <Box sx={{ mb: 2 }}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">
                        {formData.csvFile.name} ({formData.csvUsernames.length} usernames found)
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={handleRemoveCsvFile}
                      >
                        Remove
                      </Button>
                    </Box>
                    
                    {formData.csvPreview.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Preview (first 10):
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {formData.csvPreview.map((username, index) => (
                            <Chip
                              key={index}
                              label={`@${username}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {formData.csvUsernames.length > 10 && (
                            <Chip
                              label={`+${formData.csvUsernames.length - 10} more`}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </Box>
              )}
              
              {formData.csvUsernames.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Upload a CSV file with Instagram usernames to target specific influencers for your campaign
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderMessageSequence = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <MessageIcon sx={{ mr: 1 }} />
          Message Sequence
        </Typography>
        
        {viewMode && localCampaignData && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This campaign has {formData.messageSequence.length} automated steps configured.
          </Alert>
        )}
        
        <List>
          {formData.messageSequence.map((step, index) => (
            <ListItem key={step.stepNumber} divider>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`Step ${step.stepNumber}`}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      label={step.messageType.toUpperCase()}
                      size="small"
                      variant="outlined"
                      color={step.messageType === 'follow' ? 'success' : 
                             step.messageType === 'message' ? 'info' : 'warning'}
                    />
                    {step.delayHours > 0 && (
                      <Chip
                        label={`${step.delayHours}h delay`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={step.content || `${step.messageType} action`}
              />
              {!viewMode && (
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      edge="end"
                      onClick={() => handleEditMessageStep(step.stepNumber)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveMessageStep(step.stepNumber)}
                      disabled={formData.messageSequence.length <= 1}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
        
        {!viewMode && (
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddMessageStep}
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
          >
            Add Message Step
          </Button>
        )}
        
        <Alert severity="info" sx={{ mt: 2 }}>
          The message sequence defines the automated actions that will be performed for each discovered influencer.
        </Alert>
      </CardContent>
    </Card>
  );

  const renderSenderAccounts = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <InstagramIcon sx={{ mr: 1 }} />
          Sender Accounts
        </Typography>
        
        {instagramAccountsLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading Instagram accounts...
            </Typography>
          </Box>
        ) : instagramAccountsError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {instagramAccountsError}
            <Button 
              size="small" 
              onClick={fetchInstagramAccounts}
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        ) : formData.senderAccounts.length === 0 ? (
          <Alert severity="warning">
            No Instagram accounts connected. Please connect your Instagram accounts in Settings first.
          </Alert>
        ) : (
          <List>
            {formData.senderAccounts.map((account) => (
              <ListItem key={account.username}>
                <ListItemText
                  primary={`@${account.username}`}
                  secondary={`User ID: ${account.userId}`}
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    onChange={() => handleSenderAccountToggle(account.username)}
                    checked={account.isActive}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
        
        <Alert severity="info" sx={{ mt: 2 }}>
          Select which Instagram accounts will be used to send follows and messages. The system will rotate between active accounts.
        </Alert>
      </CardContent>
    </Card>
  );

  const renderSchedulingSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 1 }} />
          Campaign Settings
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                type="number"
                label="Max Daily Follows"
                value={formData.settings.maxDailyFollows}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, maxDailyFollows: Number(e.target.value) }
                }))}
                inputProps={{ min: 1, max: 200 }}
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                type="number"
                label="Max Daily Messages"
                value={formData.settings.maxDailyMessages}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, maxDailyMessages: Number(e.target.value) }
                }))}
                inputProps={{ min: 1, max: 100 }}
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                type="time"
                label="Start Time"
                value={formData.operationalHours.start}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  operationalHours: { ...prev.operationalHours, start: e.target.value }
                }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                type="time"
                label="End Time"
                value={formData.operationalHours.end}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  operationalHours: { ...prev.operationalHours, end: e.target.value }
                }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
          
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.settings.randomizeDelay}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, randomizeDelay: e.target.checked }
                  }))}
                />
              }
              label="Randomize delays to appear more natural"
            />
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          These settings control the timing and limits of your campaign to maintain Instagram compliance and appear natural.
        </Alert>
      </CardContent>
    </Card>
  );

  const renderReviewLaunch = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Review Your Campaign
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="primary">Campaign Name</Typography>
              <Typography variant="body2" gutterBottom>{formData.name}</Typography>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="primary">Target Influencers</Typography>
              <Typography variant="body2" gutterBottom>
                {formData.csvUsernames.length > 0 
                  ? `${formData.csvUsernames.length} influencers from CSV` 
                  : 'No CSV uploaded'}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="primary">Follower Range</Typography>
              <Typography variant="body2" gutterBottom>
                {formData.filters.followerRange.min.toLocaleString()} - {formData.filters.followerRange.max.toLocaleString()}
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="primary">Active Sender Accounts</Typography>
              <Typography variant="body2" gutterBottom>
                {formData.senderAccounts.filter(acc => acc.isActive).length} accounts
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="primary">Message Steps</Typography>
              <Typography variant="body2" gutterBottom>
                {formData.messageSequence.length} steps configured
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="primary">Daily Limits</Typography>
              <Typography variant="body2" gutterBottom>
                {formData.settings.maxDailyFollows} follows, {formData.settings.maxDailyMessages} messages
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Alert severity="success" sx={{ mt: 2 }}>
          Your campaign is ready to launch! Click "Create Campaign" to save it as a draft, or "Launch Campaign" to start it immediately.
        </Alert>
      </CardContent>
    </Card>
  );

  // Message Edit Dialog Component
  const MessageEditDialog = () => {
    const currentStep = editingMessage ? formData.messageSequence.find(step => step.stepNumber === editingMessage) : null;
    const [editContent, setEditContent] = React.useState(currentStep?.content || '');
    const [editDelay, setEditDelay] = React.useState(currentStep?.delayHours || 24);

    React.useEffect(() => {
      if (currentStep) {
        setEditContent(currentStep.content || '');
        setEditDelay(currentStep.delayHours || 24);
      }
    }, [currentStep]);

    const handleSave = () => {
      if (editingMessage) {
        handleSaveMessageStep(editingMessage, editContent, editDelay);
      }
    };

    return (
      <Dialog open={messageDialogOpen} onClose={handleCloseMessageDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Message Step {editingMessage}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {currentStep?.messageType === 'message' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message Content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Enter your message content here..."
                helperText="You can use placeholders like {username}, {followers}, {engagement}"
              />
            )}
            <TextField
              fullWidth
              type="number"
              label="Delay (Hours)"
              value={editDelay}
              onChange={(e) => {
                const minDelay = (currentStep?.messageType === 'follow' && currentStep?.stepNumber === 1) ? 0 : 3;
                setEditDelay(Math.max(minDelay, Number(e.target.value)));
              }}
              inputProps={{ 
                min: (currentStep?.messageType === 'follow' && currentStep?.stepNumber === 1) ? 0 : 3, 
                step: 1 
              }}
              helperText={
                (currentStep?.messageType === 'follow' && currentStep?.stepNumber === 1) 
                  ? "Initial follow can be immediate (0 hours) or delayed"
                  : "Minimum delay is 3 hours to maintain Instagram compliance"
              }
            />
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Message Placeholders:</strong><br />
                • {`{username}`} - Creator's username<br />
                • {`{followers}`} - Follower count<br />
                • {`{engagement}`} - Engagement rate
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading campaign data...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Modern Header Section */}
      <Box sx={{ mb: 4 }}>
        {/* Navigation Breadcrumb */}
        {!viewMode && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/campaigns')}
              variant="outlined"
              size="small"
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                color: 'text.secondary',
                borderColor: 'divider'
              }}
            >
              Back to Campaigns
            </Button>
          </Box>
        )}

        {/* Hero Header */}
        <Paper 
          elevation={0}
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '40%',
              height: '100%',
              opacity: 0.1,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 auto', minWidth: 300 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    mr: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <CampaignIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {viewMode 
                      ? 'Campaign Overview' 
                      : (id && id !== 'create' ? 'Edit Campaign' : 'Create New Campaign')
                    }
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                    {viewMode 
                      ? 'Monitor and analyze your outreach performance'
                      : 'Build automated Instagram outreach campaigns with powerful targeting'
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Campaign Name Field - Integrated into Header */}
            {!viewMode && (
              <Box sx={{ minWidth: 300 }}>
                <TextField
                  fullWidth
                  label="Campaign Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter campaign name..."
                  required
                  variant="filled"
                  sx={{
                    '& .MuiFilledInput-root': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'rgba(255, 255, 255, 0.25)',
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.8)'
                    },
                    '& .MuiFilledInput-input': {
                      color: 'white'
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.25rem'
            }
          }}
        >
          {error}
        </Alert>
      )}

      {/* Modern Progress Stepper */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Campaign Setup Progress
          </Typography
          >
          
          <Stepper 
            activeStep={activeStep} 
            sx={{
              '& .MuiStepLabel-root': {
                flexDirection: 'column',
                gap: 1
              },
              '& .MuiStepConnector-root': {
                top: 20,
                left: 'calc(-50% + 20px)',
                right: 'calc(50% + 20px)',
              },
              '& .MuiStepConnector-line': {
                borderTopWidth: 3,
                borderRadius: 1,
              },
              '& .MuiStep-root': {
                px: 1
              }
            }}
          >
            {steps.map((label, index) => (
              <Step 
                key={label}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    mt: 1
                  },
                  '& .MuiStepIcon-root': {
                    width: 40,
                    height: 40,
                    '&.Mui-active': {
                      color: 'primary.main'
                    },
                    '&.Mui-completed': {
                      color: 'success.main'
                    }
                  }
                }}
              >
                <StepLabel>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {label}
                    </Typography>
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Progress Bar */}
          <Box sx={{ mt: 3 }}>
            <LinearProgress 
              variant="determinate" 
              value={(activeStep / (steps.length - 1)) * 100}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Show Creator Cards only on step 0 when processing is complete, otherwise show stepper content */}
      {activeStep === 0 && formData.csvUserDetails && formData.csvUserDetails.length > 0 ? (
        <Box>
          {/* Creator Cards Section */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    List of Leads
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {formData.csvUserDetails.length} leads
                </Typography>
              </Box>

              {/* Search and Select All */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  placeholder="Search leads..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, color: 'text.secondary' }}>
                        🔍
                      </Box>
                    )
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={selectedCreators.size === formData.csvUserDetails.length}
                      indeterminate={selectedCreators.size > 0 && selectedCreators.size < formData.csvUserDetails.length}
                      onChange={(e) => handleSelectAllCreators(e.target.checked)}
                    />
                  }
                  label="Select All"
                />
              </Box>
              
              {/* Creator Grid */}
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)'
                  },
                  gap: 2,
                  mb: 3
                }}
              >
                {filteredCreators.map((creator, index) => (
                  <Box key={creator.username} sx={{ position: 'relative' }}>
                    <Checkbox
                      checked={selectedCreators.has(creator.username)}
                      onChange={(e) => handleSelectCreator(creator.username, e.target.checked)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 1,
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.9)'
                        }
                      }}
                    />
                    {renderCreatorCard(creator, index)}
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ mt: 3, p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                <Typography variant="body2" color="success.dark">
                  ✓ {selectedCreators.size} out of {formData.csvUserDetails.length} creators selected and ready for your campaign!
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleRemoveCsvFile}
                  startIcon={<DeleteIcon />}
                >
                  Upload Different CSV
                </Button>
                <Button
                  variant="contained"
                  onClick={handleContinueToMessageSequence}
                  disabled={!formData.name || selectedCreators.size === 0}
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  Continue →
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Box>
          {/* Step Content */}
          <Box sx={{ mb: 3 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation */}
          <Card>
            <CardContent>
              {viewMode ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                  >
                    Back
                  </Button>
                  
                  <Typography variant="body2" color="text.secondary">
                    Viewing Campaign - Step {activeStep + 1} of {steps.length}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {activeStep === steps.length - 1 ? (
                      onClose && (
                        <Button
                          onClick={onClose}
                          variant="contained"
                        >
                          Close
                        </Button>
                      )
                    ) : (
                      <Button
                        onClick={handleNext}
                        variant="contained"
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                  >
                    Back
                  </Button>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {activeStep === steps.length - 1 ? (
                      <>
                        <Button
                          onClick={handleSubmit}
                          variant="outlined"
                          disabled={loading}
                        >
                          Save as Draft
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          variant="contained"
                          disabled={loading}
                        >
                          {id && id !== 'create' ? 'Update Campaign' : 'Create Campaign'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleNext}
                        variant="contained"
                        disabled={
                          (activeStep === 0 && !formData.name) ||
                          (activeStep === 0 && formData.csvUsernames.length === 0) ||
                          (activeStep === 2 && formData.senderAccounts.filter(acc => acc.isActive).length === 0)
                        }
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Message Edit Dialog */}
      <MessageEditDialog />
    </Container>
  );
};

export default CreateCampaign;
