import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  Tooltip
} from '@mui/material';
import {
  Visibility,
  Close
} from '@mui/icons-material';
import CampaignView from './CampaignView';

// Component to integrate with campaign list/table
const ViewCampaignButton = ({ campaignId, variant = 'icon', children }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (variant === 'icon') {
    return (
      <>
        <Tooltip title="View Campaign Details">
          <IconButton onClick={handleOpen} size="small">
            <Visibility />
          </IconButton>
        </Tooltip>
        
        <Dialog 
          open={open} 
          onClose={handleClose}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: { height: '90vh' }
          }}
        >
          <DialogTitle>
            Campaign Details
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <CampaignView 
              campaignId={campaignId} 
              onClose={handleClose}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button 
        variant="outlined" 
        startIcon={<Visibility />}
        onClick={handleOpen}
        size="small"
      >
        {children || 'View Campaign'}
      </Button>
      
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          Campaign Details
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <CampaignView 
            campaignId={campaignId} 
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewCampaignButton;
