import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button, Typography, Box, CircularProgress, Paper } from '@mui/material';
import { CloudDownload, Error } from '@mui/icons-material';

const DownloadPage = () => {
  const { link } = useParams();
  const [fileInfo, setFileInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/files/info/${link}`);
        setFileInfo(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch file information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileInfo();
  }, [link]);

  const handleDownload = () => {
    window.location.href = `http://localhost:5000/api/files/download/${link}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', my: 4, textAlign: 'center' }}>
        <Error color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          File Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CloudDownload color="primary" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Your file is ready to download
        </Typography>
        
        <Box sx={{ textAlign: 'left', my: 3, p: 2, backgroundColor: 'action.selected', borderRadius: 1 }}>
          <Typography variant="body1">
            <strong>File Name:</strong> {fileInfo.filename}
          </Typography>
          <Typography variant="body1">
            <strong>File Size:</strong> {formatFileSize(fileInfo.size)}
          </Typography>
          <Typography variant="body1">
            <strong>Uploaded:</strong> {new Date(fileInfo.createdAt).toLocaleString()}
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          size="large"
          onClick={handleDownload}
          sx={{ mt: 2 }}
        >
          Download File
        </Button>
        
        <Typography variant="caption" display="block" sx={{ mt: 3 }}>
          Note: This link will expire in 24 hours from upload time
        </Typography>
      </Paper>
    </Box>
  );
};

export default DownloadPage;