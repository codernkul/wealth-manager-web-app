import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Timeline,
  Assessment,
  ArrowBack,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Analysis: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [symbolData, setSymbolData] = useState<any>(null);

  useEffect(() => {
    if (symbol) {
      loadSymbolData(symbol);
    }
  }, [symbol]);

  const loadSymbolData = async (symbol: string) => {
    setLoading(true);
    setError('');

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock comprehensive symbol data
      const mockData = {
        symbol,
        name: `${symbol} Corporation`,
        currentPrice: 100 + Math.random() * 200,
        previousClose: 95 + Math.random() * 190,
        change: 0,
        changePercent: 0,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        marketCap: Math.floor(Math.random() * 1000000000000) + 100000000,
        pe: Math.random() * 30 + 5,
        eps: Math.random() * 10 + 1,
        dividend: Math.random() * 5,
        beta: Math.random() * 2,
        week52High: 150 + Math.random() * 100,
        week52Low: 50 + Math.random() * 50,
        technical: {
          rsi: Math.random() * 100,
          macd: (Math.random() - 0.5) * 10,
          signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
          support: 80 + Math.random() * 20,
          resistance: 120 + Math.random() * 30,
        },
        fundamentals: {
          revenue: Math.floor(Math.random() * 100000000000) + 10000000,
          netIncome: Math.floor(Math.random() * 10000000000) + 1000000,
          totalAssets: Math.floor(Math.random() * 200000000000) + 20000000,
          totalDebt: Math.floor(Math.random() * 50000000) + 5000000,
          roe: Math.random() * 20 + 5,
          roa: Math.random() * 10 + 2,
          debtToEquity: Math.random() * 2,
        },
        chartData: [] as any[],
        sectorData: [] as any[],
      };

      // Calculate change
      mockData.change = mockData.currentPrice - mockData.previousClose;
      mockData.changePercent = (mockData.change / mockData.previousClose) * 100;

      // Generate chart data
      for (let i = 90; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const price = mockData.currentPrice + (Math.random() - 0.5) * 20 + Math.sin(i / 10) * 5;
        mockData.chartData.push({
          date: date.toLocaleDateString(),
          price: price,
          volume: Math.floor(Math.random() * 10000000) + 5000000,
          ma20: price + (Math.random() - 0.5) * 5,
          ma50: price + (Math.random() - 0.5) * 8,
        });
      }

      // Generate sector allocation data
      mockData.sectorData = [
        { name: 'Technology', value: Math.random() * 40 + 20, color: '#8884d8' },
        { name: 'Healthcare', value: Math.random() * 20 + 10, color: '#82ca9d' },
        { name: 'Finance', value: Math.random() * 20 + 10, color: '#ffc658' },
        { name: 'Consumer', value: Math.random() * 15 + 5, color: '#ff7300' },
        { name: 'Other', value: Math.random() * 10 + 5, color: '#0088fe' },
      ];

      setSymbolData(mockData);
    } catch (err) {
      setError('Failed to load symbol data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading {symbol} analysis...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!symbolData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">No data found for {symbol}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/research')}
          >
            Back to Research
          </Button>
          <Typography variant="h4" component="h1">
            {symbol} - {symbolData.name}
          </Typography>
        </Box>

        {/* Key Metrics */}
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box flex="1 1 300px">
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  Current Price
                </Typography>
                <Typography variant="h4" color={symbolData.change >= 0 ? 'success.main' : 'error.main'}>
                  {formatCurrency(symbolData.currentPrice)}
                </Typography>
                <Typography variant="body2" color={symbolData.change >= 0 ? 'success.main' : 'error.main'}>
                  {symbolData.change >= 0 ? '+' : ''}{symbolData.change.toFixed(2)} ({symbolData.changePercent.toFixed(2)}%)
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1 1 300px">
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  Volume
                </Typography>
                <Typography variant="h4">
                  {formatNumber(symbolData.volume)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1 1 300px">
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  Market Cap
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(symbolData.marketCap)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1 1 300px">
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  P/E Ratio
                </Typography>
                <Typography variant="h4">
                  {symbolData.pe.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>

      {/* Analysis Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Technical Analysis" />
          <Tab label="Fundamental Analysis" />
          <Tab label="Price Chart" />
          <Tab label="Risk Analysis" />
        </Tabs>
      </Paper>

      {/* Technical Analysis Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box flex="1 1 400px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Technical Indicators
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>RSI:</Typography>
                    <Typography fontWeight="bold">{symbolData.technical.rsi.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>MACD:</Typography>
                    <Typography fontWeight="bold">{symbolData.technical.macd.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Signal:</Typography>
                    <Typography 
                      fontWeight="bold" 
                      color={symbolData.technical.signal === 'BUY' ? 'success.main' : 'error.main'}
                    >
                      {symbolData.technical.signal}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Support:</Typography>
                    <Typography fontWeight="bold">{formatCurrency(symbolData.technical.support)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Resistance:</Typography>
                    <Typography fontWeight="bold">{formatCurrency(symbolData.technical.resistance)}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1 1 400px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Price Levels
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">52 Week High</Typography>
                    <Typography variant="h6">{formatCurrency(symbolData.week52High)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">52 Week Low</Typography>
                    <Typography variant="h6">{formatCurrency(symbolData.week52Low)}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="textSecondary">Current Price</Typography>
                    <Typography variant="h5" color={symbolData.change >= 0 ? 'success.main' : 'error.main'}>
                      {formatCurrency(symbolData.currentPrice)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Fundamental Analysis Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box flex="1 1 400px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Metrics
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Revenue:</Typography>
                    <Typography fontWeight="bold">{formatCurrency(symbolData.fundamentals.revenue)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Net Income:</Typography>
                    <Typography fontWeight="bold">{formatCurrency(symbolData.fundamentals.netIncome)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Total Assets:</Typography>
                    <Typography fontWeight="bold">{formatCurrency(symbolData.fundamentals.totalAssets)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Total Debt:</Typography>
                    <Typography fontWeight="bold">{formatCurrency(symbolData.fundamentals.totalDebt)}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1 1 400px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profitability Ratios
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Return on Equity (ROE):</Typography>
                    <Typography fontWeight="bold">{symbolData.fundamentals.roe.toFixed(2)}%</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Return on Assets (ROA):</Typography>
                    <Typography fontWeight="bold">{symbolData.fundamentals.roa.toFixed(2)}%</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Debt to Equity:</Typography>
                    <Typography fontWeight="bold">{symbolData.fundamentals.debtToEquity.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Earnings Per Share (EPS):</Typography>
                    <Typography fontWeight="bold">${symbolData.eps.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Dividend Yield:</Typography>
                    <Typography fontWeight="bold">{symbolData.dividend.toFixed(2)}%</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Price Chart Tab */}
      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Price History
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={symbolData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} name="Price" />
                <Line type="monotone" dataKey="ma20" stroke="#82ca9d" name="MA 20" />
                <Line type="monotone" dataKey="ma50" stroke="#ffc658" name="MA 50" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Risk Analysis Tab */}
      <TabPanel value={activeTab} index={3}>
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box flex="1 1 400px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Risk Metrics
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Beta:</Typography>
                    <Typography fontWeight="bold">{symbolData.beta.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>52 Week Range:</Typography>
                    <Typography fontWeight="bold">
                      {formatCurrency(symbolData.week52Low)} - {formatCurrency(symbolData.week52High)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Volatility:</Typography>
                    <Typography fontWeight="bold">Moderate</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1 1 400px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sector Allocation
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={symbolData.sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {symbolData.sectorData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>
    </Container>
  );
};

export default Analysis;
