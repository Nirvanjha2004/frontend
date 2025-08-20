import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Badge,
  Chip,
  InputAdornment,
  Divider,
  Button,
  Menu,
  MenuItem,
  Skeleton,
  Alert,
  CircularProgress,
  Container,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Image as ImageIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../hooks/redux';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Participant {
  userId: string;
  username: string;
  fullName: string;
  profilePicUrl: string;
  isVerified: boolean;
}

interface LastMessage {
  messageId: string;
  text: string;
  timestamp: string;
  senderId: string;
  messageType: string;
}

interface Account {
  id: string;
  username: string;
  profilePicture: string;
}

interface Conversation {
  id: string;
  threadId: string;
  threadTitle: string;
  participants: Participant[];
  lastMessage: LastMessage;
  isGroup: boolean;
  unreadCount: number;
  lastReadAt: string | null;
  accountId: Account;
  createdAt: string;
  lastUpdated: string;
}

interface Message {
  id: string;
  messageId: string;
  text: string;
  messageType: string;
  senderId: string;
  senderUsername: string;
  senderName: string;
  isFromMe: boolean;
  timestamp: string;
  media?: Array<{
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl: string;
  }>;
  sharedContent?: {
    contentType: string;
    contentTitle: string;
    contentUrl: string;
    contentThumbnail: string;
  };
  reactions?: Array<{
    userId: string;
    emoji: string;
  }>;
}

const Unibox: React.FC = () => {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth?.user);
  const userEmail = user?.email || 'test@example.com';
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [userEmail]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/conversations`, {
        params: { workspaceEmail: userEmail }
      });

      if (response.data.success) {
        setConversations(response.data.data.conversations);
        setLastSync(new Date());
      } else {
        setError(response.data.message || 'Failed to fetch conversations');
      }
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      setError(error.response?.data?.message || 'Failed to fetch conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string, options?: { limit?: number; skip?: number }) => {
    try {
      setIsLoadingMessages(true);
      
      const response = await axios.get(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        params: { 
          limit: options?.limit || 50,
          skip: options?.skip || 0,
          sortOrder: 'asc'
        }
      });

      if (response.data.success) {
        if (options?.skip) {
          // Prepend older messages
          setMessages(prev => [...response.data.data.messages, ...prev]);
        } else {
          // Replace all messages
          setMessages(response.data.data.messages);
        }
      } else {
        setError(response.data.message || 'Failed to fetch messages');
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      setError(error.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const syncAllConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/conversations/sync/workspace`, {
        workspaceEmail: userEmail
      });

      if (response.data.success) {
        await fetchConversations(); // Refresh the list
        setLastSync(new Date());
      } else {
        setError(response.data.message || 'Failed to sync conversations');
      }
    } catch (error: any) {
      console.error('Error syncing conversations:', error);
      setError(error.response?.data?.message || 'Failed to sync conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    try {
      setIsSending(true);
      
      const response = await axios.post(`${API_BASE_URL}/conversations/${selectedConversation.id}/messages`, {
        message: newMessage.trim(),
        messageType: 'text'
      });

      if (response.data.success) {
        // Add the sent message to the local state
        const sentMessage: Message = {
          id: response.data.data.messageId,
          messageId: response.data.data.messageId,
          text: newMessage.trim(),
          messageType: 'text',
          senderId: selectedConversation.accountId.id,
          senderUsername: selectedConversation.accountId.username,
          senderName: '',
          isFromMe: true,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        
        // Update the conversation's last message
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? {
                ...conv,
                lastMessage: {
                  messageId: sentMessage.messageId,
                  text: sentMessage.text,
                  timestamp: sentMessage.timestamp,
                  senderId: sentMessage.senderId,
                  messageType: sentMessage.messageType
                },
                lastUpdated: sentMessage.timestamp
              }
            : conv
        ));
      } else {
        setError(response.data.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await axios.patch(`${API_BASE_URL}/conversations/${conversationId}/read`);
      
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0, lastReadAt: new Date().toISOString() }
          : conv
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getParticipantName = (conversation: Conversation): string => {
    if (conversation.isGroup) {
      return conversation.threadTitle || `Group (${conversation.participants.length})`;
    }
    
    const otherParticipant = conversation.participants.find(p => p.userId !== conversation.accountId.id);
    return otherParticipant?.fullName || otherParticipant?.username || 'Unknown User';
  };

  const getParticipantAvatar = (conversation: Conversation): string => {
    if (conversation.isGroup) {
      return '';
    }
    
    const otherParticipant = conversation.participants.find(p => p.userId !== conversation.accountId.id);
    return otherParticipant?.profilePicUrl || '';
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const participantName = getParticipantName(conv).toLowerCase();
    const lastMessageText = conv.lastMessage?.text?.toLowerCase() || '';
    
    return participantName.includes(query) || lastMessageText.includes(query);
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container maxWidth={false} sx={{ height: '100vh', py: 2 }}>
      <Paper 
        elevation={2} 
        sx={{ 
          height: '90vh',
          display: 'flex',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Conversation List */}
        <Box
          sx={{
            width: 400,
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Messages
            </Typography>
            <Box>
              <IconButton 
                onClick={syncAllConversations} 
                disabled={isLoading}
                size="small"
              >
                {isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
              <IconButton onClick={handleMenuOpen} size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Search */}
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Sync Status */}
          {lastSync && (
            <Box sx={{ px: 2, pb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Last synced: {formatTime(lastSync.toISOString())}
              </Typography>
            </Box>
          )}

          {/* Conversation List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {error && (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            )}
            
            {isLoading ? (
              <Box sx={{ p: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={50} height={50} />
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredConversations.map((conversation) => (
                  <ListItem
                    key={conversation.id}
                    disablePadding
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemButton
                      onClick={() => {
                        setSelectedConversation(conversation);
                        if (conversation.unreadCount > 0) {
                          markAsRead(conversation.id);
                        }
                      }}
                      selected={selectedConversation?.id === conversation.id}
                      sx={{
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        }
                      }}
                    >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={conversation.unreadCount}
                        color="primary"
                        overlap="circular"
                        invisible={conversation.unreadCount === 0}
                      >
                        <Avatar
                          src={getParticipantAvatar(conversation)}
                          sx={{ width: 50, height: 50 }}
                        >
                          {getParticipantName(conversation)[0]?.toUpperCase()}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={conversation.unreadCount > 0 ? 600 : 400}
                            noWrap
                          >
                            {getParticipantName(conversation)}
                          </Typography>
                          <Chip
                            icon={<InstagramIcon />}
                            label={conversation.accountId.username}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              height: 18,
                              fontSize: '0.7rem',
                              '& .MuiChip-icon': { width: 12, height: 12 }
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            sx={{ 
                              fontWeight: conversation.unreadCount > 0 ? 500 : 400,
                              maxWidth: 250
                            }}
                          >
                            {conversation.lastMessage?.text || 'No messages'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={getParticipantAvatar(selectedConversation)}
                    sx={{ width: 40, height: 40 }}
                  >
                    {getParticipantName(selectedConversation)[0]?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {getParticipantName(selectedConversation)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={<InstagramIcon />}
                        label={selectedConversation.accountId.username}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.75rem' }}
                      />
                      {selectedConversation.isGroup && (
                        <Typography variant="caption" color="text.secondary">
                          {selectedConversation.participants.length} members
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <IconButton size="small">
                    <PhoneIcon />
                  </IconButton>
                  <IconButton size="small">
                    <VideoIcon />
                  </IconButton>
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                {isLoadingMessages ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  messages.map((message, index) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.isFromMe ? 'flex-end' : 'flex-start',
                        mb: 1
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          bgcolor: message.isFromMe 
                            ? theme.palette.primary.main 
                            : theme.palette.grey[100],
                          color: message.isFromMe ? 'white' : 'text.primary',
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          borderTopRightRadius: message.isFromMe ? 0.5 : 2,
                          borderTopLeftRadius: message.isFromMe ? 2 : 0.5,
                        }}
                      >
                        {!message.isFromMe && selectedConversation.isGroup && (
                          <Typography variant="caption" fontWeight={600} display="block">
                            {message.senderName || message.senderUsername}
                          </Typography>
                        )}
                        
                        {/* Media */}
                        {message.media && message.media.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            {message.media.map((media, mediaIndex) => (
                              <Box key={mediaIndex}>
                                {media.mediaType === 'image' && (
                                  <img
                                    src={media.thumbnailUrl || media.mediaUrl}
                                    alt="Shared image"
                                    style={{ maxWidth: '100%', borderRadius: 8 }}
                                  />
                                )}
                                {media.mediaType === 'video' && (
                                  <video
                                    src={media.mediaUrl}
                                    poster={media.thumbnailUrl}
                                    controls
                                    style={{ maxWidth: '100%', borderRadius: 8 }}
                                  />
                                )}
                              </Box>
                            ))}
                          </Box>
                        )}

                        {/* Shared Content */}
                        {message.sharedContent && (
                          <Box
                            sx={{
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 1,
                              p: 1,
                              mb: 1,
                              bgcolor: 'background.paper'
                            }}
                          >
                            <Typography variant="caption" color="primary" fontWeight={600}>
                              Shared {message.sharedContent.contentType}
                            </Typography>
                            {message.sharedContent.contentTitle && (
                              <Typography variant="body2" noWrap>
                                {message.sharedContent.contentTitle}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* Text */}
                        {message.text && (
                          <Typography variant="body2">
                            {message.text}
                          </Typography>
                        )}
                        
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            display: 'block',
                            mt: 0.5,
                            textAlign: 'right'
                          }}
                        >
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 1
                }}
              >
                <IconButton size="small" color="primary">
                  <AttachFileIcon />
                </IconButton>
                <IconButton size="small" color="primary">
                  <ImageIcon />
                </IconButton>
                
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  variant="outlined"
                  size="small"
                />
                
                <IconButton size="small" color="primary">
                  <EmojiIcon />
                </IconButton>
                
                <IconButton
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  color="primary"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&:disabled': {
                      bgcolor: 'action.disabledBackground',
                    }
                  }}
                >
                  {isSending ? <CircularProgress size={20} /> : <SendIcon />}
                </IconButton>
              </Box>
            </>
          ) : (
            /* No Conversation Selected */
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                color: 'text.secondary'
              }}
            >
              <InstagramIcon sx={{ fontSize: 64, opacity: 0.3 }} />
              <Typography variant="h6">Select a conversation</Typography>
              <Typography variant="body2" textAlign="center">
                Choose a conversation from the list to start messaging
              </Typography>
              
              {conversations.length === 0 && !isLoading && (
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={syncAllConversations}
                  sx={{ mt: 2 }}
                >
                  Sync Conversations
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={syncAllConversations}>
          <RefreshIcon sx={{ mr: 1 }} />
          Sync All Conversations
        </MenuItem>
        <Divider />
        <MenuItem>
          <StarIcon sx={{ mr: 1 }} />
          Starred Messages
        </MenuItem>
        <MenuItem>
          <ArchiveIcon sx={{ mr: 1 }} />
          Archived Chats
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Unibox;
