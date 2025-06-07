
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  role: 'dealer' | 'sales_rep' | 'admin';
  region?: string;
  dealerId?: string;
  zone?: string;
  city?: string;
  contact?: string;
  permissions: string[];
  accessLevel: 'limited' | 'regional' | 'full';
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { username: string; password: string; role: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  canAccessData: (dataType: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Updated mock users with role-specific fields and permissions
const mockUsers = [
  { 
    id: '1', 
    username: 'dealer1', 
    password: 'password', 
    name: 'Raj Kumar', 
    role: 'dealer', 
    region: 'Chennai',
    zone: 'South',
    city: 'Chennai',
    contact: '+91-9876543210',
    dealerId: 'D001',
    permissions: ['view_own_sales', 'view_sku_availability', 'view_own_claims', 'submit_claims'],
    accessLevel: 'limited'
  },
  { 
    id: '2', 
    username: 'sales1', 
    password: 'password', 
    name: 'Priya Sharma', 
    role: 'sales_rep', 
    region: 'Mumbai',
    zone: 'West',
    city: 'Mumbai',
    contact: '+91-9876543211',
    permissions: ['view_dealer_performance', 'view_regional_sales', 'view_product_trends', 'view_regional_claims', 'view_regional_analytics'],
    accessLevel: 'regional'
  },
  { 
    id: '3', 
    username: 'admin1', 
    password: 'password', 
    name: 'Admin User', 
    role: 'admin',
    region: 'All',
    zone: 'All',
    city: 'Corporate',
    contact: '+91-9876543212',
    permissions: ['view_all_data', 'view_system_logs', 'view_all_analytics', 'manage_users', 'approve_claims', 'view_financial_data'],
    accessLevel: 'full'
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: { username: string; password: string; role: string }): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(
      u => u.username === credentials.username && 
           u.password === credentials.password && 
           u.role === credentials.role
    );

    if (foundUser) {
      setUser({
        id: foundUser.id,
        name: foundUser.name,
        role: foundUser.role as 'dealer' | 'sales_rep' | 'admin',
        region: foundUser.region,
        zone: foundUser.zone,
        city: foundUser.city,
        contact: foundUser.contact,
        dealerId: foundUser.dealerId,
        permissions: foundUser.permissions,
        accessLevel: foundUser.accessLevel as 'limited' | 'regional' | 'full'
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const canAccessData = (dataType: string): boolean => {
    if (!user) return false;
    
    switch (user.accessLevel) {
      case 'full':
        return true;
      case 'regional':
        return ['dealer_performance', 'regional_sales', 'product_trends', 'regional_claims'].includes(dataType);
      case 'limited':
        return ['own_sales', 'sku_availability', 'own_claims'].includes(dataType);
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      hasPermission,
      canAccessData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
