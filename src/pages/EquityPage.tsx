import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Timeline,
  Business,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { financialDataService } from '../services/financialDataService';
import { useNavigate, useParams } from 'react-router-dom';

interface EquityPageProps {}

const EquityPage: React.FC<EquityPageProps> = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  
  const [symbolData, setSymbolData] = useState<any>(null);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [fundamentalData, setFundamentalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const loadSymbolData = async () => {
      if (!symbol) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Load symbol details from database
        const databaseSymbols = await financialDataService.getDatabaseSymbols();
        const foundSymbol = databaseSymbols.find(s => s.symbol === symbol.toUpperCase());
        
        if (foundSymbol) {
          setSymbolData(foundSymbol);
          
          // Generate historical price data
          const historicalData = generateHistoricalData(symbol);
          setPriceData(historicalData);
          
          // Generate mock fundamental data
          const mockFundamentalData = {
            companyInfo: {
              name: foundSymbol.name,
              sector: ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy'][Math.floor(Math.random() * 5)],
              industry: ['Software', 'Hardware', 'Banking', 'Retail', 'Manufacturing'][Math.floor(Math.random() * 5)],
              marketCap: Math.floor(Math.random() * 1000000000000) + 100000000,
              enterpriseValue: Math.floor(Math.random() * 1000000000000) + 100000000,
              trailingPE: Math.random() * 30 + 5,
              forwardPE: Math.random() * 25 + 10,
              pegRatio: Math.random() * 2 + 0.5,
              priceToSales: Math.random() * 5 + 1,
              priceToBook: Math.random() * 10 + 1,
              enterpriseToRevenue: Math.random() * 10 + 2,
              enterpriseToEbitda: Math.random() * 15 + 5,
              beta: Math.random() * 2,
              fiftyTwoWeekHigh: 150 + Math.random() * 100,
              fiftyTwoWeekLow: 50 + Math.random() * 50,
              dividendYield: Math.random() * 5,
              dividendRate: Math.random() * 10,
              exDividendDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              payoutRatio: Math.random() * 0.5,
              dividendPerShare: Math.random() * 5,
            },
            financialStatements: {
              incomeStatement: {
                totalRevenue: Math.floor(Math.random() * 100000000000) + 10000000,
                grossProfit: Math.floor(Math.random() * 50000000000) + 5000000,
                operatingIncome: Math.floor(Math.random() * 20000000000) + 2000000,
                netIncome: Math.floor(Math.random() * 10000000000) + 1000000,
                earningsPerShare: Math.random() * 10 + 1,
                dilutedEPS: Math.random() * 8 + 0.5,
              },
              balanceSheet: {
                totalAssets: Math.floor(Math.random() * 200000000000) + 20000000,
                totalLiabilities: Math.floor(Math.random() * 100000000000) + 10000000,
                totalStockholderEquity: Math.floor(Math.random() * 100000000000) + 10000000,
                currentAssets: Math.floor(Math.random() * 50000000000) + 5000000,
                currentLiabilities: Math.floor(Math.random() * 25000000000) + 2500000,
                totalDebt: Math.floor(Math.random() * 50000000000) + 5000000,
              },
              cashFlow: {
                operatingCashFlow: Math.floor(Math.random() * 20000000000) + 2000000,
                investingCashFlow: Math.floor(Math.random() * -10000000000) - 1000000,
                financingCashFlow: Math.floor(Math.random() * 10000000000) + 1000000,
                freeCashFlow: Math.floor(Math.random() * 5000000000) + 500000,
              }
            }
          };
          setFundamentalData(mockFundamentalData);
        } else {
          setError(`Symbol ${symbol} not found in database`);
        }
      } catch (err) {
        setError(`Failed to load symbol data: ${err instanceof Error ? (err as Error).message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadSymbolData();
  }, [symbol]);

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

  const handleBack = () => {
    navigate('/database-manager');
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading {symbol?.toUpperCase()} data...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box mt={3}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!symbolData) {
    return (
      <Container maxWidth="xl">
        <Box mt={3}>
          <Alert severity="info">
            Symbol not found in database
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box mt={3}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Back to Database
          </Button>
          <Typography variant="h4" component="h1">
            {symbol?.toUpperCase()} - {symbolData.name}
          </Typography>
        </Box>

        {/* Date Range Filter */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Price Data Date Range
          </Typography>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" sx={{ minWidth: 120 }}>
              Start Date:
            </Typography>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <Typography variant="body2" sx={{ minWidth: 80 }}>
              End Date:
            </Typography>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <Button
              variant="outlined"
              onClick={() => setDateRange({ start: '', end: '' })}
              size="small"
            >
              Clear
            </Button>
          </Box>
        </Paper>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Fundamental Data */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Business sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Fundamental Data
                  </Typography>
                </Box>
                
                {fundamentalData && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      <strong>Market Cap:</strong> ${(fundamentalData.companyInfo.marketCap / 1000000000).toFixed(2)}B
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>P/E Ratio:</strong> {fundamentalData.companyInfo.trailingPE.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>EPS:</strong> ${fundamentalData.companyInfo.dividendPerShare.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Dividend Yield:</strong> {fundamentalData.companyInfo.dividendYield.toFixed(2)}%
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>52W High:</strong> ${fundamentalData.companyInfo.fiftyTwoWeekHigh.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>52W Low:</strong> ${fundamentalData.companyInfo.fiftyTwoWeekLow.toFixed(2)}
                    </Typography>
                  </Box>
                )}
                
                <Box mt={2}>
                  <Chip 
                    icon={symbolData.priceDataAvailable ? <CheckCircle /> : <Error />}
                    label={symbolData.priceDataAvailable ? 'Price Data Available' : 'No Price Data'}
                    color={symbolData.priceDataAvailable ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Price Chart */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Timeline sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Price Chart
                  </Typography>
                </Box>
                
                {priceData.length > 0 && (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={priceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="close" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Historical Data Table */}
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Historical Price Data
          </Typography>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Open</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>High</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Low</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Close</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Volume</th>
                </tr>
              </thead>
              <tbody>
                {priceData.slice(0, 50).map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{row.date}</td>
                    <td style={{ padding: '12px' }}>${row.open.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>${row.high.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>${row.low.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>${row.close.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>{row.volume.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EquityPage;
