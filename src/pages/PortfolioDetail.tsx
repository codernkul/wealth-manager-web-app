import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fab,
  Tooltip,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Menu,
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
  ArrowBack,
} from '@mui/icons-material';
import { portfolioService, Portfolio, Holding, PerformanceData } from '../services/portfolioService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState<any>(null);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog states
  const [addHoldingDialog, setAddHoldingDialog] = useState(false);
  const [editHoldingDialog, setEditHoldingDialog] = useState(false);
  const [deleteHoldingDialog, setDeleteHoldingDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<any>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Form states
  const [newHoldings, setNewHoldings] = useState([
    { symbol: '', name: '', asset_type: 'stock', quantity: '', average_cost: '', purchase_date: '' }
  ]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      loadPortfolioData();
    }
  }, [id]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError('');
      const portfolioData = await portfolioService.getPortfolio(parseInt(id!));
      const holdingsData = await portfolioService.getHoldings(parseInt(id!));
      setPortfolio(portfolioData);
      setHoldings(holdingsData);
    } catch (err: any) {
      console.error('Error loading portfolio data:', err);
      setError(err?.response?.data?.detail || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  // Holdings management functions
  const handleAddHolding = async () => {
    try {
      const validHoldings = newHoldings.filter(h => h.symbol && h.quantity && h.average_cost);
      
      for (const holding of validHoldings) {
        await portfolioService.createHolding(parseInt(id!), {
          symbol: holding.symbol.toUpperCase(),
          name: holding.name || holding.symbol,
          asset_type: holding.asset_type,
          quantity: parseFloat(holding.quantity),
          average_cost: parseFloat(holding.average_cost),
        });
      }
      
      toast.success(`Added ${validHoldings.length} holdings successfully!`);
      setAddHoldingDialog(false);
      setNewHoldings([{ symbol: '', name: '', asset_type: 'stock', quantity: '', average_cost: '', purchase_date: '' }]);
      loadPortfolioData();
    } catch (err: any) {
      console.error('Error adding holdings:', err);
      toast.error(err?.response?.data?.detail || 'Failed to add holdings');
    }
  };

  const handleUpdateHolding = async (holdingId: number, updateData: any) => {
    try {
      await portfolioService.updateHolding(parseInt(id!), holdingId, updateData);
      toast.success('Holding updated successfully!');
      setEditHoldingDialog(false);
      setSelectedHolding(null);
      loadPortfolioData();
    } catch (err: any) {
      console.error('Error updating holding:', err);
      toast.error(err?.response?.data?.detail || 'Failed to update holding');
    }
  };

  const handleDeleteHolding = async (holdingId: number) => {
    console.log('Deleting holding with ID:', holdingId);
    console.log('Selected holding:', selectedHolding);
    try {
      await portfolioService.deleteHolding(parseInt(id!), holdingId);
      toast.success('Holding deleted successfully!');
      setDeleteHoldingDialog(false);
      setSelectedHolding(null);
      loadPortfolioData();
    } catch (err: any) {
      console.error('Error deleting holding:', err);
      toast.error(err?.response?.data?.detail || 'Failed to delete holding');
    }
  };

  // Dialog close handlers
  const handleEditDialogClose = () => {
    setEditHoldingDialog(false);
    setSelectedHolding(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteHoldingDialog(false);
    setSelectedHolding(null);
  };

  const handleUploadCSV = async () => {
    if (!uploadFile) return;
    
    try {
      const newHoldings = await portfolioService.uploadCSV(parseInt(id!), uploadFile);
      toast.success(`Successfully imported ${newHoldings.length} holdings!`);
      setUploadDialog(false);
      setUploadFile(null);
      loadPortfolioData();
    } catch (err: any) {
      console.error('Error uploading CSV:', err);
      toast.error(err?.response?.data?.detail || 'Failed to upload CSV');
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const csvContent = await portfolioService.downloadCSV(parseInt(id!));
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio_${id}_holdings.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV template downloaded successfully!');
    } catch (err: any) {
      console.error('Error downloading CSV:', err);
      toast.error('Failed to download CSV');
    }
  };

  // Group holdings by asset type for organization with specific order and merging
  const getHoldingsByType = () => {
    if (!holdings || holdings.length === 0) return {};
    
    const typeOrder = ['stock', 'etf', 'mutual_fund', 'money_market', 'cash'];
    
    return holdings.reduce((acc: Record<string, any[]>, holding) => {
      let type = holding.asset_type || 'unknown';
      
      // Merge cash and money_market together
      if (type === 'money_market' || type === 'cash') {
        type = 'cash_and_money_market';
      }
      
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(holding);
      return acc;
    }, {} as Record<string, any[]>);
  };

  // Form management functions
  const addNewHoldingRow = () => {
    setNewHoldings([...newHoldings, { symbol: '', name: '', asset_type: 'stock', quantity: '', average_cost: '', purchase_date: '' }]);
  };

  const removeHoldingRow = (index: number) => {
    setNewHoldings(newHoldings.filter((_, i) => i !== index));
  };

  const updateHoldingRow = (index: number, field: string, value: string) => {
    const updatedHoldings = [...newHoldings];
    updatedHoldings[index] = { ...updatedHoldings[index], [field]: value };
    setNewHoldings(updatedHoldings);
  };

  // Menu functions for holdings
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, holding: any) => {
    setMenuAnchor(event.currentTarget);
    setSelectedHolding(holding);
  };

  const handleMenuClose = () => {
    // Only clear selectedHolding if no dialogs are open
    if (!editHoldingDialog && !deleteHoldingDialog) {
      setSelectedHolding(null);
    }
    setMenuAnchor(null);
  };

  const handleEditHolding = (holding: any) => {
    setSelectedHolding(holding);
    setEditHoldingDialog(true);
    handleMenuClose();
  };

  const handleDeleteHoldingClick = (holding: any) => {
    console.log('Delete holding clicked:', holding);
    setSelectedHolding(holding);
    setDeleteHoldingDialog(true);
    // Don't close menu here - let dialog handle it
  };

  const getSectionTitle = (type: string) => {
    switch (type) {
      case 'stock':
        return 'Equities';
      case 'etf':
        return 'ETFs & ETNs';
      case 'mutual_fund':
        return 'Mutual Funds';
      case 'cash_and_money_market':
        return 'Cash & Money Markets';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    }
  };

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case 'stock':
        return 'primary';
      case 'etf':
        return 'secondary';
      case 'mutual_fund':
        return 'info';
      case 'cash_and_money_market':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !portfolio) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Portfolio not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/portfolios')}
          sx={{ mr: 2 }}
        >
          Back to Portfolios
        </Button>
        <Typography variant="h4" flexGrow={1}>
          {portfolio?.name || 'Portfolio Details'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddHoldingDialog(true)}
        >
          Add Holding
        </Button>
      </Box>

      <Dialog open={addHoldingDialog} onClose={() => setAddHoldingDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Add Multiple Holdings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Add multiple holdings at once. Each row represents one holding.
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol *</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Asset Type *</TableCell>
                  <TableCell>Quantity *</TableCell>
                  <TableCell>Avg Cost *</TableCell>
                  <TableCell>Purchase Date</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {newHoldings.map((holding, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={holding.symbol}
                        onChange={(e) => updateHoldingRow(index, 'symbol', e.target.value)}
                        placeholder="AAPL"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={holding.name}
                        onChange={(e) => updateHoldingRow(index, 'name', e.target.value)}
                        placeholder="Apple Inc."
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={holding.asset_type}
                        onChange={(e) => updateHoldingRow(index, 'asset_type', e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="stock">Stock</MenuItem>
                        <MenuItem value="etf">ETF</MenuItem>
                        <MenuItem value="mutual_fund">Mutual Fund</MenuItem>
                        <MenuItem value="money_market">Money Market</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={holding.quantity}
                        onChange={(e) => updateHoldingRow(index, 'quantity', e.target.value)}
                        placeholder="100"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={holding.average_cost}
                        onChange={(e) => updateHoldingRow(index, 'average_cost', e.target.value)}
                        placeholder="150.00"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="date"
                        value={holding.purchase_date}
                        onChange={(e) => updateHoldingRow(index, 'purchase_date', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => removeHoldingRow(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2 }}>
            <Button onClick={addNewHoldingRow} startIcon={<AddIcon />}>
              Add Row
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddHoldingDialog(false)}>Cancel</Button>
          <Button onClick={handleAddHolding} variant="contained">
            Add Holdings
          </Button>
        </DialogActions>
      </Dialog>

      <Box 
        display="grid" 
        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" 
        gap={3}
        mb={3}
      >
        <Box>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Value
              </Typography>
              <Typography variant="h4">
                ${portfolio?.total_value?.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Gain/Loss
              </Typography>
              <Typography
                variant="h4"
                color={(portfolio?.total_gain_loss || 0) >= 0 ? 'success.main' : 'error.main'}
              >
                {(portfolio?.total_gain_loss || 0) >= 0 ? '+' : ''}
                ${(portfolio?.total_gain_loss || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Return %
              </Typography>
              <Typography
                variant="h4"
                color={(portfolio?.total_gain_loss_percent || 0) >= 0 ? 'success.main' : 'error.main'}
              >
                {(portfolio?.total_gain_loss_percent || 0) >= 0 ? '+' : ''}
                {(portfolio?.total_gain_loss_percent || 0).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Holdings
              </Typography>
              <Typography variant="h4">
                {holdings.length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Holdings Grouped by Type */}
      {Object.entries(getHoldingsByType())
        .sort(([typeA], [typeB]) => {
          const order = ['stock', 'etf', 'mutual_fund', 'cash_and_money_market'];
          const orderA = order.indexOf(typeA);
          const orderB = order.indexOf(typeB);
          return orderA - orderB;
        })
        .map(([type, typeHoldings]) => (
        <Box key={type} sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {getSectionTitle(type)} 
            <Chip 
              label={typeHoldings.length} 
              size="small" 
              color={getAssetTypeColor(type)} 
              sx={{ ml: 1 }}
            />
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Price Change $|%</TableCell>
                  <TableCell align="right">Market Value</TableCell>
                  <TableCell align="right">Day Change $|%</TableCell>
                  <TableCell align="right">Cost Basis</TableCell>
                  <TableCell align="right">Gain $|%</TableCell>
                  <TableCell align="right">% of Holdings</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {typeHoldings.map((holding: any) => (
                  <TableRow key={holding.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {holding.symbol || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>{holding.name || holding.symbol || 'N/A'}</TableCell>
                    <TableCell align="right">
                      {holding.quantity?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell align="right">
                      ${holding.current_price?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        color={(holding.unrealized_gain_loss_percent || 0) >= 0 ? 'success.main' : 'error.main'}
                      >
                        {holding.current_price && holding.average_cost ? 
                          `${((holding.current_price - holding.average_cost) / holding.average_cost * 100).toFixed(2)}%` : 
                          '0.00%'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      ${holding.current_value?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        color={(holding.unrealized_gain_loss || 0) >= 0 ? 'success.main' : 'error.main'}
                      >
                        ${(holding.unrealized_gain_loss || 0).toFixed(2)} | {(holding.unrealized_gain_loss_percent || 0).toFixed(2)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      ${(holding.quantity * holding.average_cost)?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        color={(holding.unrealized_gain_loss || 0) >= 0 ? 'success.main' : 'error.main'}
                      >
                        ${(holding.unrealized_gain_loss || 0).toFixed(2)} | {(holding.unrealized_gain_loss_percent || 0).toFixed(2)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {holding.allocation_percent?.toFixed(1) || '0.0'}%
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, holding)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

      {/* Holdings Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditHolding(selectedHolding!)}>
          <Typography variant="inherit">Edit Holding</Typography>
        </MenuItem>
        <MenuItem onClick={() => {
              console.log('Menu item clicked - Delete Holding, selectedHolding:', selectedHolding);
              handleDeleteHoldingClick(selectedHolding!);
            }}>
              <Typography variant="inherit" color="error">Delete Holding</Typography>
            </MenuItem>
      </Menu>

      {/* Edit Holding Dialog */}
      <Dialog open={editHoldingDialog} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Holding</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
            <TextField
              label="Symbol"
              value={selectedHolding?.symbol || ''}
              onChange={(e) => setSelectedHolding({...selectedHolding, symbol: e.target.value})}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Name"
              value={selectedHolding?.name || ''}
              onChange={(e) => setSelectedHolding({...selectedHolding, name: e.target.value})}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Asset Type"
              select
              value={selectedHolding?.asset_type || 'stock'}
              onChange={(e) => setSelectedHolding({...selectedHolding, asset_type: e.target.value})}
              fullWidth
              margin="normal"
            >
              <MenuItem value="stock">Stock</MenuItem>
              <MenuItem value="etf">ETF</MenuItem>
              <MenuItem value="mutual_fund">Mutual Fund</MenuItem>
              <MenuItem value="money_market">Money Market</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
            </TextField>
            <TextField
              label="Quantity"
              type="number"
              value={selectedHolding?.quantity || ''}
              onChange={(e) => setSelectedHolding({...selectedHolding, quantity: parseFloat(e.target.value)})}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Average Cost"
              type="number"
              value={selectedHolding?.average_cost || ''}
              onChange={(e) => setSelectedHolding({...selectedHolding, average_cost: parseFloat(e.target.value)})}
              fullWidth
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditHoldingDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedHolding && handleUpdateHolding(selectedHolding.id, {
              symbol: selectedHolding.symbol,
              name: selectedHolding.name,
              asset_type: selectedHolding.asset_type,
              quantity: selectedHolding.quantity,
              average_cost: selectedHolding.average_cost,
            })} 
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Holding Dialog */}
      <Dialog open={deleteHoldingDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Holding</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedHolding?.symbol || 'this holding'}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button 
            onClick={() => {
              console.log('Delete button clicked, selectedHolding:', selectedHolding);
              if (selectedHolding && selectedHolding.id) {
                console.log('Calling handleDeleteHolding with ID:', selectedHolding.id);
                handleDeleteHolding(selectedHolding.id);
              }
            }} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PortfolioDetail;
