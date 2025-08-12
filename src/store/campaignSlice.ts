import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { campaignAPI } from '../services/api';

// Types
export interface Influencer {
  _id: string;
  username: string;
  userId?: string;
  fullName?: string;
  profilePicture?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  mediaCount: number;
  engagementRate: number;
  averageLikes: number;
  averageComments: number;
  isVerified: boolean;
  isPrivate: boolean;
  location?: string;
  lastAnalyzed: string;
}

export interface MessageSequenceStep {
  stepNumber: number;
  messageType: 'follow' | 'message' | 'unfollow';
  content?: string;
  delayHours: number;
  isActive: boolean;
}

export interface Campaign {
  _id: string;
  name: string;
  description?: string;
  hashtags: string[];
  filters: {
    followerRange: { min: number; max: number };
    engagementRate: { min: number; max: number };
    location?: string[];
    categories?: string[];
    verifiedOnly: boolean;
    privateAccountsOnly: boolean;
  };
  discoveredInfluencers: Influencer[];
  selectedInfluencers: string[];
  senderAccounts: Array<{ username: string; userId: string; isActive: boolean }>;
  messageSequence: MessageSequenceStep[];
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
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  statistics: {
    totalInfluencersFound: number;
    influencersContacted: number;
    followsAccepted: number;
    messagesReplied: number;
    conversionsAchieved: number;
    lastActivity?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CampaignFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface CampaignState {
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  filters: CampaignFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  isDiscovering: boolean;
  error: string | null;
  analytics: any;
}

const initialState: CampaignState = {
  campaigns: [],
  currentCampaign: null,
  filters: {
    page: 1,
    limit: 10,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  isDiscovering: false,
  error: null,
  analytics: null,
};

// Async thunks
export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (filters: CampaignFilters = {}, { rejectWithValue }) => {
    try {
      const response = await campaignAPI.getCampaigns(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaigns');
    }
  }
);

export const fetchCampaign = createAsyncThunk(
  'campaigns/fetchCampaign',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await campaignAPI.getCampaign(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaign');
    }
  }
);

export const createCampaign = createAsyncThunk(
  'campaigns/createCampaign',
  async (campaignData: Partial<Campaign>, { rejectWithValue }) => {
    try {
      const response = await campaignAPI.createCampaign(campaignData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create campaign');
    }
  }
);

export const updateCampaign = createAsyncThunk(
  'campaigns/updateCampaign',
  async ({ id, data }: { id: string; data: Partial<Campaign> }, { rejectWithValue }) => {
    try {
      const response = await campaignAPI.updateCampaign(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update campaign');
    }
  }
);

export const deleteCampaign = createAsyncThunk(
  'campaigns/deleteCampaign',
  async (id: string, { rejectWithValue }) => {
    try {
      await campaignAPI.deleteCampaign(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete campaign');
    }
  }
);

export const discoverInfluencers = createAsyncThunk(
  'campaigns/discoverInfluencers',
  async ({ id, hashtag, limit }: { id: string; hashtag: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await campaignAPI.discoverInfluencers(id, hashtag, limit);
      return { campaignId: id, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to discover influencers');
    }
  }
);

export const selectInfluencers = createAsyncThunk(
  'campaigns/selectInfluencers',
  async ({ id, influencerIds }: { id: string; influencerIds: string[] }, { rejectWithValue }) => {
    try {
      const response = await campaignAPI.selectInfluencers(id, influencerIds);
      return { campaignId: id, influencerIds, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to select influencers');
    }
  }
);

export const startCampaign = createAsyncThunk(
  'campaigns/startCampaign',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await campaignAPI.startCampaign(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start campaign');
    }
  }
);

export const pauseCampaign = createAsyncThunk(
  'campaigns/pauseCampaign',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await campaignAPI.pauseCampaign(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to pause campaign');
    }
  }
);

export const fetchCampaignAnalytics = createAsyncThunk(
  'campaigns/fetchAnalytics',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await campaignAPI.getCampaignAnalytics(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

// Slice
const campaignSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<CampaignFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentCampaign: (state) => {
      state.currentCampaign = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateCampaignInList: (state, action: PayloadAction<Campaign>) => {
      const index = state.campaigns.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.campaigns[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch campaigns
      .addCase(fetchCampaigns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.campaigns = action.payload.data.campaigns;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch campaign
      .addCase(fetchCampaign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCampaign = action.payload.data.campaign;
      })
      .addCase(fetchCampaign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create campaign
      .addCase(createCampaign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.campaigns.unshift(action.payload.data.campaign);
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update campaign
      .addCase(updateCampaign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedCampaign = action.payload.data.campaign;
        state.currentCampaign = updatedCampaign;
        const index = state.campaigns.findIndex(c => c._id === updatedCampaign._id);
        if (index !== -1) {
          state.campaigns[index] = updatedCampaign;
        }
      })
      .addCase(updateCampaign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete campaign
      .addCase(deleteCampaign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.campaigns = state.campaigns.filter(c => c._id !== action.payload);
        if (state.currentCampaign?._id === action.payload) {
          state.currentCampaign = null;
        }
      })
      .addCase(deleteCampaign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Discover influencers
      .addCase(discoverInfluencers.pending, (state) => {
        state.isDiscovering = true;
        state.error = null;
      })
      .addCase(discoverInfluencers.fulfilled, (state, action) => {
        state.isDiscovering = false;
        // The backend updates the campaign directly, so we need to refetch
        // or update the current campaign with new influencers
      })
      .addCase(discoverInfluencers.rejected, (state, action) => {
        state.isDiscovering = false;
        state.error = action.payload as string;
      })
      // Select influencers
      .addCase(selectInfluencers.fulfilled, (state, action) => {
        if (state.currentCampaign) {
          state.currentCampaign.selectedInfluencers = action.payload.influencerIds;
        }
      })
      // Start campaign
      .addCase(startCampaign.fulfilled, (state, action) => {
        const updatedCampaign = action.payload.data.campaign;
        state.currentCampaign = updatedCampaign;
        const index = state.campaigns.findIndex(c => c._id === updatedCampaign._id);
        if (index !== -1) {
          state.campaigns[index] = updatedCampaign;
        }
      })
      // Pause campaign
      .addCase(pauseCampaign.fulfilled, (state, action) => {
        const updatedCampaign = action.payload.data.campaign;
        state.currentCampaign = updatedCampaign;
        const index = state.campaigns.findIndex(c => c._id === updatedCampaign._id);
        if (index !== -1) {
          state.campaigns[index] = updatedCampaign;
        }
      })
      // Fetch analytics
      .addCase(fetchCampaignAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload.data.analytics;
      });
  },
});

export const { setFilters, clearCurrentCampaign, clearError, updateCampaignInList } = campaignSlice.actions;
export default campaignSlice.reducer;
