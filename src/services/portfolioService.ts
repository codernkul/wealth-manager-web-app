import api from './authService';

export interface AssetAllocation {
  type: string;
  label: string;
  percentage: number;
  targetValue: number;
}

export interface PortfolioCreate {
  name: string;
  description?: string;
  holdings?: Array<{
    symbol: string;
    asset_type: string;
    name?: string;
    quantity: number;
    average_cost: number;
  }>;
}

export interface Holding {
  id: number;
  portfolio_id: number;
  symbol: string;
  name?: string;
  asset_type: string;
  quantity: number;
  average_cost: number;
  current_price: number;
  current_value: number;
  unrealized_gain_loss: number;
  unrealized_gain_loss_percent: number;
  allocation_percent: number;
  last_updated: string;
  created_at: string;
}

export interface Portfolio {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  total_value: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  holdings: Holding[];
}

export interface PortfolioSummary {
  total_value: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  holdings_count: number;
  asset_allocation: Record<string, number>;
  top_performers: Holding[];
  worst_performers: Holding[];
}

export interface PerformanceData {
  total_value: number;
  total_cost: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  holdings: Array<{
    symbol: string;
    name?: string;
    quantity: number;
    average_cost: number;
    current_price: number;
    current_value: number;
    gain_loss: number;
    gain_loss_percent: number;
    daily_change: number;
    daily_change_percent: number;
    last_updated: string;
  }>;
  last_updated: string;
}

export const portfolioService = {
  // Portfolio CRUD operations
  getPortfolios: async (): Promise<Portfolio[]> => {
    console.log('portfolioService.getPortfolios called');
    try {
      const response = await api.get('/portfolios');
      console.log('getPortfolios API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('portfolioService.getPortfolios error:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      throw error;
    }
  },

  createPortfolio: async (portfolioData: PortfolioCreate): Promise<Portfolio> => {
    console.log('portfolioService.createPortfolio called with:', portfolioData);
    try {
      const response = await api.post('/portfolios', portfolioData);
      console.log('API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('portfolioService.createPortfolio error:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      throw error;
    }
  },

  getPortfolio: async (portfolioId: number): Promise<Portfolio> => {
    const response = await api.get(`/portfolios/${portfolioId}`);
    return response.data;
  },

  updatePortfolio: async (portfolioId: number, updateData: Partial<Portfolio>): Promise<Portfolio> => {
    const response = await api.put(`/portfolios/${portfolioId}`, updateData);
    return response.data;
  },

  deletePortfolio: async (portfolioId: number): Promise<void> => {
    await api.delete(`/portfolios/${portfolioId}`);
  },

  // Holdings operations
  getHoldings: async (portfolioId: number): Promise<Holding[]> => {
    const response = await api.get(`/portfolios/${portfolioId}/holdings`);
    return response.data;
  },

  createHolding: async (portfolioId: number, holdingData: Partial<Holding>): Promise<Holding> => {
    const response = await api.post(`/portfolios/${portfolioId}/holdings`, holdingData);
    return response.data;
  },

  updateHolding: async (portfolioId: number, holdingId: number, updateData: Partial<Holding>): Promise<Holding> => {
    const response = await api.put(`/portfolios/${portfolioId}/holdings/${holdingId}`, updateData);
    return response.data;
  },

  deleteHolding: async (portfolioId: number, holdingId: number): Promise<void> => {
    await api.delete(`/portfolios/${portfolioId}/holdings/${holdingId}`);
  },

  // Portfolio summary and performance
  getPortfolioSummary: async (portfolioId: number): Promise<PortfolioSummary> => {
    const response = await api.get(`/portfolios/${portfolioId}/summary`);
    return response.data;
  },

  getOverallSummary: async (): Promise<PortfolioSummary> => {
    const response = await api.get('/portfolios/summary');
    return response.data;
  },

  getPortfolioPerformance: async (portfolioId: number): Promise<PerformanceData> => {
    const response = await api.get(`/portfolios/${portfolioId}/performance`);
    return response.data;
  },

  // CSV operations
  uploadCSV: async (portfolioId: number, file: File): Promise<Holding[]> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/portfolios/${portfolioId}/upload-csv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCSVTemplate: async (): Promise<string> => {
    const response = await api.get('/portfolios/csv-template');
    return response.data.template;
  },

  downloadCSV: async (portfolioId: number): Promise<string> => {
    const response = await api.get(`/portfolios/${portfolioId}/download-csv`);
    return response.data;
  },
};
