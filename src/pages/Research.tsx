import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  TextField,
  IconButton,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Link,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Timeline,
  Assessment,
  Analytics,
  AddShoppingCart,
  RemoveShoppingCart,
  ZoomIn,
  ZoomOut,
  Refresh,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from 'recharts';
import { portfolioService, Portfolio, Holding } from '../services/portfolioService';
import { useNavigate } from 'react-router-dom';

interface Recommendation {
  symbol: string;
  name: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  confidence: number;
  reason: string;
  timeframe: 'SHORT' | 'MEDIUM' | 'LONG';
  technicalIndicators: {
    rsi: number;
    macd: number;
    bollinger: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL';
    support: number;
    resistance: number;
  };
}

interface ChartData {
  date: string;
  price: number;
  volume: number;
  ma20: number;
  ma50: number;
  upperBand: number;
  lowerBand: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`research-tabpanel-${index}`}
      aria-labelledby={`research-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Research: React.FC = () => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedSecurities, setSelectedSecurities] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [filteredChartData, setFilteredChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [chartDomain, setChartDomain] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    filterChartData();
  }, [chartData, startDate, endDate, chartDomain]);

  const filterChartData = () => {
    if (!startDate || !endDate || chartData.length === 0) {
      setFilteredChartData(chartData);
      return;
    }

    let filtered = chartData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });

    // Apply zoom/domain filtering if set
    if (chartDomain) {
      const startIndex = Math.floor(chartDomain.start);
      const endIndex = Math.ceil(chartDomain.end);
      filtered = filtered.slice(startIndex, endIndex + 1);
    }

    setFilteredChartData(filtered);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setChartDomain(null);
  };

  const handleBrushChange = (domain: any) => {
    if (domain && domain.startIndex !== undefined && domain.endIndex !== undefined) {
      setChartDomain({ start: domain.startIndex, end: domain.endIndex });
    }
  };

  const handleDateRangeChange = () => {
    if (startDate && endDate) {
      filterChartData();
    }
  };

  const loadPortfolios = async () => {
    try {
      const portfoliosData = await portfolioService.getPortfolios();
      setPortfolios(portfoliosData);
    } catch (err) {
      setError('Failed to load portfolios');
    }
  };

  const loadPortfolioHoldings = async (portfolioId: number) => {
    try {
      const portfolioData = await portfolioService.getPortfolio(portfolioId);
      setHoldings(portfolioData.holdings || []);
      
      // Auto-select all securities initially
      const allSymbols = new Set((portfolioData.holdings || []).map(h => h.symbol));
      setSelectedSecurities(allSymbols);
    } catch (err) {
      setError('Failed to load portfolio holdings');
    }
  };

  const handlePortfolioChange = (portfolioId: number) => {
    setSelectedPortfolio(portfolioId);
    setSelectedSecurities(new Set());
    setRecommendations([]);
    setChartData([]);
    setFilteredChartData([]);
    if (portfolioId) {
      loadPortfolioHoldings(portfolioId);
    }
  };

  const handleSecurityToggle = (symbol: string) => {
    const newSelected = new Set(selectedSecurities);
    if (newSelected.has(symbol)) {
      newSelected.delete(symbol);
    } else {
      newSelected.add(symbol);
    }
    setSelectedSecurities(newSelected);
  };

  const handleSelectAllSecurities = () => {
    const allSymbols = new Set(holdings.map(h => h.symbol));
    setSelectedSecurities(allSymbols);
  };

  const handleDeselectAllSecurities = () => {
    setSelectedSecurities(new Set());
  };

  const handleSymbolClick = (symbol: string) => {
    // Navigate to symbol analysis page (Technical + Fundamental)
    navigate(`/analysis/${symbol}`);
  };

  const handleSymbolClickInChart = (symbol: string) => {
    setSelectedSymbol(symbol);
    // Also navigate to detailed analysis
    navigate(`/analysis/${symbol}`);
  };

  const runAnalysis = async () => {
    if (!selectedPortfolio) {
      setError('Please select a portfolio to analyze');
      return;
    }

    if (selectedSecurities.size === 0) {
      setError('Please select at least one security to analyze');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock API call - replace with actual analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate recommendations based on selected securities
      const mockRecommendations: Recommendation[] = Array.from(selectedSecurities).map(symbol => {
        const holding = holdings.find(h => h.symbol === symbol);
        const currentPrice = holding?.current_price || 100 + Math.random() * 100;
        
        // Generate mock technical analysis
        const rsi = Math.random() * 100;
        let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
        let reason = '';
        
        if (rsi < 30) {
          action = 'BUY';
          reason = 'RSI oversold, approaching support level, buy-the-dip opportunity';
        } else if (rsi > 70) {
          action = 'SELL';
          reason = 'RSI overbought, approaching resistance, profit-taking opportunity';
        } else {
          reason = 'Neutral RSI, trading in range, wait for clear breakout';
        }

        return {
          symbol,
          name: holding?.name || symbol,
          action,
          currentPrice,
          targetPrice: currentPrice * (action === 'BUY' ? 1.1 : action === 'SELL' ? 0.9 : 1.05),
          stopLoss: currentPrice * (action === 'BUY' ? 0.95 : action === 'SELL' ? 1.05 : 0.97),
          confidence: Math.floor(Math.random() * 40) + 60,
          reason,
          timeframe: 'MEDIUM' as const,
          technicalIndicators: {
            rsi,
            macd: (Math.random() - 0.5) * 10,
            bollinger: rsi < 30 ? 'OVERSOLD' : rsi > 70 ? 'OVERBOUGHT' : 'NEUTRAL',
            support: currentPrice * 0.95,
            resistance: currentPrice * 1.05,
          },
        };
      });

      setRecommendations(mockRecommendations);

      // Generate mock chart data for selected securities
      const mockChartData: ChartData[] = [];
      const daysToGenerate = 90;
      
      for (let i = daysToGenerate; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dataPoint: any = {
          date: date.toLocaleDateString(),
        };
        
        // Generate price data for each selected security
        Array.from(selectedSecurities).forEach(symbol => {
          const holding = holdings.find(h => h.symbol === symbol);
          const basePrice = holding?.current_price || 100;
          const price = basePrice + (Math.random() - 0.5) * 20 + Math.sin(i / 10) * 5;
          dataPoint[symbol] = price;
        });
        
        // Add volume and indicators for first security
        if (selectedSecurities.size > 0) {
          const firstSymbol = Array.from(selectedSecurities)[0];
          const basePrice = holdings.find(h => h.symbol === firstSymbol)?.current_price || 100;
          dataPoint.volume = Math.floor(Math.random() * 10000000) + 5000000;
          dataPoint[`${firstSymbol}_ma20`] = dataPoint[firstSymbol] + (Math.random() - 0.5) * 5;
          dataPoint[`${firstSymbol}_ma50`] = dataPoint[firstSymbol] + (Math.random() - 0.5) * 8;
          dataPoint[`${firstSymbol}_upperBand`] = dataPoint[firstSymbol] + 10;
          dataPoint[`${firstSymbol}_lowerBand`] = dataPoint[firstSymbol] - 10;
        }
        
        mockChartData.push(dataPoint);
      }
      
      setChartData(mockChartData);

    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'success';
      case 'SELL': return 'error';
      case 'HOLD': return 'warning';
      default: return 'default';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Portfolio Research & Analysis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Portfolio Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Portfolio for Analysis
        </Typography>
        <Box display="flex" flexDirection="column" gap={3}>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Portfolio</InputLabel>
              <Select
                value={selectedPortfolio || ''}
                label="Portfolio"
                onChange={(e) => handlePortfolioChange(Number(e.target.value))}
              >
                {portfolios.map((portfolio) => (
                  <MenuItem key={portfolio.id} value={portfolio.id}>
                    {portfolio.name} (${portfolio.total_value.toLocaleString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<Assessment />}
              onClick={runAnalysis}
              disabled={!selectedPortfolio || selectedSecurities.size === 0 || loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Run Analysis'}
            </Button>
          </Box>

          {/* Security Selection */}
          {holdings.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Select Securities to Analyze
              </Typography>
              <Box display="flex" gap={2} mb={2}>
                <Button size="small" onClick={handleSelectAllSecurities}>
                  Select All
                </Button>
                <Button size="small" onClick={handleDeselectAllSecurities}>
                  Deselect All
                </Button>
                <Chip 
                  label={`${selectedSecurities.size} of ${holdings.length} selected`} 
                  size="small" 
                  color="primary" 
                />
              </Box>
              <FormGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {holdings.map((holding) => (
                  <FormControlLabel
                    key={holding.symbol}
                    control={
                      <Checkbox
                        checked={selectedSecurities.has(holding.symbol)}
                        onChange={() => handleSecurityToggle(holding.symbol)}
                      />
                    }
                    label={
                      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Link
                            component="button"
                            variant="body2"
                            onClick={() => handleSymbolClick(holding.symbol)}
                            sx={{ 
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' },
                              fontWeight: 'bold'
                            }}
                          >
                            {holding.symbol}
                          </Link>
                          <Typography variant="body2">
                            - {holding.name || holding.symbol}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          ${holding.current_price?.toFixed(2) || '0.00'} | {holding.quantity} shares
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Results Section */}
      {recommendations.length > 0 && (
        <>
          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              aria-label="research tabs"
            >
              <Tab label="Recommendations" icon={<TrendingUp />} />
              <Tab label="Technical Analysis" icon={<Analytics />} />
              <Tab label="Charts" icon={<Timeline />} />
            </Tabs>
          </Paper>

          {/* Recommendations Tab */}
          <TabPanel value={activeTab} index={0}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Current Price</TableCell>
                    <TableCell>Target Price</TableCell>
                    <TableCell>Stop Loss</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Timeframe</TableCell>
                    <TableCell>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recommendations.map((rec) => (
                    <TableRow key={rec.symbol}>
                      <TableCell>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => handleSymbolClick(rec.symbol)}
                          sx={{ 
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                            fontWeight: 'bold'
                          }}
                        >
                          {rec.symbol}
                        </Link>
                      </TableCell>
                      <TableCell>{rec.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={rec.action}
                          color={getActionColor(rec.action)}
                          icon={rec.action === 'BUY' ? <AddShoppingCart /> : rec.action === 'SELL' ? <RemoveShoppingCart /> : undefined}
                        />
                      </TableCell>
                      <TableCell>${rec.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>${rec.targetPrice.toFixed(2)}</TableCell>
                      <TableCell>${rec.stopLoss.toFixed(2)}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={rec.confidence}
                            sx={{ width: 60 }}
                            color={getConfidenceColor(rec.confidence)}
                          />
                          <Typography variant="body2">{rec.confidence}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={rec.timeframe} size="small" />
                      </TableCell>
                      <TableCell>{rec.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Technical Analysis Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box display="flex" flexWrap="wrap" gap={3}>
              {recommendations.map((rec) => (
                <Box flex="1 1 300px" key={rec.symbol}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Link
                          component="button"
                          variant="h6"
                          onClick={() => handleSymbolClick(rec.symbol)}
                          sx={{ 
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                            fontWeight: 'bold'
                          }}
                        >
                          {rec.symbol}
                        </Link>
                        {' - '}{rec.name}
                      </Typography>
                      <Box mb={2}>
                        <Chip
                          label={rec.action}
                          color={getActionColor(rec.action)}
                          sx={{ mb: 1 }}
                        />
                      </Box>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <Typography variant="body2">
                          <strong>RSI:</strong> {rec.technicalIndicators.rsi.toFixed(1)}
                          {rec.technicalIndicators.rsi < 30 && ' (Oversold)'}
                          {rec.technicalIndicators.rsi > 70 && ' (Overbought)'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>MACD:</strong> {rec.technicalIndicators.macd.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Bollinger Bands:</strong> {rec.technicalIndicators.bollinger}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Support:</strong> ${rec.technicalIndicators.support.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Resistance:</strong> ${rec.technicalIndicators.resistance.toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </TabPanel>

          {/* Charts Tab */}
          <TabPanel value={activeTab} index={2}>
            {/* Date Range Controls */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Date Range & Zoom Controls
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate ? startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate ? endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="outlined"
                  onClick={handleDateRangeChange}
                  startIcon={<Refresh />}
                >
                  Apply Range
                </Button>
                <Box display="flex" gap={1} alignItems="center">
                  <IconButton onClick={handleZoomIn} size="small">
                    <ZoomIn />
                  </IconButton>
                  <IconButton onClick={handleZoomOut} size="small">
                    <ZoomOut />
                  </IconButton>
                  <IconButton onClick={handleResetZoom} size="small">
                    <Refresh />
                  </IconButton>
                  <Typography variant="body2">
                    Zoom: {Math.round(zoomLevel * 100)}%
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Box display="flex" flexWrap="wrap" gap={3}>
              <Box flex="1 1 66%">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Price Chart - 
                    {selectedSecurities.size > 0 ? (
                      <Box component="span" sx={{ ml: 1 }}>
                        {Array.from(selectedSecurities).map((symbol, index) => (
                          <Box key={symbol} component="span">
                            {index > 0 && ', '}
                            <Link
                              component="button"
                              variant="h6"
                              onClick={() => handleSymbolClick(symbol)}
                              sx={{ 
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' },
                                fontWeight: 'bold'
                              }}
                            >
                              {symbol}
                            </Link>
                          </Box>
                        ))}
                        {` (${selectedSecurities.size} securities)`}
                      </Box>
                    ) : (
                      'Select Symbol'
                    )}
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={filteredChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={Math.floor(filteredChartData.length / 10)}
                      />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip />
                      <Legend />
                      
                      {/* Dynamic lines for selected securities */}
                      {Array.from(selectedSecurities).map((symbol, index) => {
                        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];
                        const color = colors[index % colors.length];
                        return (
                          <Line
                            key={symbol}
                            type="monotone"
                            dataKey={symbol}
                            stroke={color}
                            strokeWidth={2}
                            name={symbol}
                            dot={false}
                          />
                        );
                      })}
                      
                      {/* Add technical indicators for first security if available */}
                      {selectedSecurities.size > 0 && (
                        <>
                          <Line
                            type="monotone"
                            dataKey={`${Array.from(selectedSecurities)[0]}_ma20`}
                            stroke="#82ca9d"
                            strokeDasharray="3 3"
                            name="MA 20"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey={`${Array.from(selectedSecurities)[0]}_ma50`}
                            stroke="#ffc658"
                            strokeDasharray="3 3"
                            name="MA 50"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey={`${Array.from(selectedSecurities)[0]}_upperBand`}
                            stroke="#ff7300"
                            strokeDasharray="5 5"
                            name="Upper BB"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey={`${Array.from(selectedSecurities)[0]}_lowerBand`}
                            stroke="#ff7300"
                            strokeDasharray="5 5"
                            name="Lower BB"
                            dot={false}
                          />
                        </>
                      )}
                      
                      <Brush
                        dataKey="date"
                        height={30}
                        stroke="#8884d8"
                        onChange={handleBrushChange}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>
              <Box flex="1 1 33%">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Volume
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={filteredChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={Math.floor(filteredChartData.length / 5)}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="volume" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>
            </Box>
          </TabPanel>
        </>
      )}
    </Container>
  );
};

export default Research;
