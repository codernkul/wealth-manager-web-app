import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Slider,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Add,
  Remove,
  Upload,
  TrendingUp,
  AccountBalance,
  ShowChart,
  Savings,
  AttachMoney,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { portfolioService } from '../services/portfolioService';
import toast from 'react-hot-toast';

interface AssetAllocation {
  type: string;
  label: string;
  icon: React.ReactNode;
  percentage: number;
  targetValue: number;
}

interface FormData {
  name: string;
  description: string;
}

const schema = yup.object().shape({
  name: yup.string().required('Portfolio name is required'),
  description: yup.string(),
});

const assetTypes: AssetAllocation[] = [
  { type: 'cash', label: 'Cash', icon: <AttachMoney />, percentage: 20, targetValue: 0 },
  { type: 'stock', label: 'Equity', icon: <TrendingUp />, percentage: 30, targetValue: 0 },
  { type: 'etf', label: 'ETF', icon: <ShowChart />, percentage: 25, targetValue: 0 },
  { type: 'money_market', label: 'Money Market', icon: <Savings />, percentage: 15, targetValue: 0 },
  { type: 'mutual_fund', label: 'Mutual Fund', icon: <AccountBalance />, percentage: 10, targetValue: 0 },
];

const CreatePortfolio: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allocations, setAllocations] = useState<AssetAllocation[]>(assetTypes);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Holdings form state for direct input
  const [holdings, setHoldings] = useState([
    { symbol: '', name: '', asset_type: 'stock', quantity: 0, average_cost: 0, purchase_date: '' }
  ]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const steps = ['Basic Information', 'Add Holdings', 'Upload Holdings', 'Review & Create'];

  // Holdings form management functions
  const addNewHoldingRow = () => {
    setHoldings([...holdings, { symbol: '', name: '', asset_type: 'stock', quantity: 0, average_cost: 0, purchase_date: '' }]);
  };

  const removeHoldingRow = (index: number) => {
    setHoldings(holdings.filter((_, i) => i !== index));
  };

  const updateHoldingRow = (index: number, field: string, value: string | number) => {
    const updatedHoldings = [...holdings];
    updatedHoldings[index] = { ...updatedHoldings[index], [field]: value };
    setHoldings(updatedHoldings);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log('=== FORM SUBMISSION TRIGGERED ===');
    try {
      setLoading(true);
      setError('');

      console.log('=== PORTFOLIO CREATION DEBUG ===');
      console.log('Form data submitted:', data);
      console.log('User authenticated:', !!user);
      console.log('Holdings state:', holdings);

      // Convert holdings form data to portfolio format
      const validHoldings = holdings.filter(h => h.symbol && h.quantity && h.average_cost);
      console.log('Valid holdings:', validHoldings);
      
      if (validHoldings.length === 0) {
        console.log('ERROR: No valid holdings found');
        setError('Please add at least one holding with symbol, quantity, and average cost');
        setLoading(false);
        return;
      }

      const portfolioData = {
        name: data.name,
        description: data.description,
        holdings: validHoldings,
      };

      console.log('Creating portfolio with data:', portfolioData);
      console.log('Portfolio data JSON:', JSON.stringify(portfolioData, null, 2));
      
      try {
        const portfolio = await portfolioService.createPortfolio(portfolioData);
        console.log('Portfolio created successfully:', portfolio);
        
        // If there's an uploaded file, process it
        if (uploadedFile && portfolio.id) {
          try {
            const newHoldings = await portfolioService.uploadCSV(portfolio.id, uploadedFile);
            toast.success(`Successfully imported ${newHoldings.length} holdings from CSV!`);
          } catch (uploadError: any) {
            console.error('CSV upload error:', uploadError);
            // Don't fail the whole process if CSV upload fails
            setError('Portfolio created successfully, but CSV upload failed. You can add holdings manually.');
            toast.error('CSV upload failed. You can add holdings manually.');
          }
        }
        
        // Show success message and redirect
        toast.success(`Portfolio "${portfolio.name}" created successfully!`);
        navigate('/portfolios', { state: { message: `Portfolio "${portfolio.name}" created successfully!` } });
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        console.error('API Error Response:', apiError?.response);
        console.error('API Error Data:', apiError?.response?.data);
        
        // Show more detailed error to user
        const errorDetail = apiError?.response?.data?.detail || apiError?.message || 'Unknown error';
        setError(`API Error: ${errorDetail}`);
        toast.error(`Failed to create portfolio: ${errorDetail}`);
        throw apiError;
      }
    } catch (err: any) {
      console.error('=== PORTFOLIO CREATION FAILED ===');
      console.error('Error type:', typeof err);
      console.error('Error name:', err?.name);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      console.error('Full error object:', err);
      console.error('Error details:', {
        message: err?.message,
        response: err?.response,
        data: err?.response?.data,
        status: err?.response?.status,
      });
      
      const errorMessage = err?.response?.data?.detail || 
                           err?.message || 
                           err?.detail || 
                           'Failed to create portfolio';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to create portfolio');
      toast.error('Failed to create portfolio: ' + errorMessage);
    } finally {
      setLoading(false);
      console.log('=== PORTFOLIO CREATION PROCESS ENDED ===');
    }
  };

  // Debug function to test API directly
  const testDirectAPI = async () => {
    try {
      console.log('Testing direct API call...');
      const testData = {
        name: 'Debug Test Portfolio',
        description: 'Direct API test',
        holdings: [{
          symbol: 'CASH',
          asset_type: 'cash',
          name: 'Cash',
          quantity: 1,
          average_cost: 1000
        }]
      };
      const result = await portfolioService.createPortfolio(testData);
      console.log('Direct API test result:', result);
      toast.success('Direct API test successful!');
    } catch (error: any) {
      console.error('Direct API test error:', error);
      toast.error('Direct API test failed: ' + error?.message);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Portfolio Information
            </Typography>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Portfolio Name"
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Description"
                  margin="normal"
                  multiline
                  rows={3}
                />
              )}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Add Holdings
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enter your actual holdings. You can add multiple holdings at once.
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Asset Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Avg Cost</TableCell>
                    <TableCell>Purchase Date</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holdings.map((holding, index) => (
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
                          onChange={(e) => updateHoldingRow(index, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="100"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={holding.average_cost}
                          onChange={(e) => updateHoldingRow(index, 'average_cost', parseFloat(e.target.value) || 0)}
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
                        <IconButton 
                          onClick={() => removeHoldingRow(index)} 
                          color="error" 
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <Box sx={{ mt: 2 }}>
                <Button onClick={addNewHoldingRow} startIcon={<AddIcon />}>
                  Add Row
                </Button>
              </Box>
            </TableContainer>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Existing Holdings (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload a CSV file from your brokerage with columns: Symbol, Quantity, Cost Basis
            </Typography>
            
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'grey.50',
                },
              }}
              component="label"
            >
              <Upload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {uploadedFile ? uploadedFile.name : 'Drop CSV file here or click to browse'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported format: CSV
              </Typography>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </Box>
            
            {uploadedFile && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={uploadedFile.name}
                  onDelete={() => setUploadedFile(null)}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            )}
            
            <Alert severity="info" sx={{ mt: 2 }}>
              You can also add holdings manually after creating the portfolio.
            </Alert>
          </Box>
        );

      case 3:
        const validHoldings = holdings.filter(h => h.symbol && h.quantity && h.average_cost);
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Create Portfolio
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Portfolio Details
                </Typography>
                <Typography><strong>Name:</strong> {watch('name')}</Typography>
                <Typography><strong>Description:</strong> {watch('description') || 'None'}</Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Holdings ({validHoldings.length})
                </Typography>
                {validHoldings.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Symbol</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Asset Type</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Avg Cost</TableCell>
                          <TableCell align="right">Total Cost</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {validHoldings.map((holding, index) => (
                          <TableRow key={index}>
                            <TableCell>{holding.symbol}</TableCell>
                            <TableCell>{holding.name || holding.symbol}</TableCell>
                            <TableCell>
                              <Chip 
                                label={holding.asset_type.toUpperCase()} 
                                size="small" 
                                color="primary" 
                              />
                            </TableCell>
                            <TableCell align="right">{holding.quantity.toLocaleString()}</TableCell>
                            <TableCell align="right">${holding.average_cost.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              ${(holding.quantity * holding.average_cost).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">
                    No holdings added. Please add holdings in Step 2.
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            {uploadedFile && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Uploaded File
                  </Typography>
                  <Typography>{uploadedFile.name}</Typography>
                </CardContent>
              </Card>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Click "Create Portfolio" to finalize your portfolio. You'll be redirected to your portfolios page.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Create New Portfolio
          </Typography>
          <Button variant="outlined" onClick={testDirectAPI} size="small">
            Debug API
          </Button>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Typography variant="body2" sx={{ mb: 2, color: 'info.main' }}>
            Form Status: {errors.name ? 'Has Errors' : 'No Errors'}
          </Typography>
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(activeStep - 1)}
            >
              Back
            </Button>
            
            <Box>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(activeStep + 1)}
                  sx={{ ml: 2 }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  sx={{ ml: 2 }}
                >
                  {loading ? 'Creating...' : 'Create Portfolio'}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreatePortfolio;
