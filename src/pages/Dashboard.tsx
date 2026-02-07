import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShowChart,
} from '@mui/icons-material';
import { portfolioService, Portfolio, PortfolioSummary } from '../services/portfolioService';
import { useAuth } from '../contexts/AuthContext';

interface AggregatedData {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  equities: { count: number; value: number; gainLoss: number };
  etfs: { count: number; value: number; gainLoss: number };
  mutualFunds: { count: number; value: number; gainLoss: number };
  cash: { count: number; value: number; gainLoss: number };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('=== DASHBOARD DATA LOADING START ===');
        console.log('User authenticated:', !!user);
        
        const portfoliosData = await portfolioService.getPortfolios();
        console.log('Portfolios loaded:', portfoliosData);
        console.log('Number of portfolios:', portfoliosData.length);
        
        setPortfolios(portfoliosData);
        
        if (portfoliosData.length > 0) {
          console.log('Calculating summary from portfolio data...');
          
          // Calculate summary from all portfolios instead of calling API
          let totalValue = 0;
          let totalGainLoss = 0;
          
          for (const portfolio of portfoliosData) {
            if (portfolio.holdings) {
              for (const holding of portfolio.holdings) {
                const value = holding.quantity * holding.average_cost;
                totalValue += value;
                totalGainLoss += holding.unrealized_gain_loss || 0;
              }
            }
          }
          
          const summaryData: PortfolioSummary = {
            total_value: totalValue,
            total_gain_loss: totalGainLoss,
            total_gain_loss_percent: totalValue > 0 ? (totalGainLoss / totalValue) * 100 : 0,
            holdings_count: portfoliosData.reduce((count, portfolio) => count + (portfolio.holdings?.length || 0), 0),
            asset_allocation: {},
            top_performers: [],
            worst_performers: [],
          };
          
          console.log('Calculated summary:', summaryData);
          setSummary(summaryData);
          
          // Calculate aggregated data
          const aggregated: AggregatedData = {
            totalValue: summaryData.total_value,
            totalGainLoss: summaryData.total_gain_loss,
            totalGainLossPercent: summaryData.total_gain_loss_percent,
            equities: { count: 0, value: 0, gainLoss: 0 },
            etfs: { count: 0, value: 0, gainLoss: 0 },
            mutualFunds: { count: 0, value: 0, gainLoss: 0 },
            cash: { count: 0, value: 0, gainLoss: 0 },
          };
          
          // Aggregate data from all portfolios
          for (const portfolio of portfoliosData) {
            if (portfolio.holdings) {
              for (const holding of portfolio.holdings) {
                const value = holding.quantity * holding.average_cost;
                const gainLoss = holding.unrealized_gain_loss || 0;
                
                switch (holding.asset_type) {
                  case 'stock':
                    aggregated.equities.count++;
                    aggregated.equities.value += value;
                    aggregated.equities.gainLoss += gainLoss;
                    break;
                  case 'etf':
                    aggregated.etfs.count++;
                    aggregated.etfs.value += value;
                    aggregated.etfs.gainLoss += gainLoss;
                    break;
                  case 'mutual_fund':
                    aggregated.mutualFunds.count++;
                    aggregated.mutualFunds.value += value;
                    aggregated.mutualFunds.gainLoss += gainLoss;
                    break;
                  case 'cash':
                  case 'money_market':
                    aggregated.cash.count++;
                    aggregated.cash.value += value;
                    aggregated.cash.gainLoss += gainLoss;
                    break;
                }
              }
            }
          }
          
          setAggregatedData(aggregated);
        }
      } catch (err: any) {
        console.error('=== DASHBOARD DATA LOADING ERROR ===');
        console.error('Error type:', typeof err);
        console.error('Error name:', err?.name);
        console.error('Error message:', err?.message);
        console.error('Error response:', err?.response);
        console.error('Error response data:', err?.response?.data);
        console.error('Error status:', err?.response?.status);
        console.error('Full error object:', err);
        
        let errorMessage = 'Failed to load dashboard data';
        
        if (err?.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (err?.response?.status === 404) {
          errorMessage = 'Portfolio data not found. Please create a portfolio first.';
        } else if (err?.response?.data?.detail) {
          errorMessage = `Server error: ${JSON.stringify(err.response.data.detail)}`;
        } else if (err?.response?.data?.message) {
          errorMessage = `Server error: ${JSON.stringify(err.response.data.message)}`;
        } else if (err?.response?.data) {
          errorMessage = `Server error: ${JSON.stringify(err.response.data)}`;
        } else if (err?.message) {
          errorMessage = `Network error: ${err.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
        console.log('=== DASHBOARD DATA LOADING END ===');
      }
    };

    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Portfolio Dashboard
      </Typography>
      
      {/* Summary Cards */}
      {summary && (
        <Box 
          display="grid" 
          gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" 
          gap={3}
          mb={4}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box flexGrow={1}>
                  <Typography color="textSecondary" gutterBottom>
                    Total Portfolio Value
                  </Typography>
                  <Typography variant="h4">
                    ${summary.total_value.toLocaleString()}
                  </Typography>
                </Box>
                <AccountBalance color="primary" />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box flexGrow={1}>
                  <Typography color="textSecondary" gutterBottom>
                    Today's Gain/Loss
                  </Typography>
                  <Typography variant="h4" color={summary.total_gain_loss >= 0 ? 'success.main' : 'error.main'}>
                    {summary.total_gain_loss >= 0 ? '+' : ''}${Math.abs(summary.total_gain_loss).toLocaleString()}
                  </Typography>
                </Box>
                {summary.total_gain_loss >= 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box flexGrow={1}>
                  <Typography color="textSecondary" gutterBottom>
                    Total Return
                  </Typography>
                  <Typography variant="h4" color={summary.total_gain_loss_percent >= 0 ? 'success.main' : 'error.main'}>
                    {summary.total_gain_loss_percent >= 0 ? '+' : ''}{summary.total_gain_loss_percent.toFixed(2)}%
                  </Typography>
                </Box>
                {summary.total_gain_loss_percent >= 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      // Portfolio List
      <Paper sx={{ p: 2, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Your Portfolios ({portfolios.length})
        </Typography>
        {portfolios.length === 0 ? (
          <Typography color="text.secondary">
            No portfolios yet. Create your first portfolio to get started!
          </Typography>
        ) : (
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" 
            gap={3}
          >
            {portfolios.map((portfolio) => (
              <Card key={portfolio.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {portfolio.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {portfolio.description || 'No description'}
                  </Typography>
                  <Typography variant="h4">
                    ${(portfolio.holdings?.reduce((sum, h) => sum + (h.quantity * h.average_cost), 0) || 0).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* Consolidated Holdings Table */}
      {aggregatedData && (
        <Paper sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Consolidated Holdings by Asset Type
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Asset Type</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                  <TableCell align="right">Gain/Loss</TableCell>
                  <TableCell align="right">% of Portfolio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ShowChart color="primary" />
                      Equities
                    </Box>
                  </TableCell>
                  <TableCell align="right">{aggregatedData.equities.count}</TableCell>
                  <TableCell align="right">${aggregatedData.equities.value.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Typography color={aggregatedData.equities.gainLoss >= 0 ? 'success.main' : 'error.main'}>
                      {aggregatedData.equities.gainLoss >= 0 ? '+' : ''}${Math.abs(aggregatedData.equities.gainLoss).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {((aggregatedData.equities.value / aggregatedData.totalValue) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ShowChart color="secondary" />
                      ETFs
                    </Box>
                  </TableCell>
                  <TableCell align="right">{aggregatedData.etfs.count}</TableCell>
                  <TableCell align="right">${aggregatedData.etfs.value.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Typography color={aggregatedData.etfs.gainLoss >= 0 ? 'success.main' : 'error.main'}>
                      {aggregatedData.etfs.gainLoss >= 0 ? '+' : ''}${Math.abs(aggregatedData.etfs.gainLoss).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {((aggregatedData.etfs.value / aggregatedData.totalValue) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccountBalance color="info" />
                      Mutual Funds
                    </Box>
                  </TableCell>
                  <TableCell align="right">{aggregatedData.mutualFunds.count}</TableCell>
                  <TableCell align="right">${aggregatedData.mutualFunds.value.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Typography color={aggregatedData.mutualFunds.gainLoss >= 0 ? 'success.main' : 'error.main'}>
                      {aggregatedData.mutualFunds.gainLoss >= 0 ? '+' : ''}${Math.abs(aggregatedData.mutualFunds.gainLoss).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {((aggregatedData.mutualFunds.value / aggregatedData.totalValue) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccountBalance color="success" />
                      Cash & Money Markets
                    </Box>
                  </TableCell>
                  <TableCell align="right">{aggregatedData.cash.count}</TableCell>
                  <TableCell align="right">${aggregatedData.cash.value.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Typography color={aggregatedData.cash.gainLoss >= 0 ? 'success.main' : 'error.main'}>
                      {aggregatedData.cash.gainLoss >= 0 ? '+' : ''}${Math.abs(aggregatedData.cash.gainLoss).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {((aggregatedData.cash.value / aggregatedData.totalValue) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Individual Holdings by Asset Type */}
      {aggregatedData && (
        <Paper sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            All Holdings by Asset Type
          </Typography>
          
          {/* Equities Holdings */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShowChart color="primary" />
              Equities ({aggregatedData.equities.count})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Avg Cost</TableCell>
                    <TableCell align="right">Market Value</TableCell>
                    <TableCell align="right">Gain/Loss</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolios.flatMap(portfolio => portfolio.holdings || [])
                    .filter(holding => holding.asset_type === 'stock')
                    .map((holding, index) => (
                      <TableRow key={`equity-${holding.id || index}`}>
                        <TableCell>{holding.symbol}</TableCell>
                        <TableCell>{holding.name || holding.symbol}</TableCell>
                        <TableCell align="right">{holding.quantity.toLocaleString()}</TableCell>
                        <TableCell align="right">${holding.average_cost.toFixed(2)}</TableCell>
                        <TableCell align="right">${(holding.quantity * holding.average_cost).toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Typography color={(holding.unrealized_gain_loss || 0) >= 0 ? 'success.main' : 'error.main'}>
                            {(holding.unrealized_gain_loss || 0) >= 0 ? '+' : ''}${Math.abs(holding.unrealized_gain_loss || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* ETFs Holdings */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShowChart color="secondary" />
              ETFs ({aggregatedData.etfs.count})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Avg Cost</TableCell>
                    <TableCell align="right">Market Value</TableCell>
                    <TableCell align="right">Gain/Loss</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolios.flatMap(portfolio => portfolio.holdings || [])
                    .filter(holding => holding.asset_type === 'etf')
                    .map((holding, index) => (
                      <TableRow key={`etf-${holding.id || index}`}>
                        <TableCell>{holding.symbol}</TableCell>
                        <TableCell>{holding.name || holding.symbol}</TableCell>
                        <TableCell align="right">{holding.quantity.toLocaleString()}</TableCell>
                        <TableCell align="right">${holding.average_cost.toFixed(2)}</TableCell>
                        <TableCell align="right">${(holding.quantity * holding.average_cost).toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Typography color={(holding.unrealized_gain_loss || 0) >= 0 ? 'success.main' : 'error.main'}>
                            {(holding.unrealized_gain_loss || 0) >= 0 ? '+' : ''}${Math.abs(holding.unrealized_gain_loss || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mutual Funds Holdings */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance color="info" />
              Mutual Funds ({aggregatedData.mutualFunds.count})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Avg Cost</TableCell>
                    <TableCell align="right">Market Value</TableCell>
                    <TableCell align="right">Gain/Loss</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolios.flatMap(portfolio => portfolio.holdings || [])
                    .filter(holding => holding.asset_type === 'mutual_fund')
                    .map((holding, index) => (
                      <TableRow key={`mf-${holding.id || index}`}>
                        <TableCell>{holding.symbol}</TableCell>
                        <TableCell>{holding.name || holding.symbol}</TableCell>
                        <TableCell align="right">{holding.quantity.toLocaleString()}</TableCell>
                        <TableCell align="right">${holding.average_cost.toFixed(2)}</TableCell>
                        <TableCell align="right">${(holding.quantity * holding.average_cost).toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Typography color={(holding.unrealized_gain_loss || 0) >= 0 ? 'success.main' : 'error.main'}>
                            {(holding.unrealized_gain_loss || 0) >= 0 ? '+' : ''}${Math.abs(holding.unrealized_gain_loss || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Cash & Money Markets Holdings */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance color="success" />
              Cash & Money Markets ({aggregatedData.cash.count})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Avg Cost</TableCell>
                    <TableCell align="right">Market Value</TableCell>
                    <TableCell align="right">Gain/Loss</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolios.flatMap(portfolio => portfolio.holdings || [])
                    .filter(holding => holding.asset_type === 'cash' || holding.asset_type === 'money_market')
                    .map((holding, index) => (
                      <TableRow key={`cash-${holding.id || index}`}>
                        <TableCell>{holding.symbol}</TableCell>
                        <TableCell>{holding.name || holding.symbol}</TableCell>
                        <TableCell align="right">{holding.quantity.toLocaleString()}</TableCell>
                        <TableCell align="right">${holding.average_cost.toFixed(2)}</TableCell>
                        <TableCell align="right">${(holding.quantity * holding.average_cost).toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Typography color={(holding.unrealized_gain_loss || 0) >= 0 ? 'success.main' : 'error.main'}>
                            {(holding.unrealized_gain_loss || 0) >= 0 ? '+' : ''}${Math.abs(holding.unrealized_gain_loss || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default Dashboard;
