import axios, { AxiosResponse } from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || '';
      const requestUrl = error.config?.url || '';
      
      // Don't auto-redirect on login/register attempts - let the component handle it
      const isAuthEndpoint = requestUrl.includes('/auth/login') || 
                            requestUrl.includes('/auth/register');
      
      if (isAuthEndpoint) {
        console.warn('Authentication failed on auth endpoint:', errorMessage);
        return Promise.reject(error);
      }
      
      // Only logout if it's specifically an authentication error on protected endpoints
      const isAuthError = errorMessage.includes('Token') || 
                         errorMessage.includes('token') || 
                         errorMessage.includes('expired') || 
                         errorMessage.includes('invalid') ||
                         errorMessage.includes('Access denied');
      
      if (isAuthError) {
        console.warn('Authentication error detected, logging out:', errorMessage);
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        console.warn('Non-authentication 401 error:', errorMessage);
      }
    }
    return Promise.reject(error);
  }
);

// API response interface
interface ApiResponse<T = any> {
  user: any;
  token: string | null;
  success: boolean;
  data: T;
  message?: string;
}

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }): Promise<AxiosResponse<ApiResponse<{ user: any; token: string }>>> =>
    api.post('/auth/login', credentials),

  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
    phoneNumber?: string;
  }): Promise<AxiosResponse<ApiResponse<{ user: any; token: string }>>> =>
    api.post('/auth/register', userData),

  getProfile: (): Promise<AxiosResponse<ApiResponse<{ user: any }>>> =>
    api.get('/auth/profile'),

  updateProfile: (userData: any): Promise<AxiosResponse<ApiResponse<{ user: any }>>> =>
    api.put('/auth/profile', userData),

  changePassword: (passwordData: { currentPassword: string; newPassword: string }): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/change-password', passwordData),

  forgotPassword: (email: string): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/reset-password', { token, newPassword }),

  validateToken: (): Promise<AxiosResponse<ApiResponse<{ user: any }>>> =>
    api.get('/auth/validate-token'),
};

// Campaign API
export const campaignAPI = {
  getCampaigns: (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<AxiosResponse<ApiResponse<{ campaigns: any[]; pagination: any }>>> =>
    api.get('/campaigns', { params }),

  getCampaign: (id: string): Promise<AxiosResponse<ApiResponse<{ campaign: any }>>> =>
    api.get(`/campaigns/${id}`),

  createCampaign: (campaignData: any): Promise<AxiosResponse<ApiResponse<{ campaign: any }>>> =>
    api.post('/campaigns', campaignData),

  updateCampaign: (id: string, campaignData: any): Promise<AxiosResponse<ApiResponse<{ campaign: any }>>> =>
    api.put(`/campaigns/${id}`, campaignData),

  deleteCampaign: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/campaigns/${id}`),

  discoverInfluencers: (id: string, hashtag: string, limit?: number): Promise<AxiosResponse<ApiResponse<{ influencersFound: number; influencers: any[] }>>> =>
    api.post(`/campaigns/${id}/discover`, { hashtag, limit }),

  selectInfluencers: (id: string, influencerIds: string[]): Promise<AxiosResponse<ApiResponse<{ selectedCount: number }>>> =>
    api.post(`/campaigns/${id}/select-influencers`, { influencerIds }),

  startCampaign: (id: string): Promise<AxiosResponse<ApiResponse<{ campaign: any }>>> =>
    api.post(`/campaigns/${id}/start`),

  pauseCampaign: (id: string): Promise<AxiosResponse<ApiResponse<{ campaign: any }>>> =>
    api.post(`/campaigns/${id}/pause`),

  getCampaignAnalytics: (id: string): Promise<AxiosResponse<ApiResponse<{ analytics: any }>>> =>
    api.get(`/campaigns/${id}/analytics`),
};

// Instagram API
export const instagramAPI = {
  addAccount: (accountData: {
    username: string;
    userId: string;
    accessToken: string;
    refreshToken?: string;
  }): Promise<AxiosResponse<ApiResponse<{ account: any }>>> =>
    api.post('/instagram/add-account', accountData),

  removeAccount: (username: string): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/instagram/remove-account/${username}`),

  refreshAccount: (username: string): Promise<AxiosResponse<ApiResponse<{ account: any }>>> =>
    api.post(`/instagram/refresh-account/${username}`),

  getInsights: (username: string, period?: string, metrics?: string): Promise<AxiosResponse<ApiResponse<{ insights: any }>>> =>
    api.get(`/instagram/insights/${username}`, { params: { period, metrics } }),

  searchHashtag: (hashtag: string, limit?: number): Promise<AxiosResponse<ApiResponse<{ hashtag: string; posts: any[]; count: number }>>> =>
    api.post('/instagram/search-hashtag', { hashtag, limit }),

  analyzeInfluencer: (username: string): Promise<AxiosResponse<ApiResponse<{ analysis: any }>>> =>
    api.post('/instagram/analyze-influencer', { username }),

  refreshToken: (username: string): Promise<AxiosResponse<ApiResponse>> =>
    api.post(`/instagram/refresh-token/${username}`),

  // Get workspace Instagram accounts (uses workspace email)
  getWorkspaceAccounts: (workspaceEmail: string): Promise<AxiosResponse<ApiResponse<{ accounts: any[]; total: number; workspaceEmail: string }>>> =>
    api.get('/instagram/accounts/all', { params: { workspaceEmail } }),
};

// User API
export const userAPI = {
  getDashboard: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/users/dashboard'),

  getInstagramAccounts: (): Promise<AxiosResponse<ApiResponse<{ accounts: any[] }>>> =>
    api.get('/users/instagram-accounts'),

  updateSettings: (settings: any): Promise<AxiosResponse<ApiResponse<{ settings: any }>>> =>
    api.put('/users/settings', { settings }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: (timeframe?: number): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/analytics/overview', { params: { timeframe } }),

  getCampaignsComparison: (): Promise<AxiosResponse<ApiResponse<{ comparison: any[] }>>> =>
    api.get('/analytics/campaigns-comparison'),

  getHashtagAnalytics: (): Promise<AxiosResponse<ApiResponse<{ hashtags: any[] }>>> =>
    api.get('/analytics/hashtags'),

  getEngagementAnalytics: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/analytics/engagement'),

  exportAnalytics: (campaignId?: string, format?: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/analytics/export', { params: { campaignId, format } }),
};

// CSV Upload API
export const csvUploadAPI = {
  getBatchUserDetails: (usernames: string[]): Promise<AxiosResponse<ApiResponse<{
    users: any[];
    failedUsernames: string[];
    totalRequested: number;
    totalSuccess: number;
    totalFailed: number;
  }>>> =>
    api.post('/campaigns/batch-user-details', { usernames }),
};

export default api;
