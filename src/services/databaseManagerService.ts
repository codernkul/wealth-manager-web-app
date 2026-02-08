// Database Manager Service for incremental updates and database management

import { DatabaseSymbol } from './databaseService';

export interface UpdateSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
  lastRun: string | null;
}

export interface UpdateProgress {
  symbol: string;
  progress: number;
  status: 'pending' | 'updating' | 'completed' | 'error';
  message: string;
}

class DatabaseManagerService {
  private updateSchedules: Map<string, UpdateSchedule> = new Map();
  private isRunning: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  // Schedule management
  addUpdateSchedule(schedule: UpdateSchedule): void {
    this.updateSchedules.set(schedule.id, schedule);
  }

  removeUpdateSchedule(scheduleId: string): void {
    this.updateSchedules.delete(scheduleId);
  }

  getUpdateSchedules(): UpdateSchedule[] {
    return Array.from(this.updateSchedules.values());
  }

  async createUpdateSchedule(schedule: UpdateSchedule): Promise<void> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would save to your database
      console.log(`Created update schedule: ${schedule.name} (${schedule.frequency})`);
      this.addUpdateSchedule(schedule);
    } catch (error) {
      console.error('Error creating update schedule:', error);
      throw new Error('Failed to create update schedule');
    }
  }

  async getUpdateSchedulesFromDB(): Promise<UpdateSchedule[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In production, this would fetch from your database
      return [];
    } catch (error) {
      console.error('Error fetching update schedules:', error);
      throw new Error('Failed to fetch update schedules');
    }
  }

  // Incremental update functionality
  async startIncrementalUpdates(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Incremental updates are already running');
    }

    this.isRunning = true;
    console.log('Starting incremental database updates...');

    try {
      const schedules = this.getUpdateSchedules().filter(s => s.enabled);
      
      // Set up interval to check for due updates
      this.updateInterval = setInterval(async () => {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

        for (const schedule of schedules) {
          const scheduleTime = schedule.time;
          
          // Check if schedule is due (same day and time has passed)
          if (this.isScheduleDue(schedule, now, currentTime)) {
            await this.runScheduledUpdate(schedule);
          }
        }
      }, 60000); // Check every minute
    } catch (error) {
      console.error('Error starting incremental updates:', error);
      this.isRunning = false;
      throw error;
    }
  }

  async stopIncrementalUpdates(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('Stopped incremental database updates');
  }

  private isScheduleDue(schedule: UpdateSchedule, now: Date, currentTime: string): boolean {
    const lastRun = schedule.lastRun ? new Date(schedule.lastRun) : new Date(0);
    const today = now.toDateString();
    const lastRunDate = lastRun.toDateString();

    // Check if it's time to run based on frequency
    switch (schedule.frequency) {
      case 'daily':
        return today > lastRunDate && currentTime >= schedule.time;
        
      case 'weekly':
        const daysSinceLastRun = Math.floor((now.getTime() - lastRun.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceLastRun >= 7 && currentTime >= schedule.time;
      
      case 'monthly':
        const monthsSinceLastRun = (now.getFullYear() - lastRun.getFullYear()) * 12 + (now.getMonth() - lastRun.getMonth());
        return monthsSinceLastRun >= 1 && currentTime >= schedule.time;
      
      default:
        return false;
    }
  }

  private async runScheduledUpdate(schedule: UpdateSchedule): Promise<void> {
    console.log(`Running scheduled update: ${schedule.name} (${schedule.id})`);
    
    try {
      // Get all symbols from database
      const { financialDataService } = await import('./financialDataService');
      const symbols = await financialDataService.getDatabaseSymbols();
      
      // Update progress tracking
      const progress: UpdateProgress[] = symbols.map(symbol => ({
        symbol: symbol.symbol,
        progress: 0,
        status: 'pending' as const,
        message: 'Waiting to start...'
      }));

      // Process symbols in batches for incremental updates
      const batchSize = 50; // Smaller batches for incremental updates
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        
        // Update progress for current batch
        batch.forEach((symbol, batchIndex) => {
          const globalIndex = i + batchIndex;
          progress[globalIndex] = {
            ...progress[globalIndex],
            status: 'updating' as const,
            message: 'Updating price data...'
          };
        });

        // Process batch in parallel
        const batchPromises = batch.map(async (symbol) => {
          try {
            // Get last available date for incremental update
            const lastDate = await financialDataService.getLastAvailableDate(symbol.symbol);
            
            // Download only new data since last update
            const priceData = lastDate 
              ? await financialDataService.downloadIncrementalPriceData(symbol.symbol, lastDate)
              : await financialDataService.downloadPriceData(symbol.symbol);

            // Save updated data
            await financialDataService.savePriceData(symbol.symbol, priceData);

            return { symbol: symbol.symbol, success: true, dataCount: priceData.length };
          } catch (error) {
            console.error(`Failed to update ${symbol.symbol}:`, error);
            return { symbol: symbol.symbol, success: false, error };
          }
        });

        await Promise.allSettled(batchPromises);
        
        // Small delay between batches to avoid overwhelming APIs
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Update schedule last run time
      schedule.lastRun = new Date().toISOString();
      this.updateSchedules.set(schedule.id, { ...schedule });

      console.log(`Completed scheduled update: ${schedule.name}`);
    } catch (error) {
      console.error(`Failed to run scheduled update ${schedule.id}:`, error);
    }
  }

  // Manual update trigger
  async triggerManualUpdate(): Promise<void> {
    console.log('Triggering manual database update...');
    
    try {
      const { financialDataService } = await import('./financialDataService');
      const symbols = await financialDataService.getDatabaseSymbols();
      
      const progress: UpdateProgress[] = symbols.map(symbol => ({
        symbol: symbol.symbol,
        progress: 0,
        status: 'pending' as const,
        message: 'Manual update pending...'
      }));

      // Process all symbols for manual update
      const batchSize = 100;
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        
        batch.forEach((symbol, batchIndex) => {
          const globalIndex = i + batchIndex;
          progress[globalIndex] = {
            ...progress[globalIndex],
            status: 'updating' as const,
            message: 'Manual update in progress...'
          };
        });

        const batchPromises = batch.map(async (symbol) => {
          try {
            // Force full refresh for manual updates
            const priceData = await financialDataService.downloadPriceData(symbol.symbol);
            await financialDataService.savePriceData(symbol.symbol, priceData);
            
            return { symbol: symbol.symbol, success: true, dataCount: priceData.length };
          } catch (error) {
            return { symbol: symbol.symbol, success: false, error };
          }
        });

        await Promise.allSettled(batchPromises);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('Manual database update completed');
    } catch (error) {
      console.error('Manual database update failed:', error);
      throw error;
    }
  }

  // Database maintenance
  async getDatabaseStats(): Promise<{
    totalSymbols: number;
    symbolsWithPriceData: number;
    symbolsWithFundamentalData: number;
    lastUpdate: string | null;
    totalPriceRecords: number;
    totalFundamentalRecords: number;
  }> {
    const { financialDataService } = await import('./financialDataService');
    const symbols = await financialDataService.getDatabaseSymbols();
    
    const stats = {
      totalSymbols: symbols.length,
      symbolsWithPriceData: symbols.filter(s => s.priceDataAvailable).length,
      symbolsWithFundamentalData: symbols.filter(s => s.fundamentalDataAvailable).length,
      lastUpdate: symbols.length > 0 ? 
        Math.max(...symbols.map(s => s.lastUpdated ? new Date(s.lastUpdated).getTime() : 0)) > 0 ?
          new Date(Math.max(...symbols.map(s => s.lastUpdated ? new Date(s.lastUpdated).getTime() : 0))).toISOString() : 
          null : null,
      totalPriceRecords: symbols.reduce((sum: number, s: DatabaseSymbol) => sum + s.priceDataCount, 0),
      totalFundamentalRecords: symbols.reduce((sum: number, s: DatabaseSymbol) => sum + s.fundamentalDataCount, 0)
    };

    return stats;
  }

  // Status checking
  isUpdateRunning(): boolean {
    return this.isRunning;
  }

  getActiveSchedules(): UpdateSchedule[] {
    return this.getUpdateSchedules().filter(s => s.enabled);
  }
}

export const databaseManagerService = new DatabaseManagerService();
