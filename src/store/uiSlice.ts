import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

export interface Modal {
  id: string;
  type: string;
  isOpen: boolean;
  data?: any;
  props?: any;
}

export interface UIState {
  // Navigation
  sidebarOpen: boolean;
  sidebarMobile: boolean;
  
  // Loading states
  globalLoading: boolean;
  pageLoading: boolean;
  buttonLoading: Record<string, boolean>;
  
  // Notifications
  notifications: Notification[];
  
  // Modals
  modals: Modal[];
  
  // Theme
  theme: 'light' | 'dark';
  
  // Layout
  layout: 'default' | 'fullwidth' | 'minimal';
  
  // Search
  searchQuery: string;
  searchResults: any[];
  searchLoading: boolean;
  
  // Filters
  activeFilters: Record<string, any>;
  
  // Preferences
  preferences: {
    autoRefresh: boolean;
    autoRefreshInterval: number;
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    dashboard: {
      compactView: boolean;
      defaultView: 'grid' | 'list';
    };
  };
  
  // Current page context
  currentPage: string;
  breadcrumbs: Array<{ label: string; path?: string }>;
  
  // Error states
  errors: Record<string, string>;
  
  // Form states
  forms: Record<string, {
    isDirty: boolean;
    isValid: boolean;
    errors: Record<string, string>;
  }>;
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarMobile: false,
  globalLoading: false,
  pageLoading: false,
  buttonLoading: {},
  notifications: [],
  modals: [],
  theme: 'light',
  layout: 'default',
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  activeFilters: {},
  preferences: {
    autoRefresh: false,
    autoRefreshInterval: 30000, // 30 seconds
    notifications: {
      email: true,
      push: true,
      inApp: true,
    },
    dashboard: {
      compactView: false,
      defaultView: 'grid',
    },
  },
  currentPage: '',
  breadcrumbs: [],
  errors: {},
  forms: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarMobile: (state) => {
      state.sidebarMobile = !state.sidebarMobile;
    },
    setSidebarMobile: (state, action: PayloadAction<boolean>) => {
      state.sidebarMobile = action.payload;
    },

    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.pageLoading = action.payload;
    },
    setButtonLoading: (state, action: PayloadAction<{ id: string; loading: boolean }>) => {
      const { id, loading } = action.payload;
      if (loading) {
        state.buttonLoading[id] = true;
      } else {
        delete state.buttonLoading[id];
      }
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Modals
    openModal: (state, action: PayloadAction<Omit<Modal, 'id' | 'isOpen'>>) => {
      const modal: Modal = {
        ...action.payload,
        id: Date.now().toString(),
        isOpen: true,
      };
      state.modals.push(modal);
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(m => m.id !== action.payload);
    },
    closeAllModals: (state) => {
      state.modals = [];
    },
    updateModal: (state, action: PayloadAction<{ id: string; data?: any; props?: any }>) => {
      const { id, data, props } = action.payload;
      const modal = state.modals.find(m => m.id === id);
      if (modal) {
        if (data !== undefined) modal.data = data;
        if (props !== undefined) modal.props = props;
      }
    },

    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Layout
    setLayout: (state, action: PayloadAction<'default' | 'fullwidth' | 'minimal'>) => {
      state.layout = action.payload;
    },

    // Search
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<any[]>) => {
      state.searchResults = action.payload;
    },
    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.searchLoading = action.payload;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
      state.searchLoading = false;
    },

    // Filters
    setFilter: (state, action: PayloadAction<{ key: string; value: any }>) => {
      const { key, value } = action.payload;
      state.activeFilters[key] = value;
    },
    removeFilter: (state, action: PayloadAction<string>) => {
      delete state.activeFilters[action.payload];
    },
    clearFilters: (state) => {
      state.activeFilters = {};
    },

    // Preferences
    updatePreferences: (state, action: PayloadAction<Partial<UIState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    updateNotificationPreferences: (state, action: PayloadAction<Partial<UIState['preferences']['notifications']>>) => {
      state.preferences.notifications = { ...state.preferences.notifications, ...action.payload };
    },
    updateDashboardPreferences: (state, action: PayloadAction<Partial<UIState['preferences']['dashboard']>>) => {
      state.preferences.dashboard = { ...state.preferences.dashboard, ...action.payload };
    },

    // Page context
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; path?: string }>>) => {
      state.breadcrumbs = action.payload;
    },

    // Error states
    setError: (state, action: PayloadAction<{ key: string; error: string }>) => {
      const { key, error } = action.payload;
      state.errors[key] = error;
    },
    clearError: (state, action: PayloadAction<string>) => {
      delete state.errors[action.payload];
    },
    clearAllErrors: (state) => {
      state.errors = {};
    },

    // Form states
    setFormState: (state, action: PayloadAction<{ 
      formId: string; 
      formState: UIState['forms'][string] 
    }>) => {
      const { formId, formState } = action.payload;
      state.forms[formId] = formState;
    },
    updateFormField: (state, action: PayloadAction<{
      formId: string;
      field: keyof UIState['forms'][string];
      value: any;
    }>) => {
      const { formId, field, value } = action.payload;
      if (!state.forms[formId]) {
        state.forms[formId] = {
          isDirty: false,
          isValid: true,
          errors: {},
        };
      }
      state.forms[formId][field] = value;
    },
    setFormError: (state, action: PayloadAction<{
      formId: string;
      field: string;
      error: string;
    }>) => {
      const { formId, field, error } = action.payload;
      if (!state.forms[formId]) {
        state.forms[formId] = {
          isDirty: false,
          isValid: true,
          errors: {},
        };
      }
      state.forms[formId].errors[field] = error;
    },
    clearFormError: (state, action: PayloadAction<{
      formId: string;
      field: string;
    }>) => {
      const { formId, field } = action.payload;
      if (state.forms[formId]?.errors) {
        delete state.forms[formId].errors[field];
      }
    },
    clearForm: (state, action: PayloadAction<string>) => {
      delete state.forms[action.payload];
    },

    // Utility actions
    showSuccessNotification: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'success',
        title: 'Success',
        message: action.payload,
        duration: 5000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    showErrorNotification: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: action.payload,
        duration: 8000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    showWarningNotification: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'warning',
        title: 'Warning',
        message: action.payload,
        duration: 6000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    showInfoNotification: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'info',
        title: 'Info',
        message: action.payload,
        duration: 5000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarMobile,
  setSidebarMobile,
  setGlobalLoading,
  setPageLoading,
  setButtonLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  updateModal,
  setTheme,
  toggleTheme,
  setLayout,
  setSearchQuery,
  setSearchResults,
  setSearchLoading,
  clearSearch,
  setFilter,
  removeFilter,
  clearFilters,
  updatePreferences,
  updateNotificationPreferences,
  updateDashboardPreferences,
  setCurrentPage,
  setBreadcrumbs,
  setError,
  clearError,
  clearAllErrors,
  setFormState,
  updateFormField,
  setFormError,
  clearFormError,
  clearForm,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
