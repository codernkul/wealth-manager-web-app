// Financial Data Service for downloading price and fundamental data from Yahoo Finance

import { PriceData, FundamentalData, DatabaseSymbol, DownloadProgress } from './databaseService';

// Simulate yfinance API calls - in production, this would call your backend
export class FinancialDataService {
  private baseUrl = '/api/financial-data'; // This would be your backend API endpoint

  // Simulate API calls - in production, this would call your backend
  async downloadPriceData(symbol: string, startDate?: string, endDate?: string): Promise<PriceData[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Generate mock price data
      const priceData: PriceData[] = [];
      const end = endDate ? new Date(endDate) : new Date();
      
      // Default to 40 years of data if no start date provided
      const defaultStartDate = new Date();
      defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 40);
      const start = startDate ? new Date(startDate) : defaultStartDate;
      
      let currentPrice = 100 + Math.random() * 200;
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        // Skip weekends
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        
        const volatility = 0.02 + Math.random() * 0.03;
        const change = (Math.random() - 0.5) * volatility * currentPrice;
        currentPrice = Math.max(currentPrice + change, 1);
        
        const high = currentPrice + Math.random() * currentPrice * 0.02;
        const low = currentPrice - Math.random() * currentPrice * 0.02;
        const open = low + Math.random() * (high - low);
        const volume = Math.floor(Math.random() * 10000000) + 1000000;
        
        priceData.push({
          date: d.toISOString().split('T')[0],
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(currentPrice.toFixed(2)),
          volume,
          adjustedClose: Number(currentPrice.toFixed(2))
        });
      }
      
      // Save to MongoDB instead of in-memory
      await (await import('./databaseService')).savePriceDataToMongoDB(symbol, priceData);
      
      return priceData;
    } catch (error) {
      console.error(`Error downloading price data for ${symbol}:`, error);
      throw new Error(`Failed to download price data for ${symbol}`);
    }
  }

  async downloadFundamentalData(symbol: string): Promise<FundamentalData> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      // Generate mock fundamental data
      const fundamentalData: FundamentalData = {
        symbol,
        companyInfo: {
          name: `${symbol} Corporation`,
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
            freeCashFlow: Math.floor(Math.random() * 15000000000) + 1500000,
          },
        },
      };
      
      return fundamentalData;
    } catch (error) {
      console.error(`Error downloading fundamental data for ${symbol}:`, error);
      throw new Error(`Failed to download fundamental data for ${symbol}`);
    }
  }

  async downloadIncrementalPriceData(symbol: string, lastAvailableDate: string): Promise<PriceData[]> {
    try {
      // Download data from last available date to today
      const startDate = new Date(lastAvailableDate);
      startDate.setDate(startDate.getDate() + 1); // Start from next day
      
      const endDate = new Date();
      
      return this.downloadPriceData(symbol, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
    } catch (error) {
      console.error(`Error downloading incremental price data for ${symbol}:`, error);
      throw new Error(`Failed to download incremental price data for ${symbol}`);
    }
  }

  async getDatabaseSymbols(): Promise<DatabaseSymbol[]> {
    try {
      // Simulate API call to get database symbols
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get symbols from MongoDB instead of in-memory database
      const { getSymbolsFromMongoDB } = await import('./databaseService');
      return await getSymbolsFromMongoDB();
    } catch (error) {
      console.error('Error fetching database symbols:', error);
      throw new Error('Failed to fetch database symbols');
    }
  }

  private getSymbolStatus(data: any): 'complete' | 'partial' | 'missing' | 'error' {
    if (data.priceDataAvailable && data.fundamentalDataAvailable) {
      return 'complete';
    } else if (data.priceDataAvailable || data.fundamentalDataAvailable) {
      return 'partial';
    } else {
      return 'missing';
    }
  }

  async savePriceData(symbol: string, priceData: PriceData[]): Promise<void> {
    try {
      // Simulate API call to save price data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to MongoDB database
      await (await import('./databaseService')).savePriceDataToMongoDB(symbol, priceData);
      
      console.log(`Saved ${priceData.length} price records for ${symbol}`);
    } catch (error) {
      console.error(`Error saving price data for ${symbol}:`, error);
      throw new Error(`Failed to save price data for ${symbol}`);
    }
  }

  async saveFundamentalData(symbol: string, fundamentalData: FundamentalData): Promise<void> {
    try {
      // Simulate API call to save fundamental data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to MongoDB database
      await (await import('./databaseService')).saveFundamentalDataToMongoDB(symbol, fundamentalData);
      
      console.log(`Saved fundamental data for ${symbol}`);
    } catch (error) {
      console.error(`Error saving fundamental data for ${symbol}:`, error);
      throw new Error(`Failed to save fundamental data for ${symbol}`);
    }
  }

  async deleteSymbol(symbol: string): Promise<void> {
    try {
      // Simulate API call to delete symbol
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Delete from MongoDB database
      const { deleteSymbolFromMongoDB } = await import('./databaseService');
      await deleteSymbolFromMongoDB(symbol);
      
      console.log(`Deleted symbol ${symbol} from database`);
    } catch (error) {
      console.error(`Error deleting symbol ${symbol}:`, error);
      throw new Error(`Failed to delete symbol ${symbol}`);
    }
  }

  async getLastAvailableDate(symbol: string): Promise<string | null> {
    try {
      // Simulate API call to get last available date
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In production, this would query your database
      // Return a random date from the last 30 days for simulation
      const daysAgo = Math.floor(Math.random() * 30);
      const lastDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      return lastDate.toISOString().split('T')[0];
    } catch (error) {
      console.error(`Error getting last available date for ${symbol}:`, error);
      return null;
    }
  }

  // Enhanced batch download with override capability
  async downloadBatchPriceData(
    symbols: string[], 
    onProgress?: (progress: DownloadProgress[]) => void,
    options?: { override?: boolean; cancelToken?: { cancelled: boolean; reason?: string } }
  ): Promise<void> {
    const batchSize = 100; // Process up to 100 symbols in parallel
    const { override = false, cancelToken } = options || {};
    const progress: DownloadProgress[] = symbols.map(symbol => ({
      symbol,
      type: 'price' as const,
      progress: 0,
      status: 'pending' as const,
      message: 'Waiting to start...'
    }));

    if (onProgress) onProgress(progress);

    // Process symbols in batches of 100
    for (let i = 0; i < symbols.length; i += batchSize) {
      // Check for cancellation
      if (cancelToken?.cancelled) {
        if (onProgress) onProgress(progress.map(p => ({
          ...p,
          status: 'error',
          message: `Cancelled: ${cancelToken.reason || 'Download was cancelled'}`
        })));
        return;
      }

      const batch = symbols.slice(i, i + batchSize);
      
      // Update progress for current batch
      batch.forEach((symbol, batchIndex) => {
        const globalIndex = i + batchIndex;
        progress[globalIndex] = {
          ...progress[globalIndex],
          status: 'downloading',
          message: override ? 'Downloading (override mode)...' : 'Downloading price data...'
        };
      });
      if (onProgress) onProgress([...progress]);

      // Process current batch in parallel
      const batchPromises = batch.map(async (symbol) => {
        const globalIndex = symbols.indexOf(symbol);
        
        try {
          // Check for incremental download (only if not overriding)
          let priceData;
          if (override) {
            // Override: Download complete history regardless of existing data
            priceData = await this.downloadPriceData(symbol);
          } else {
            // Normal: Check for existing data first
            const lastDate = await this.getLastAvailableDate(symbol);
            priceData = lastDate 
              ? await this.downloadIncrementalPriceData(symbol, lastDate)
              : await this.downloadPriceData(symbol);
          }

          // Delete existing data if overriding
          if (override) {
            await this.deletePriceData(symbol);
          }

          await this.savePriceData(symbol, priceData);

          progress[globalIndex] = {
            ...progress[globalIndex],
            progress: 100,
            status: 'complete',
            message: override ? `Downloaded ${priceData.length} records (override)` : `Downloaded ${priceData.length} records`
          };
          
          return { symbol, success: true, dataCount: priceData.length };
        } catch (error) {
          progress[globalIndex] = {
            ...progress[globalIndex],
            status: 'error',
            message: 'Download failed'
          };
          
          return { symbol, success: false, error };
        }
      });

      // Wait for current batch to complete
      const results = await Promise.allSettled(batchPromises);
      
      // Update progress after batch completion
      if (onProgress) onProgress([...progress]);

      // Log batch results
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
      
      console.log(`Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(symbols.length/batchSize)} completed: ${successful} successful, ${failed} failed`);
      
      // Small delay between batches to avoid overwhelming APIs
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Delete specific symbol data
  async deleteSymbolData(symbol: string): Promise<void> {
    try {
      // Simulate API calls to delete all data for symbol
      await new Promise(resolve => setTimeout(resolve, 500)); // Delete price data
      await new Promise(resolve => setTimeout(resolve, 300)); // Delete fundamental data
      
      console.log(`Deleted all data for symbol: ${symbol}`);
    } catch (error) {
      console.error(`Error deleting data for ${symbol}:`, error);
      throw new Error(`Failed to delete data for ${symbol}`);
    }
  }

  // Delete only price data for symbol
  async deletePriceData(symbol: string): Promise<void> {
    try {
      // Simulate API call to delete price data
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log(`Deleted price data for symbol: ${symbol}`);
    } catch (error) {
      console.error(`Error deleting price data for ${symbol}:`, error);
      throw new Error(`Failed to delete price data for ${symbol}`);
    }
  }

  // Delete only fundamental data for symbol
  async deleteFundamentalData(symbol: string): Promise<void> {
    try {
      // Simulate API call to delete fundamental data
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log(`Deleted fundamental data for symbol: ${symbol}`);
    } catch (error) {
      console.error(`Error deleting fundamental data for ${symbol}:`, error);
      throw new Error(`Failed to delete fundamental data for ${symbol}`);
    }
  }

  async downloadBatchFundamentalData(
    symbols: string[], 
    onProgress?: (progress: DownloadProgress[]) => void,
    options?: { override?: boolean; cancelToken?: { cancelled: boolean; reason?: string } }
  ): Promise<void> {
    const batchSize = 100; // Process up to 100 symbols in parallel
    const { override = false, cancelToken } = options || {};
    const progress: DownloadProgress[] = symbols.map(symbol => ({
      symbol,
      type: 'fundamental' as const,
      progress: 0,
      status: 'pending' as const,
      message: 'Waiting to start...'
    }));

    if (onProgress) onProgress(progress);

    // Process symbols in batches of 100
    for (let i = 0; i < symbols.length; i += batchSize) {
      // Check for cancellation
      if (cancelToken?.cancelled) {
        if (onProgress) onProgress(progress.map(p => ({
          ...p,
          status: 'error',
          message: `Cancelled: ${cancelToken.reason || 'Download was cancelled'}`
        })));
        return;
      }

      const batch = symbols.slice(i, i + batchSize);
      
      // Update progress for current batch
      batch.forEach((symbol, batchIndex) => {
        const globalIndex = i + batchIndex;
        progress[globalIndex] = {
          ...progress[globalIndex],
          status: 'downloading',
          message: override ? 'Downloading (override mode)...' : 'Downloading fundamental data...'
        };
      });
      if (onProgress) onProgress([...progress]);

      // Process current batch in parallel
      const batchPromises = batch.map(async (symbol) => {
        const globalIndex = symbols.indexOf(symbol);
        
        try {
          const fundamentalData = await this.downloadFundamentalData(symbol);

          // Delete existing data if overriding
          if (override) {
            await this.deleteFundamentalData(symbol);
          }

          await this.saveFundamentalData(symbol, fundamentalData);

          progress[globalIndex] = {
            ...progress[globalIndex],
            progress: 100,
            status: 'complete',
            message: override ? 'Download complete (override)' : 'Download complete'
          };
          
          return { symbol, success: true };
        } catch (error) {
          progress[globalIndex] = {
            ...progress[globalIndex],
            status: 'error',
            message: 'Download failed'
          };
          
          return { symbol, success: false, error };
        }
      });

      // Wait for current batch to complete
      const results = await Promise.allSettled(batchPromises);
      
      // Update progress after batch completion
      if (onProgress) onProgress([...progress]);

      // Log batch results
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
      
      console.log(`Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(symbols.length/batchSize)} completed: ${successful} successful, ${failed} failed`);
      
      // Small delay between batches to avoid overwhelming APIs
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Enhanced batch download for mixed data types
  async downloadBatchMixedData(
    symbols: string[], 
    downloadTypes: ('price' | 'fundamental')[],
    onProgress?: (progress: DownloadProgress[]) => void,
    options?: { override?: boolean; cancelToken?: { cancelled: boolean; reason?: string } }
  ): Promise<void> {
    const batchSize = 100; // Process up to 100 symbols in parallel
    const { override = false, cancelToken } = options || {};
    const progress: DownloadProgress[] = [];

    // Initialize progress for all symbols and types
    symbols.forEach(symbol => {
      downloadTypes.forEach(type => {
        progress.push({
          symbol,
          type,
          progress: 0,
          status: 'pending' as const,
          message: 'Waiting to start...'
        });
      });
    });

    if (onProgress) onProgress(progress);

    // Process symbols in batches of 100
    for (let i = 0; i < symbols.length; i += batchSize) {
      // Check for cancellation
      if (cancelToken?.cancelled) {
        if (onProgress) onProgress(progress.map(p => ({
          ...p,
          status: 'error',
          message: `Cancelled: ${cancelToken.reason || 'Download was cancelled'}`
        })));
        return;
      }

      const batch = symbols.slice(i, i + batchSize);
      
      // Update progress for current batch
      batch.forEach((symbol, batchIndex) => {
        const globalIndex = i + batchIndex;
        downloadTypes.forEach(type => {
          const progressIndex = globalIndex * downloadTypes.length + downloadTypes.indexOf(type);
          progress[progressIndex] = {
            ...progress[progressIndex],
            status: 'downloading',
            message: override ? `Downloading ${type} data (override mode)...` : `Downloading ${type} data...`
          };
        });
      });
      if (onProgress) onProgress([...progress]);

      // Process current batch in parallel for all data types
      const batchPromises: Promise<any>[] = [];
      
      batch.forEach((symbol) => {
        downloadTypes.forEach(type => {
          const promise = (async () => {
            const globalIndex = symbols.indexOf(symbol);
            const progressIndex = globalIndex * downloadTypes.length + downloadTypes.indexOf(type);
            
            try {
              if (type === 'price') {
                let priceData;
                if (override) {
                  // Override: Download complete history regardless of existing data
                  priceData = await this.downloadPriceData(symbol);
                } else {
                  // Normal: Check for existing data first
                  const lastDate = await this.getLastAvailableDate(symbol);
                  priceData = lastDate 
                    ? await this.downloadIncrementalPriceData(symbol, lastDate)
                    : await this.downloadPriceData(symbol);
                }

                // Delete existing data if overriding
                if (override) {
                  await this.deletePriceData(symbol);
                }

                await this.savePriceData(symbol, priceData);

                progress[progressIndex] = {
                  ...progress[progressIndex],
                  progress: 100,
                  status: 'complete',
                  message: override ? `Downloaded ${priceData.length} records (override)` : `Downloaded ${priceData.length} records`
                };
              } else if (type === 'fundamental') {
                const fundamentalData = await this.downloadFundamentalData(symbol);

                // Delete existing data if overriding
                if (override) {
                  await this.deleteFundamentalData(symbol);
                }

                await this.saveFundamentalData(symbol, fundamentalData);

                progress[progressIndex] = {
                  ...progress[progressIndex],
                  progress: 100,
                  status: 'complete',
                  message: override ? 'Download complete (override)' : 'Download complete'
                };
              }
              
              return { symbol, type, success: true };
            } catch (error) {
              progress[progressIndex] = {
                ...progress[progressIndex],
                status: 'error',
                message: 'Download failed'
              };
              
              return { symbol, type, success: false, error };
            }
          })();
          
          batchPromises.push(promise);
        });
      });

      // Wait for current batch to complete
      const results = await Promise.allSettled(batchPromises);
      
      // Update progress after batch completion
      if (onProgress) onProgress([...progress]);

      // Log batch results
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
      
      console.log(`Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(symbols.length/batchSize)} completed: ${successful} successful, ${failed} failed`);
      
      // Small delay between batches to avoid overwhelming APIs
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

export const financialDataService = new FinancialDataService();
