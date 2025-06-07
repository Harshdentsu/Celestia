import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useData } from '../../contexts/DataContext';
import { Search, Package, FileText, TrendingUp, Users, RefreshCw } from 'lucide-react';

interface DataTableProps {
  userRole?: string;
}

const DataTable: React.FC<DataTableProps> = ({ userRole }) => {
  const { skus, claims, sales, dealers, loading, refreshData } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSKUs = skus.filter(sku => 
    sku.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sku.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sku.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClaims = claims.filter(claim =>
    claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSales = sales.filter(sale =>
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sku_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDealers = dealers.filter(dealer =>
    dealer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Pending': 'secondary',
      'Approved': 'default',
      'Rejected': 'destructive',
      'Active': 'default',
      'Inactive': 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading data from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Refresh */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search across all data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Tables */}
      <Tabs defaultValue="skus" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skus" className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>SKUs ({filteredSKUs.length})</span>
          </TabsTrigger>
          <TabsTrigger value="claims" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Claims ({filteredClaims.length})</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Sales ({filteredSales.length})</span>
          </TabsTrigger>
          <TabsTrigger value="dealers" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Dealers ({filteredDealers.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* SKUs Table */}
        <TabsContent value="skus">
          <Card>
            <CardHeader>
              <CardTitle>SKU Inventory</CardTitle>
              <CardDescription>Product inventory across all warehouses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2">SKU ID</th>
                      <th className="pb-2">Product Name</th>
                      <th className="pb-2">Category</th>
                      <th className="pb-2">Warehouse</th>
                      <th className="pb-2">Stock</th>
                      <th className="pb-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSKUs.slice(0, 50).map((sku) => (
                      <tr key={sku.id} className="border-b">
                        <td className="py-2 font-mono text-sm">{sku.id}</td>
                        <td className="py-2">{sku.name}</td>
                        <td className="py-2">
                          <Badge variant="outline">{sku.category}</Badge>
                        </td>
                        <td className="py-2">{sku.warehouse}</td>
                        <td className="py-2">
                          <span className={sku.stock < 50 ? 'text-red-600 font-semibold' : ''}>
                            {sku.stock}
                          </span>
                        </td>
                        <td className="py-2">₹{Number(sku.price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims Table */}
        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Claims Management</CardTitle>
              <CardDescription>All dealer claims and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2">Claim ID</th>
                      <th className="pb-2">Dealer</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.slice(0, 50).map((claim) => (
                      <tr key={claim.id} className="border-b">
                        <td className="py-2 font-mono text-sm">{claim.id}</td>
                        <td className="py-2">{claim.dealer_name}</td>
                        <td className="py-2">{claim.type}</td>
                        <td className="py-2">₹{Number(claim.amount).toLocaleString()}</td>
                        <td className="py-2">{getStatusBadge(claim.status)}</td>
                        <td className="py-2">{claim.submitted_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Table */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Transactions</CardTitle>
              <CardDescription>All sales transactions across dealers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2">Sale ID</th>
                      <th className="pb-2">Dealer</th>
                      <th className="pb-2">Product</th>
                      <th className="pb-2">Quantity</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Region</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.slice(0, 50).map((sale) => (
                      <tr key={sale.id} className="border-b">
                        <td className="py-2 font-mono text-sm">{sale.id}</td>
                        <td className="py-2">{sale.dealer_name}</td>
                        <td className="py-2">{sale.sku_name}</td>
                        <td className="py-2">{sale.quantity}</td>
                        <td className="py-2">₹{Number(sale.amount).toLocaleString()}</td>
                        <td className="py-2">{sale.region}</td>
                        <td className="py-2">{sale.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dealers Table */}
        <TabsContent value="dealers">
          <Card>
            <CardHeader>
              <CardTitle>Dealer Directory</CardTitle>
              <CardDescription>All registered dealers and their information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2">Dealer ID</th>
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Region</th>
                      <th className="pb-2">Zone</th>
                      <th className="pb-2">City</th>
                      <th className="pb-2">Contact</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDealers.map((dealer) => (
                      <tr key={dealer.id} className="border-b">
                        <td className="py-2 font-mono text-sm">{dealer.id}</td>
                        <td className="py-2">{dealer.name}</td>
                        <td className="py-2">{dealer.region}</td>
                        <td className="py-2">{dealer.zone}</td>
                        <td className="py-2">{dealer.city}</td>
                        <td className="py-2">{dealer.contact}</td>
                        <td className="py-2">{getStatusBadge(dealer.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataTable;
