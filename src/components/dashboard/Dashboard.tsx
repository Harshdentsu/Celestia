
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import ChatInterface from '../chat/ChatInterface';
import Analytics from '../analytics/Analytics';
import DataTable from '../data/DataTable';
import { MessageSquare, BarChart3, Database, LogOut, Bell, User, MapPin, Phone, Shield } from 'lucide-react';

interface DashboardProps {
  userRole: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const { user, logout } = useAuth();
  const { skus, claims, sales } = useData();

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'dealer':
        return `Welcome back, ${user.name}! Query your SKU availability, sales data, and claim statuses.`;
      case 'sales_rep':
        return `Hello ${user.name}! Access dealer performance, regional sales insights, and product trends for ${user.region}.`;
      case 'admin':
        return `Welcome ${user.name}! You have full system access to all data, analytics, and system logs.`;
      default:
        return 'Welcome to the Manufacturing AI Assistant!';
    }
  };

  const getRolePermissions = () => {
    switch (user?.role) {
      case 'dealer':
        return ['View Own Sales', 'SKU Availability', 'Own Claims', 'Submit Claims'];
      case 'sales_rep':
        return ['Dealer Performance', 'Regional Sales', 'Product Trends', 'Regional Analytics'];
      case 'admin':
        return ['Full Data Access', 'System Logs', 'User Management', 'Claim Approval'];
      default:
        return [];
    }
  };

  const getStats = () => {
    const totalSKUs = skus.length;
    const activeClaims = claims.filter(c => c.status === 'Pending').length;
    const todaySales = sales.filter(s => s.date === new Date().toISOString().split('T')[0]).length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);

    return { totalSKUs, activeClaims, todaySales, totalRevenue };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Manufacturing AI Assistant
              </h1>
              <Badge variant="secondary" className="capitalize">
                {user?.role?.replace('_', ' ')} - {user?.accessLevel}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Section */}
        <div className="mb-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {getWelcomeMessage()}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{user?.region} - {user?.zone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{user?.contact}</span>
                  </div>
                  {user?.dealerId && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>ID: {user.dealerId}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Role Permissions</CardTitle>
                <CardDescription>Your current access level and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {getRolePermissions().map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {user?.role === 'dealer' ? 'Available SKUs' : 'Total SKUs'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalSKUs}</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {user?.role === 'dealer' ? 'My Claims' : 'Pending Claims'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.activeClaims}</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {user?.role === 'dealer' ? 'My Sales' : "Today's Sales"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.todaySales}</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {user?.role === 'dealer' ? 'My Revenue' : 'Total Revenue'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ₹{(stats.totalRevenue / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>AI Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <ChatInterface userRole={user?.role} />
          </TabsContent>
          
          <TabsContent value="analytics">
            <Analytics userRole={user?.role} />
          </TabsContent>
          
          <TabsContent value="data">
            <DataTable userRole={user?.role} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
