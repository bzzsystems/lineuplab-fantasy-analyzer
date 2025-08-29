interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheConfig {
  seasonData: number;    // 30 minutes 
  weeklyData: number;    // 15 minutes
  leagueData: number;    // 60 minutes (most expensive)
}

class DataCache {
  private static instance: DataCache;
  private cache = new Map<string, CacheEntry<any>>();
  
  // Cache expiry times in milliseconds
  private config: CacheConfig = {
    seasonData: 30 * 60 * 1000,   // 30 minutes
    weeklyData: 15 * 60 * 1000,   // 15 minutes  
    leagueData: 60 * 60 * 1000    // 60 minutes
  };

  static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache();
    }
    return DataCache.instance;
  }

  private generateKey(type: keyof CacheConfig, ...identifiers: (string | number)[]): string {
    return `${type}_${identifiers.join('_')}`;
  }

  set<T>(type: keyof CacheConfig, data: T, ...identifiers: (string | number)[]): void {
    const key = this.generateKey(type, ...identifiers);
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiry: now + this.config[type]
    };
    
    this.cache.set(key, entry);
    console.log(`📦 Cached ${type} data:`, key, `(expires in ${this.config[type]/1000/60}min)`);
  }

  get<T>(type: keyof CacheConfig, ...identifiers: (string | number)[]): T | null {
    const key = this.generateKey(type, ...identifiers);
    const entry = this.cache.get(key);
    
    if (!entry) {
      console.log(`❌ Cache miss: ${key}`);
      return null;
    }

    const now = Date.now();
    if (now > entry.expiry) {
      console.log(`⏰ Cache expired: ${key}`);
      this.cache.delete(key);
      return null;
    }

    const ageMinutes = Math.round((now - entry.timestamp) / 1000 / 60);
    console.log(`✅ Cache hit: ${key} (${ageMinutes}min old)`);
    return entry.data as T;
  }

  isStale<T>(type: keyof CacheConfig, staleThreshold: number = 0.7, ...identifiers: (string | number)[]): boolean {
    const key = this.generateKey(type, ...identifiers);
    const entry = this.cache.get(key);
    
    if (!entry) return true;
    
    const now = Date.now();
    const age = now - entry.timestamp;
    const maxAge = this.config[type];
    
    return (age / maxAge) > staleThreshold;
  }

  clear(type?: keyof CacheConfig): void {
    if (type) {
      // Clear specific type
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(type));
      keysToDelete.forEach(key => this.cache.delete(key));
      console.log(`🧹 Cleared ${type} cache (${keysToDelete.length} entries)`);
    } else {
      // Clear all
      this.cache.clear();
      console.log('🧹 Cleared all cache');
    }
  }

  getStats(): { size: number; entries: Array<{ key: string; age: number; expires: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Math.round((now - entry.timestamp) / 1000 / 60), // minutes
      expires: Math.round((entry.expiry - now) / 1000 / 60) // minutes
    }));

    return {
      size: this.cache.size,
      entries: entries.sort((a, b) => b.expires - a.expires)
    };
  }
}

export const dataCache = DataCache.getInstance();