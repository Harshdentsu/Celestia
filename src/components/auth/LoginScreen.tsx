
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Building2, Users, Shield } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(credentials);
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to Manufacturing AI Assistant",
        });
        onLogin(credentials.role);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    dealer: Building2,
    sales_rep: Users,
    admin: Shield
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Manufacturing AI Assistant
          </h1>
          <p className="text-xl text-gray-600">
            Intelligent automation for dealer queries, sales analytics, and claim management
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <Building2 className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <CardTitle>Dealer Portal</CardTitle>
              <CardDescription>Query SKU availability, track claims, and view sales</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <CardTitle>Sales Representative</CardTitle>
              <CardDescription>Monitor dealer performance and regional analytics</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto text-purple-600 mb-2" />
              <CardTitle>Admin Access</CardTitle>
              <CardDescription>Full system access and analytics dashboard</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="max-w-md mx-auto animate-scale-in">
          <CardHeader>
            <CardTitle>Login to Continue</CardTitle>
            <CardDescription>
              Use demo credentials: username: dealer1/sales1/admin1, password: password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Select onValueChange={(value) => setCredentials({...credentials, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dealer">Dealer</SelectItem>
                    <SelectItem value="sales_rep">Sales Representative</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;
