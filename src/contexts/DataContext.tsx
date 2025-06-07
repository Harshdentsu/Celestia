
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';

interface SKU {
  id: string;
  name: string;
  category: string;
  zone: string;
  warehouse: string;
  stock: number;
  price: number;
  description: string | null;
}

interface Claim {
  id: string;
  dealer_id: string | null;
  dealer_name: string;
  amount: number;
  status: string;
  type: string;
  submitted_date: string;
  resolved_date: string | null;
}

interface Sale {
  id: string;
  dealer_id: string | null;
  dealer_name: string;
  sku_id: string | null;
  sku_name: string;
  quantity: number;
  amount: number;
  date: string;
  region: string;
  zone: string;
}

interface Dealer {
  id: string;
  name: string;
  region: string;
  zone: string;
  city: string;
  contact: string;
  status: string;
}

interface DataContextType {
  skus: SKU[];
  claims: Claim[];
  sales: Sale[];
  dealers: Dealer[];
  loading: boolean;
  searchSKU: (query: string) => SKU[];
  searchClaims: (query: string) => Claim[];
  searchSales: (query: string) => Sale[];
  generateEmbedding: (text: string) => number[];
  findSimilarQueries: (query: string) => string[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data from Supabase
      const [skusResponse, claimsResponse, salesResponse, dealersResponse] = await Promise.all([
        supabase.from('skus').select('*'),
        supabase.from('claims').select('*'),
        supabase.from('sales').select('*'),
        supabase.from('dealers').select('*')
      ]);

      if (skusResponse.error) throw skusResponse.error;
      if (claimsResponse.error) throw claimsResponse.error;
      if (salesResponse.error) throw salesResponse.error;
      if (dealersResponse.error) throw dealersResponse.error;

      setSKUs(skusResponse.data || []);
      setClaims(claimsResponse.data || []);
      setSales(salesResponse.data || []);
      setDealers(dealersResponse.data || []);
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Simple text embedding simulation
  const generateEmbedding = (text: string): number[] => {
    const words = text.toLowerCase().split(' ');
    const embedding = new Array(384).fill(0);
    
    words.forEach((word, i) => {
      for (let j = 0; j < word.length && j < embedding.length; j++) {
        embedding[j] += word.charCodeAt(j % word.length) * (i + 1);
      }
    });
    
    return embedding.map(val => val / 1000);
  };

  const findSimilarQueries = (query: string): string[] => {
    const commonQueries = [
      "Show me SKU availability in Chennai",
      "What's the status of my recent claims?",
      "Display sales data for this month",
      "Which products are low in stock?",
      "Show pending claims for approval"
    ];
    
    return commonQueries.filter(q => 
      q.toLowerCase().includes(query.toLowerCase()) || 
      query.toLowerCase().includes(q.toLowerCase())
    );
  };

  const searchSKU = (query: string): SKU[] => {
    return skus.filter(sku => 
      sku.id.toLowerCase().includes(query.toLowerCase()) ||
      sku.name.toLowerCase().includes(query.toLowerCase()) ||
      sku.category.toLowerCase().includes(query.toLowerCase()) ||
      sku.zone.toLowerCase().includes(query.toLowerCase()) ||
      sku.warehouse.toLowerCase().includes(query.toLowerCase())
    );
  };

  const searchClaims = (query: string): Claim[] => {
    return claims.filter(claim =>
      claim.id.toLowerCase().includes(query.toLowerCase()) ||
      claim.dealer_name.toLowerCase().includes(query.toLowerCase()) ||
      claim.status.toLowerCase().includes(query.toLowerCase()) ||
      claim.type.toLowerCase().includes(query.toLowerCase())
    );
  };

  const searchSales = (query: string): Sale[] => {
    return sales.filter(sale =>
      sale.dealer_name.toLowerCase().includes(query.toLowerCase()) ||
      sale.sku_name.toLowerCase().includes(query.toLowerCase()) ||
      sale.region.toLowerCase().includes(query.toLowerCase()) ||
      sale.zone.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <DataContext.Provider value={{
      skus,
      claims,
      sales,
      dealers,
      loading,
      searchSKU,
      searchClaims,
      searchSales,
      generateEmbedding,
      findSimilarQueries,
      refreshData: fetchData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
