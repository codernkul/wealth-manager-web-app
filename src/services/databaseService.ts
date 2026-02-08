// MongoDB Database Service for persistent financial data storage

export interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

export interface FundamentalData {
  symbol: string;
  companyInfo: {
    name: string;
    sector: string;
    industry: string;
    marketCap: number;
    enterpriseValue: number;
    trailingPE: number;
    forwardPE: number;
    pegRatio: number;
    priceToSales: number;
    priceToBook: number;
    enterpriseToRevenue: number;
    enterpriseToEbitda: number;
    beta: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    dividendYield: number;
    dividendRate: number;
    exDividendDate: string;
    payoutRatio: number;
    dividendPerShare: number;
  };
  financialStatements: {
    incomeStatement: {
      totalRevenue: number;
      grossProfit: number;
      operatingIncome: number;
      netIncome: number;
      earningsPerShare: number;
      dilutedEPS: number;
    };
    balanceSheet: {
      totalAssets: number;
      totalLiabilities: number;
      totalStockholderEquity: number;
      currentAssets: number;
      currentLiabilities: number;
      totalDebt: number;
    };
    cashFlow: {
      operatingCashFlow: number;
      investingCashFlow: number;
      financingCashFlow: number;
      freeCashFlow: number;
    };
  };
}

export interface DatabaseSymbol {
  symbol: string;
  name: string;
  priceDataAvailable: boolean;
  fundamentalDataAvailable: boolean;
  priceDataCount: number;
  fundamentalDataCount: number;
  lastUpdated: string;
  status: 'complete' | 'partial' | 'missing' | 'error';
}

export interface DownloadProgress {
  symbol: string;
  type: 'price' | 'fundamental';
  progress: number;
  status: 'pending' | 'downloading' | 'complete' | 'error';
  message: string;
}

// MongoDB connection configuration
const MONGODB_CONFIG = {
  // In production, these would come from environment variables
  uri: process.env.REACT_APP_MONGODB_URI || 'mongodb://localhost:27017/wealth-manager',
  dbName: 'wealth-manager',
  collections: {
    symbols: 'symbols',
    priceData: 'price_data',
    fundamentalData: 'fundamental_data'
  }
};

// MongoDB connection instance
let db: any = null;
let isConnected = false;

// MongoDB connection management
export const connectToDatabase = async (): Promise<void> => {
  try {
    if (!db) {
      // In a real app, you'd use mongoose or mongodb driver
      // For now, we'll simulate MongoDB connection
      console.log('Connecting to MongoDB:', MONGODB_CONFIG.uri);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      db = {
        // Simulated MongoDB collections
        [MONGODB_CONFIG.collections.symbols]: new Map(),
        [MONGODB_CONFIG.collections.priceData]: new Map(),
        [MONGODB_CONFIG.collections.fundamentalData]: new Map()
      };
      
      isConnected = true;
      console.log('Connected to MongoDB database successfully');
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Database connection failed');
  }
};

// Disconnect from database
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    if (db && isConnected) {
      console.log('Disconnecting from MongoDB database');
      
      // Simulate disconnection
      await new Promise(resolve => setTimeout(resolve, 500));
      
      db = null;
      isConnected = false;
      console.log('Disconnected from MongoDB database');
    }
  } catch (error) {
    console.error('Failed to disconnect from MongoDB:', error);
    throw new Error('Database disconnection failed');
  }
};

// Save price data to MongoDB
export const savePriceDataToMongoDB = async (symbol: string, priceData: PriceData[]): Promise<void> => {
  try {
    if (!db || !isConnected) {
      await connectToDatabase();
    }

    // Save to simulated MongoDB collection
    const collection = db![MONGODB_CONFIG.collections.priceData];
    collection.set(symbol, priceData);
    
    // Update symbol metadata
    const symbolsCollection = db![MONGODB_CONFIG.collections.symbols];
    const existingSymbol = symbolsCollection.get(symbol) || {};
    
    symbolsCollection.set(symbol, {
      ...existingSymbol,
      symbol,
      priceDataAvailable: true,
      priceDataCount: priceData.length,
      lastUpdated: new Date().toISOString(),
      status: existingSymbol.fundamentalDataAvailable ? 'complete' : 'partial'
    });

    console.log(`Saved ${priceData.length} price records for ${symbol} to MongoDB`);
  } catch (error) {
    console.error(`Failed to save price data for ${symbol}:`, error);
    throw new Error(`Failed to save price data for ${symbol}`);
  }
};

// Save fundamental data to MongoDB
export const saveFundamentalDataToMongoDB = async (symbol: string, fundamentalData: FundamentalData): Promise<void> => {
  try {
    if (!db || !isConnected) {
      await connectToDatabase();
    }

    // Save to simulated MongoDB collection
    const fundamentalCollection = db![MONGODB_CONFIG.collections.fundamentalData];
    fundamentalCollection.set(symbol, fundamentalData);
    
    // Update symbol metadata
    const symbolsCollection = db![MONGODB_CONFIG.collections.symbols];
    const existingSymbol = symbolsCollection.get(symbol) || {};
    
    symbolsCollection.set(symbol, {
      ...existingSymbol,
      symbol,
      fundamentalDataAvailable: true,
      fundamentalDataCount: 1,
      lastUpdated: new Date().toISOString(),
      status: existingSymbol.priceDataAvailable ? 'complete' : 'partial'
    });

    console.log(`Saved fundamental data for ${symbol} to MongoDB`);
  } catch (error) {
    console.error(`Failed to save fundamental data for ${symbol}:`, error);
    throw new Error(`Failed to save fundamental data for ${symbol}`);
  }
};

// Get all symbols from MongoDB
export const getSymbolsFromMongoDB = async (): Promise<DatabaseSymbol[]> => {
  try {
    if (!db || !isConnected) {
      await connectToDatabase();
    }

    const symbolsCollection = db![MONGODB_CONFIG.collections.symbols];
    const symbols: DatabaseSymbol[] = [];
    
    symbolsCollection.forEach((symbolData: DatabaseSymbol, symbol: string) => {
      symbols.push({
        symbol,
        name: symbolData.name || symbol,
        priceDataAvailable: symbolData.priceDataAvailable || false,
        fundamentalDataAvailable: symbolData.fundamentalDataAvailable || false,
        priceDataCount: symbolData.priceDataCount || 0,
        fundamentalDataCount: symbolData.fundamentalDataCount || 0,
        lastUpdated: symbolData.lastUpdated || 'Never',
        status: symbolData.status || 'missing'
      });
    });

    console.log(`Retrieved ${symbols.length} symbols from MongoDB`);
    return symbols;
  } catch (error) {
    console.error('Failed to get symbols from MongoDB:', error);
    throw new Error('Failed to retrieve symbols from database');
  }
};

// Get price data for a symbol from MongoDB
export const getPriceDataFromMongoDB = async (symbol: string): Promise<PriceData[]> => {
  try {
    if (!db || !isConnected) {
      await connectToDatabase();
    }

    const priceCollection = db![MONGODB_CONFIG.collections.priceData];
    const priceData = priceCollection.get(symbol) || [];
    
    console.log(`Retrieved ${priceData.length} price records for ${symbol} from MongoDB`);
    return priceData;
  } catch (error) {
    console.error(`Failed to get price data for ${symbol}:`, error);
    throw new Error(`Failed to retrieve price data for ${symbol}`);
  }
};

// Get fundamental data for a symbol from MongoDB
export const getFundamentalDataFromMongoDB = async (symbol: string): Promise<FundamentalData | null> => {
  try {
    if (!db || !isConnected) {
      await connectToDatabase();
    }

    const fundamentalCollection = db![MONGODB_CONFIG.collections.fundamentalData];
    const fundamentalData = fundamentalCollection.get(symbol) || null;
    
    if (fundamentalData) {
      console.log(`Retrieved fundamental data for ${symbol} from MongoDB`);
    } else {
      console.log(`No fundamental data found for ${symbol} in MongoDB`);
    }
    
    return fundamentalData;
  } catch (error) {
    console.error(`Failed to get fundamental data for ${symbol}:`, error);
    throw new Error(`Failed to retrieve fundamental data for ${symbol}`);
  }
};

// Delete symbol from MongoDB
export const deleteSymbolFromMongoDB = async (symbol: string): Promise<void> => {
  try {
    if (!db || !isConnected) {
      await connectToDatabase();
    }

    // Remove from all collections
    const symbolsCollection = db![MONGODB_CONFIG.collections.symbols];
    const priceCollection = db![MONGODB_CONFIG.collections.priceData];
    const fundamentalCollection = db![MONGODB_CONFIG.collections.fundamentalData];
    
    symbolsCollection.delete(symbol);
    priceCollection.delete(symbol);
    fundamentalCollection.delete(symbol);

    console.log(`Deleted symbol ${symbol} from MongoDB`);
  } catch (error) {
    console.error(`Failed to delete symbol ${symbol}:`, error);
    throw new Error(`Failed to delete symbol ${symbol}`);
  }
};

// Get database statistics
export const getDatabaseStatsFromMongoDB = async (): Promise<{
  totalSymbols: number;
  symbolsWithPriceData: number;
  symbolsWithFundamentalData: number;
  totalPriceRecords: number;
  totalFundamentalRecords: number;
  lastUpdate: string | null;
}> => {
  try {
    if (!db || !isConnected) {
      await connectToDatabase();
    }

    const symbolsCollection = db![MONGODB_CONFIG.collections.symbols];
    const priceCollection = db![MONGODB_CONFIG.collections.priceData];
    const fundamentalCollection = db![MONGODB_CONFIG.collections.fundamentalData];
    
    let totalSymbols = 0;
    let symbolsWithPriceData = 0;
    let symbolsWithFundamentalData = 0;
    let totalPriceRecords = 0;
    let totalFundamentalRecords = 0;
    let lastUpdate: string | null = null;

    // Count symbols and data
    symbolsCollection.forEach((symbolData: DatabaseSymbol) => {
      totalSymbols++;
      if (symbolData.priceDataAvailable) symbolsWithPriceData++;
      if (symbolData.fundamentalDataAvailable) symbolsWithFundamentalData++;
      if (!lastUpdate || symbolData.lastUpdated > lastUpdate) {
        lastUpdate = symbolData.lastUpdated;
      }
    });

    // Count price records
    priceCollection.forEach((priceData: PriceData[]) => {
      totalPriceRecords += priceData.length;
    });

    // Count fundamental records
    totalFundamentalRecords = fundamentalCollection.size;

    const stats = {
      totalSymbols,
      symbolsWithPriceData,
      symbolsWithFundamentalData,
      totalPriceRecords,
      totalFundamentalRecords,
      lastUpdate
    };

    console.log('Database statistics:', stats);
    return stats;
  } catch (error) {
    console.error('Failed to get database statistics:', error);
    throw new Error('Failed to retrieve database statistics');
  }
};

// Check database connection status
export const isDatabaseConnected = (): boolean => {
  return isConnected;
};

// Get database size information
export const getDatabaseSize = async (): Promise<{
  symbolsCollectionSize: number;
  priceDataCollectionSize: number;
  fundamentalDataCollectionSize: number;
  totalEstimatedSize: string;
}> => {
  try {
    if (!db || !isConnected) {
      await connectToDatabase();
    }

    const symbolsCollection = db![MONGODB_CONFIG.collections.symbols];
    const priceCollection = db![MONGODB_CONFIG.collections.priceData];
    const fundamentalCollection = db![MONGODB_CONFIG.collections.fundamentalData];
    
    const symbolsCollectionSize = symbolsCollection.size;
    const priceDataCollectionSize = priceCollection.size;
    const fundamentalDataCollectionSize = fundamentalCollection.size;
    
    // Rough estimation (each record ~200 bytes average)
    const totalEstimatedSize = (
      (symbolsCollectionSize * 500) + 
      (priceDataCollectionSize * 10000) + 
      (fundamentalDataCollectionSize * 2000)
    ).toLocaleString();

    const sizeInfo = {
      symbolsCollectionSize,
      priceDataCollectionSize,
      fundamentalDataCollectionSize,
      totalEstimatedSize
    };

    console.log('Database size information:', sizeInfo);
    return sizeInfo;
  } catch (error) {
    console.error('Failed to get database size:', error);
    throw new Error('Failed to retrieve database size');
  }
};
