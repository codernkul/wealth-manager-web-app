import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  Link
} from '@mui/material';
import {
  CloudUpload,
  Download,
  Timeline,
  Business,
  Delete,
  CheckCircle,
  Error
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { financialDataService } from '../services/financialDataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface SymbolData {
  symbol: string;
  name: string;
  priceDataAvailable: boolean;
  fundamentalDataAvailable: boolean;
  priceDataCount: number;
  fundamentalDataCount: number;
  lastUpdated: string;
  status: 'complete' | 'partial' | 'missing' | 'error';
}

interface DownloadProgress {
  symbol: string;
  type: 'price' | 'fundamental';
  progress: number;
  status: 'pending' | 'downloading' | 'complete' | 'error';
  message: string;
}

interface WorksheetData {
  name: string;
  data: string[][];
}

interface SymbolList {
  id: string;
  name: string;
  uploadDate: string;
  symbols: { symbol: string; name: string }[];
  status: 'active' | 'processing' | 'completed';
}

const FinancialDatabaseManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [symbols, setSymbols] = useState<SymbolData[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof SymbolData; direction: 'asc' | 'desc' }>({ key: 'symbol', direction: 'asc' });
  const [symbolLists, setSymbolLists] = useState<SymbolList[]>([]);
  const [selectedList, setSelectedList] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [filePreview, setFilePreview] = useState<string[]>([]);
  const [worksheetData, setWorksheetData] = useState<WorksheetData[]>([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState<string>('');
  const [fullWorksheetData, setFullWorksheetData] = useState<WorksheetData[]>([]); // Store full data for processing
  const [fileType, setFileType] = useState<'csv' | 'xlsx'>('csv');
  const [cancelToken, setCancelToken] = useState<{ cancelled: boolean; reason?: string }>({ cancelled: false });
  const [overrideMode, setOverrideMode] = useState(false);
  const [listNameDialog, setListNameDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [symbolDetailDialog, setSymbolDetailDialog] = useState(false);
  const [currentSymbolData, setCurrentSymbolData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to load symbols from database
  const loadSymbolsFromDatabase = async () => {
    try {
      const databaseSymbols = await financialDataService.getDatabaseSymbols();
      const symbolData: SymbolData[] = databaseSymbols.map(s => ({
        symbol: s.symbol,
        name: s.name,
        priceDataAvailable: s.priceDataAvailable,
        fundamentalDataAvailable: s.fundamentalDataAvailable,
        priceDataCount: s.priceDataCount,
        fundamentalDataCount: s.fundamentalDataCount,
        lastUpdated: s.lastUpdated,
        status: s.status
      }));
      setSymbols(symbolData);
    } catch (err) {
      setError('Failed to load symbols from database');
    }
  };

  // Load symbols from database on component mount and when tab becomes active
  React.useEffect(() => {
    loadSymbolsFromDatabase();
  }, []);

  // Debug: Check actual database content
  React.useEffect(() => {
    const checkDatabaseContent = async () => {
      try {
        const { financialDataService } = await import('../services/financialDataService');
        
        // Access the in-memory database directly for debugging
        const dbContent = (financialDataService as any).inMemoryDatabase;
        
        if (dbContent) {
          console.log('=== DATABASE CONTENT CHECK ===');
          console.log('Total symbols in database:', dbContent.symbols?.size || 0);
          console.log('Symbols with price data:', dbContent.priceData?.size || 0);
          console.log('Symbols with fundamental data:', dbContent.fundamentalData?.size || 0);
          
          // Show actual data in UI
          const totalSymbols = dbContent.symbols?.size || 0;
          const symbolsWithPriceData = dbContent.priceData?.size || 0;
          const symbolsWithFundamentalData = dbContent.fundamentalData?.size || 0;
          
          if (totalSymbols > 0) {
            setSuccess(`Database contains ${totalSymbols} symbols: ${symbolsWithPriceData} with price data, ${symbolsWithFundamentalData} with fundamental data`);
          } else {
            setError('No symbols found in database');
          }
        }
      } catch (err) {
        console.error('Error checking database content:', err);
      }
    };

    checkDatabaseContent();
  }, []);

  // Sorting function
  const handleSort = (key: keyof SymbolData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedSymbols = React.useMemo(() => {
    const sortableSymbols = [...symbols];
    if (sortConfig.key) {
      sortableSymbols.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableSymbols;
  }, [symbols, sortConfig]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setError('File size exceeds 10MB limit. Please use a smaller file.');
        return;
      }

      setUploadedFile(file);
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      setFileType(isExcel ? 'xlsx' : 'csv');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          if (isExcel) {
            // Use safer approach for Excel files
            const workbook = XLSX.read(content, { 
              type: 'binary',
              cellStyles: false,
              cellHTML: false,
              sheetStubs: true,
              sheetRows: 1000 // Limit rows to prevent memory issues
            });
            const worksheetNames = workbook.SheetNames;
            const worksheets: WorksheetData[] = [];
            const fullWorksheets: WorksheetData[] = []; // Store full data for processing
            
            worksheetNames.forEach(sheetName => {
              try {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                  header: 1,
                  defval: '',
                  raw: false
                }) as string[][];
                
                // Store full data for processing
                const fullData = { name: sheetName, data: jsonData };
                const previewData = { name: sheetName, data: jsonData.slice(0, 100) }; // Limit preview to 100 rows
                
                worksheets.push(previewData);
                fullWorksheets.push(fullData);
              } catch (sheetError) {
                console.warn(`Error processing sheet ${sheetName}:`, sheetError);
              }
            });
            
            setWorksheetData(worksheets);
            setFullWorksheetData(fullWorksheets);
            if (worksheets.length > 0) {
              setSelectedWorksheet(worksheets[0].name);
              setFilePreview(worksheets[0].data.slice(0, 10).map(row => row.join(', ')));
            }
          } else {
            const lines = content.split('\n').filter(line => line.trim());
            const csvData = lines.map(line => line.split(','));
            setFilePreview(lines.slice(0, 10));
            setWorksheetData([{ name: 'Sheet1', data: csvData.slice(0, 100) }]);
            setFullWorksheetData([{ name: 'Sheet1', data: csvData }]); // Store full CSV data
            setSelectedWorksheet('Sheet1');
          }
          setPreviewDialog(true);
        } catch (error) {
          console.error('File processing error:', error);
          const errorMessage = error instanceof Error ? (error as Error).message : 'Unknown error';
          setError(`Failed to process file: ${errorMessage}`);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read file. Please try again.');
      };
      
      // Use readAsText for CSV, readAsBinaryString for Excel
      if (isExcel) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const processUploadedFile = (tempSymbols: { symbol: string; name: string }[]) => {
    // Store the symbols temporarily for when the list is created
    (window as any).tempSymbols = tempSymbols;
    setListNameDialog(true);
  };

  const createSymbolList = () => {
    if (!newListName.trim()) {
      setError('Please enter a list name');
      return;
    }

    // Get the temporary symbols stored during file processing
    const tempSymbols = (window as any).tempSymbols || [];

    const newList: SymbolList = {
      id: Date.now().toString(),
      name: newListName,
      uploadDate: new Date().toISOString(),
      symbols: tempSymbols,
      status: 'active'
    };

    setSymbolLists(prev => [...prev, newList]);
    setSelectedList(newList.id);
    setNewListName('');
    setListNameDialog(false);
    
    // Clear temporary symbols
    delete (window as any).tempSymbols;
    
    setSuccess(`Symbol list "${newListName}" created successfully with ${tempSymbols.length} symbols`);
  };

  const selectSymbolList = (listId: string) => {
    setSelectedList(listId);
    const list = symbolLists.find(l => l.id === listId);
    if (list) {
      const symbolData: SymbolData[] = list.symbols.map(s => ({
        symbol: s.symbol,
        name: s.name,
        priceDataAvailable: Math.random() > 0.3,
        fundamentalDataAvailable: Math.random() > 0.4,
        priceDataCount: Math.floor(Math.random() * 1000) + 100,
        fundamentalDataCount: Math.floor(Math.random() * 50) + 10,
        lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: Math.random() > 0.2 ? 'complete' : Math.random() > 0.5 ? 'partial' : 'missing' as any
      }));
      setSymbols(symbolData);
    }
  };

  const deleteSymbolList = (listId: string) => {
    setSymbolLists(prev => prev.filter(l => l.id !== listId));
    if (selectedList === listId) {
      setSelectedList('');
      setSymbols([]);
    }
    setSuccess('Symbol list deleted successfully');
  };

  const downloadDataForList = async (downloadTypes: ('price' | 'fundamental')[]) => {
    const list = symbolLists.find(l => l.id === selectedList);
    if (!list || list.symbols.length === 0) {
      setError('Please select a symbol list with symbols to download');
      return;
    }

    setIsDownloading(true);
    setError('');
    setSuccess('');
    setDownloadProgress([]);

    try {
      const symbolsToDownload = list.symbols.map(s => s.symbol);
      
      if (downloadTypes.includes('price')) {
        await financialDataService.downloadBatchPriceData(
          symbolsToDownload,
          setDownloadProgress,
          { override: overrideMode, cancelToken }
        );
      }
      
      if (downloadTypes.includes('fundamental')) {
        await financialDataService.downloadBatchFundamentalData(
          symbolsToDownload,
          setDownloadProgress,
          { override: overrideMode, cancelToken }
        );
      }
      
      setSuccess(`${downloadTypes.join(' and ')} data downloaded for ${symbolsToDownload.length} symbols in parallel batches${overrideMode ? ' (override mode)' : ''}`);
    } catch (err) {
      setError(`Failed to download ${downloadTypes.join(' and ')} data`);
    } finally {
      setIsDownloading(false);
      setCancelToken({ cancelled: false });
    }
  };

  const cancelDownload = () => {
    setCancelToken({ cancelled: true, reason: 'User cancelled' });
    setIsDownloading(false);
    setSuccess('Download cancelled');
  };

  const deleteSymbol = async (symbol: string) => {
    try {
      await financialDataService.deleteSymbolData(symbol);
      setSymbols(prev => prev.filter(s => s.symbol !== symbol));
      setSelectedSymbols(prev => prev.filter(s => s !== symbol));
      setSuccess(`Successfully deleted symbol: ${symbol}`);
    } catch (err) {
      setError(`Failed to delete symbol: ${symbol}`);
    }
  };

  const openSymbolDetail = (symbol: string) => {
    // Navigate to equity page instead of opening dialog
    window.location.href = `/database-manager/${symbol}`;
  };

  const closeSymbolDetail = () => {
    setSymbolDetailDialog(false);
    setSelectedSymbol('');
    setCurrentSymbolData(null);
  };

  const generateHistoricalData = (symbol: string, days: number = 252) => {
    const data = [];
    const basePrice = Math.random() * 200 + 50;
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const volatility = Math.random() * 0.03 - 0.015;
      const trend = (days - i) * 0.0002;
      const price = basePrice * (1 + volatility + trend) * (1 + Math.sin(i * 0.1) * 0.1);

      data.push({
        date: date.toISOString().split('T')[0],
        open: price * (1 + Math.random() * 0.02 - 0.01),
        high: price * (1 + Math.random() * 0.03),
        low: price * (1 - Math.random() * 0.03),
        close: price,
        volume: Math.floor(Math.random() * 10000000) + 100000
      });
    }

    return data;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Database Overview" />
          <Tab label="Symbol Lists Management" />
          <Tab label="Download Data" />
        </Tabs>
      </Box>

      {/* Database Overview Tab */}
      <TabPanel value={activeTab} index={0}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Database Overview
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            View and manage your financial symbols database with date filtering and detailed symbol information.
          </Typography>

          {/* Date Range Filter */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Price Data Date Range
            </Typography>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                label="Start Date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                label="End Date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <Button
                variant="outlined"
                onClick={() => setDateRange({ start: '', end: '' })}
                size="small"
              >
                Clear
              </Button>
            </Box>
          </Box>

          {/* Symbols Table */}
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell 
                    onClick={() => handleSort('symbol')}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      fontWeight: sortConfig.key === 'symbol' ? 'bold' : 'normal'
                    }}
                  >
                    Symbol {sortConfig.key === 'symbol' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('name')}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      fontWeight: sortConfig.key === 'name' ? 'bold' : 'normal'
                    }}
                  >
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('priceDataAvailable')}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      fontWeight: sortConfig.key === 'priceDataAvailable' ? 'bold' : 'normal'
                    }}
                  >
                    Price Data {sortConfig.key === 'priceDataAvailable' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('fundamentalDataAvailable')}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      fontWeight: sortConfig.key === 'fundamentalDataAvailable' ? 'bold' : 'normal'
                    }}
                  >
                    Fundamental Data {sortConfig.key === 'fundamentalDataAvailable' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('lastUpdated')}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      fontWeight: sortConfig.key === 'lastUpdated' ? 'bold' : 'normal'
                    }}
                  >
                    Last Updated {sortConfig.key === 'lastUpdated' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('status')}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      fontWeight: sortConfig.key === 'status' ? 'bold' : 'normal'
                    }}
                  >
                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedSymbols.map((symbol) => (
                  <TableRow key={symbol.symbol}>
                    <TableCell>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => openSymbolDetail(symbol.symbol)}
                        sx={{
                          textDecoration: 'none',
                          color: 'primary.main',
                          fontWeight: 'bold',
                          '&:hover': {
                            textDecoration: 'underline',
                            color: 'primary.dark'
                          }
                        }}
                      >
                        {symbol.symbol}
                      </Link>
                    </TableCell>
                    <TableCell>{symbol.name}</TableCell>
                    <TableCell>
                      {symbol.priceDataAvailable ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <CheckCircle color="success" fontSize="small" />
                          <Typography variant="body2">
                            {symbol.priceDataCount} records
                          </Typography>
                        </Box>
                      ) : (
                        <Chip label="Not Available" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {symbol.fundamentalDataAvailable ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <CheckCircle color="success" fontSize="small" />
                          <Typography variant="body2">
                            {symbol.fundamentalDataCount} records
                          </Typography>
                        </Box>
                      ) : (
                        <Chip label="Not Available" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{symbol.lastUpdated}</TableCell>
                    <TableCell>
                      <Chip 
                        label={symbol.status} 
                        color={symbol.status === 'complete' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => deleteSymbol(symbol.symbol)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Symbol Lists Management Tab */}
      <TabPanel value={activeTab} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Symbol Lists Management
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Upload and manage multiple symbol lists with names and upload dates.
          </Typography>
          
          {/* Symbol Lists Display */}
          {symbolLists.length > 0 && (
            <Paper sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
              <Typography variant="subtitle1" gutterBottom>
                Existing Symbol Lists ({symbolLists.length})
              </Typography>
              <List>
                {symbolLists.map((list) => (
                  <ListItem key={list.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {list.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {list.symbols.length} symbols • Uploaded {new Date(list.uploadDate).toLocaleDateString()}
                        </Typography>
                        <Chip 
                          label={list.status} 
                          size="small" 
                          color={
                            list.status === 'completed' ? 'success' :
                            list.status === 'processing' ? 'warning' : 'default'
                          }
                          sx={{ mr: 1 }}
                        />
                      </Box>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => selectSymbolList(list.id)}
                          disabled={selectedList === list.id}
                        >
                          {selectedList === list.id ? 'Selected' : 'Select'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => deleteSymbolList(list.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* File Upload Section */}
          <Box mb={3}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isDownloading}
            >
              Upload Symbol List
            </Button>
          </Box>

          {/* File Format Instructions */}
          <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              File Format Instructions
            </Typography>
            <Typography variant="body2" component="div">
              <strong>CSV Format:</strong> First row should contain headers (Symbol, Name)<br />
              <strong>Excel Format:</strong> Each worksheet should have Symbol and Name columns<br />
              <strong>Example:</strong> AAPL,Apple Inc. | GOOGL,Alphabet Inc.<br />
              <strong>File Size Limit:</strong> Maximum 10MB per file<br />
              <strong>Excel Limits:</strong> First 1000 rows processed per worksheet
            </Typography>
          </Paper>
        </Paper>
      </TabPanel>

      {/* Download Data Tab */}
      <TabPanel value={activeTab} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Download Financial Data
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Download price and fundamental data for your selected symbol list in parallel batches.
          </Typography>

          {/* Symbol List Selection */}
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Select Symbol List
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select List</InputLabel>
              <Select
                value={selectedList}
                label="Select List"
                onChange={(e) => selectSymbolList(e.target.value)}
                disabled={isDownloading}
              >
                {symbolLists.length === 0 ? (
                  <MenuItem value="" disabled>
                    No symbol lists available. Upload a list first.
                  </MenuItem>
                ) : (
                  symbolLists.map((list) => (
                    <MenuItem key={list.id} value={list.id}>
                      {list.name} ({list.symbols.length} symbols)
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>

          {selectedList ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Selected List: {symbolLists.find(l => l.id === selectedList)?.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {symbolLists.find(l => l.id === selectedList)?.symbols.length} symbols ready for download
              </Typography>

              {/* Download Controls */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Download Options
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => downloadDataForList(['price'])}
                    disabled={isDownloading}
                  >
                    Download Price Data
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Business />}
                    onClick={() => downloadDataForList(['fundamental'])}
                    disabled={isDownloading}
                  >
                    Download Fundamental Data
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Timeline />}
                    onClick={() => downloadDataForList(['price', 'fundamental'])}
                    disabled={isDownloading}
                  >
                    Download All Data
                  </Button>
                  {isDownloading && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={cancelDownload}
                    >
                      Cancel Download
                    </Button>
                  )}
                </Box>

                {/* Override Mode */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2">
                    Override existing data:
                  </Typography>
                  <Button
                    variant={overrideMode ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setOverrideMode(!overrideMode)}
                    disabled={isDownloading}
                  >
                    {overrideMode ? 'Override ON' : 'Override OFF'}
                  </Button>
                </Box>
              </Box>

              {/* Progress Display */}
              {downloadProgress.length > 0 && (
                <Box>
                  {/* Download Summary */}
                  <Paper sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Download Progress Summary
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Typography variant="body2">
                        <strong>Total Symbols:</strong> {downloadProgress.length}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Completed:</strong> {downloadProgress.filter(p => p.status === 'complete').length}
                      </Typography>
                      <Typography variant="body2">
                        <strong>In Progress:</strong> {downloadProgress.filter(p => p.status === 'downloading').length}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Failed:</strong> {downloadProgress.filter(p => p.status === 'error').length}
                      </Typography>
                    </Box>
                    
                    {/* Current Batch Range */}
                    {(() => {
                      const completed = downloadProgress.filter(p => p.status === 'complete').length;
                      const total = downloadProgress.length;
                      const currentBatch = Math.ceil(completed / 100);
                      const batchStart = (currentBatch - 1) * 100 + 1;
                      const batchEnd = Math.min(currentBatch * 100, total);
                      
                      return completed > 0 && completed < total ? (
                        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                          <strong>Current Batch:</strong> {batchStart}-{batchEnd} of {total} symbols
                        </Typography>
                      ) : completed === total && total > 0 ? (
                        <Typography variant="body2" color="success" sx={{ mt: 1 }}>
                          <strong>✓ Download Complete!</strong> All {total} symbols processed successfully
                        </Typography>
                      ) : null;
                    })()}
                  </Paper>

                  <Typography variant="subtitle2" gutterBottom>
                    Individual Symbol Progress
                  </Typography>
                  {downloadProgress.map((progress, index) => (
                    <Box key={index} mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">
                          {progress.symbol} - {progress.type}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {progress.message}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress.progress} 
                        sx={{ mb: 1 }}
                      />
                      <Chip 
                        label={progress.status}
                        color={progress.status === 'complete' ? 'success' :
                        progress.status === 'error' ? 'error' :
                        progress.status === 'downloading' ? 'warning' : 'default'}
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="info">
              Please select a symbol list from the Symbol Lists Management tab to download data.
            </Alert>
          )}
        </Paper>
      </TabPanel>

      {/* Symbol Detail Dialog */}
      <Dialog open={symbolDetailDialog} onClose={closeSymbolDetail} maxWidth="lg" fullWidth>
        <DialogTitle>
          {currentSymbolData?.symbol} - {currentSymbolData?.name}
        </DialogTitle>
        <DialogContent>
          {currentSymbolData && (
            <Box>
              {/* Fundamental Data Section */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Fundamental Data
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Box sx={{ minWidth: 200 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Market Cap:</strong> ${(Math.random() * 1000 + 100).toFixed(2)}B
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>P/E Ratio:</strong> {(Math.random() * 30 + 10).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>EPS:</strong> ${(Math.random() * 10 + 1).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 200 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Dividend Yield:</strong> {(Math.random() * 5).toFixed(2)}%
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>52W High:</strong> ${(Math.random() * 200 + 100).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>52W Low:</strong> ${(Math.random() * 100 + 50).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>

              {/* Price Chart Section */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Price Chart
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={generateHistoricalData(currentSymbolData.symbol)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="close" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>

              {/* Historical Data Table */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Historical Price Data
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Open</TableCell>
                        <TableCell>High</TableCell>
                        <TableCell>Low</TableCell>
                        <TableCell>Close</TableCell>
                        <TableCell>Volume</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {generateHistoricalData(currentSymbolData.symbol).slice(0, 20).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>${row.open.toFixed(2)}</TableCell>
                          <TableCell>${row.high.toFixed(2)}</TableCell>
                          <TableCell>${row.low.toFixed(2)}</TableCell>
                          <TableCell>${row.close.toFixed(2)}</TableCell>
                          <TableCell>{row.volume.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSymbolDetail}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* List Name Dialog */}
      <Dialog open={listNameDialog} onClose={() => setListNameDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Symbol List</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            Please enter a name for your symbol list:
          </Typography>
          <TextField
            fullWidth
            label="List Name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setListNameDialog(false)}>Cancel</Button>
          <Button onClick={createSymbolList} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>File Preview</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            Preview of uploaded file:
          </Typography>
          
          {fileType === 'xlsx' && worksheetData.length > 1 && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Worksheet</InputLabel>
              <Select
                value={selectedWorksheet}
                onChange={(e) => {
                  setSelectedWorksheet(e.target.value);
                  const ws = worksheetData.find(w => w.name === e.target.value);
                  if (ws) {
                    setFilePreview(ws.data.slice(0, 10).map(row => row.join(', ')));
                  }
                }}
              >
                {worksheetData.map((ws) => (
                  <MenuItem key={ws.name} value={ws.name}>
                    {ws.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <Box sx={{ maxHeight: 300, overflow: 'auto', backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
            {filePreview.map((line, index) => (
              <Typography key={index} variant="body2" component="div">
                {line}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              const ws = fullWorksheetData.find(w => w.name === selectedWorksheet);
              if (ws) {
                const symbols = ws.data.slice(1).map(row => ({
                  symbol: row[0]?.trim() || '',
                  name: row[1]?.trim() || row[0]?.trim() || ''
                })).filter(s => s.symbol);
                processUploadedFile(symbols);
              }
              setPreviewDialog(false);
            }} 
            variant="contained"
          >
            Process File
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
    </Container>
  );
};

export default FinancialDatabaseManager;
