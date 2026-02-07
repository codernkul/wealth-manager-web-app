import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  TrendingUp,
  TrendingDown,
  Upload,
  Download,
} from '@mui/icons-material';
import { portfolioService, Portfolio, PortfolioSummary } from '../services/portfolioService';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const Portfolios: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; portfolio: Portfolio | null }>({
    open: false,
    portfolio: null,
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  // Show success message if coming from portfolio creation
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state]);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading portfolios...');
      const data = await portfolioService.getPortfolios();
      console.log('Portfolios loaded:', data);
      setPortfolios(data);
    } catch (err: any) {
      console.error('Error loading portfolios:', err);
      console.error('Error response:', err?.response);
      console.error('Error data:', err?.response?.data);
      setError(err?.response?.data?.detail || 'Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async (portfolio: Portfolio) => {
    try {
      await portfolioService.deletePortfolio(portfolio.id);
      toast.success(`Portfolio "${portfolio.name}" deleted successfully!`);
      setPortfolios(portfolios.filter(p => p.id !== portfolio.id));
      setDeleteDialog({ open: false, portfolio: null });
    } catch (err: any) {
      console.error('Error deleting portfolio:', err);
      toast.error(err?.response?.data?.detail || 'Failed to delete portfolio');
    }
  };

  const handleDownloadCSVTemplate = async () => {
    try {
      const csvContent = await portfolioService.getCSVTemplate();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio_template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV template downloaded successfully!');
    } catch (err: any) {
      console.error('Error downloading CSV template:', err);
      toast.error('Failed to download CSV template');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, portfolio: Portfolio) => {
    setMenuAnchor(event.currentTarget);
    setSelectedPortfolio(portfolio);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedPortfolio(null);
  };

  const handleEditPortfolio = (portfolio: Portfolio) => {
    navigate(`/portfolios/${portfolio.id}/edit`);
    handleMenuClose();
  };

  const handleViewDetails = (portfolio: Portfolio) => {
    navigate(`/portfolios/${portfolio.id}`);
    handleMenuClose();
  };

  const downloadCSVTemplate = async () => {
    try {
      const template = await portfolioService.getCSVTemplate();
      const blob = new Blob([template], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio_template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading template:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Your Portfolios</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadCSVTemplate}
          >
            Download Template
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-portfolio')}
          >
            Create Portfolio
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {portfolios.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No portfolios yet
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Create your first portfolio to start tracking your investments
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-portfolio')}
            sx={{ mt: 2 }}
          >
            Create Your First Portfolio
          </Button>
        </Box>
      ) : (
        <Box 
          display="grid" 
          gridTemplateColumns="repeat(auto-fit, minmax(350px, 1fr))" 
          gap={3}
        >
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} sx={{ position: 'relative' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {portfolio.name}
                    </Typography>
                    {portfolio.description && (
                      <Typography variant="body2" color="text.secondary">
                        {portfolio.description}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, portfolio)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h4" color="primary">
                    ${portfolio.total_value.toLocaleString()}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {portfolio.total_value > 0 && (
                      <Chip
                        icon={<TrendingUp />}
                        label="Positive"
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Holdings: {portfolio.holdings?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(portfolio.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  onClick={() => handleViewDetails(portfolio)}
                >
                  View Details
                </Button>
                <Button
                  size="small"
                  onClick={() => handleEditPortfolio(portfolio)}
                >
                  Edit
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewDetails(selectedPortfolio!)}>
          <Typography variant="inherit">View Details</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleEditPortfolio(selectedPortfolio!)}>
          <Typography variant="inherit">Edit Portfolio</Typography>
        </MenuItem>
        <MenuItem onClick={() => setDeleteDialog({ open: true, portfolio: selectedPortfolio })}>
          <Typography variant="inherit" color="error">
            Delete Portfolio
          </Typography>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, portfolio: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete Portfolio: {deleteDialog.portfolio?.name}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.portfolio?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, portfolio: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeletePortfolio(deleteDialog.portfolio!)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="create portfolio"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={() => navigate('/create-portfolio')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default Portfolios;
