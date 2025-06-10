import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { LinearProgress, Typography, Box, Paper, IconButton } from '@mui/material';
import { CloudUpload, ContentCopy, CheckCircle } from '@mui/icons-material';

const FileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: !!downloadLink,
    noKeyboard: !!downloadLink,
  });

  const handleUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setDownloadLink('');
    setFileName(file.name);
    setFileSize(file.size);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/files/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      setDownloadLink(response.data.downloadLink);
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (!downloadLink) return;
    
    navigator.clipboard.writeText(`${window.location.origin}/download/${downloadLink}`);
    setIsCopied(true);
    toast.success('Link copied to clipboard!');
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          DropLinker
        </Typography>
        
        <Paper
          {...getRootProps()}
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            cursor: downloadLink ? 'default' : 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: downloadLink ? 'grey.300' : 'primary.main',
              backgroundColor: downloadLink ? 'background.paper' : 'action.hover',
            },
          }}
        >
          <input {...getInputProps()} />
          
          {downloadLink ? (
            <Box>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Your file is ready to share!
              </Typography>
              <Typography variant="body1" gutterBottom>
                {fileName} ({formatFileSize(fileSize)})
              </Typography>
              
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 2,
                  p: 1,
                  backgroundColor: 'action.selected',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'left', ml: 1 }}>
                  {`${window.location.origin}/download/${downloadLink}`}
                </Typography>
                <IconButton onClick={copyToClipboard} color="primary">
                  {isCopied ? <CheckCircle /> : <ContentCopy />}
                </IconButton>
              </Box>
              
              <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                Link expires in 24 hours
              </Typography>
            </Box>
          ) : isUploading ? (
            <Box>
              <CloudUpload color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Uploading {fileName}...
              </Typography>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
              />
              <Typography variant="body2">
                {uploadProgress}% completed
              </Typography>
            </Box>
          ) : (
            <Box>
              <CloudUpload color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Click here or drop files to upload
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports any file type up to 100MB
              </Typography>
            </Box>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default FileUpload;