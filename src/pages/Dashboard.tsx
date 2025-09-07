import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Bell, Package, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: { name: string; icon: string; color: string };
  expiry_date: string;
  warranty_date: string;
  is_consumed: boolean;
  created_at: string;
}

interface Stats {
  total_products: number;
  expiring_soon: number;
  warranty_expiring: number;
  categories: { [key: string]: number };
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({ total_products: 0, expiring_soon: 0, warranty_expiring: 0, categories: {} });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, icon, color)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(products || []);
      
      // Calculate stats
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const expiringSoon = products?.filter(p => 
        p.expiry_date && new Date(p.expiry_date) <= thirtyDaysFromNow && new Date(p.expiry_date) >= now
      ).length || 0;
      
      const warrantyExpiring = products?.filter(p => 
        p.warranty_date && new Date(p.warranty_date) <= thirtyDaysFromNow && new Date(p.warranty_date) >= now
      ).length || 0;
      
      const categories = products?.reduce((acc: { [key: string]: number }, product) => {
        const categoryName = product.category?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      }, {}) || {};

      setStats({
        total_products: products?.length || 0,
        expiring_soon: expiringSoon,
        warranty_expiring: warrantyExpiring,
        categories
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getExpiryStatus = (date: string | null) => {
    if (!date) return null;
    const expiryDate = new Date(date);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', days: Math.abs(diffDays), color: 'destructive' };
    if (diffDays <= 7) return { status: 'critical', days: diffDays, color: 'destructive' };
    if (diffDays <= 30) return { status: 'warning', days: diffDays, color: 'secondary' };
    return { status: 'good', days: diffDays, color: 'default' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">TrackMate Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/add-product')} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_products}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.expiring_soon}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warranty Expiring</CardTitle>
              <Calendar className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.warranty_expiring}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
              <Bell className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expiring_soon + stats.warranty_expiring}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>Your latest tracked items</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No products yet</p>
                <p className="text-muted-foreground mb-4">Start by adding your first product to track</p>
                <Button onClick={() => navigate('/add-product')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => {
                  const expiryStatus = getExpiryStatus(product.expiry_date);
                  const warrantyStatus = getExpiryStatus(product.warranty_date);
                  
                  return (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{product.category?.icon || '📦'}</div>
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          {product.brand && <p className="text-sm text-muted-foreground">{product.brand}</p>}
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{product.category?.name || 'Uncategorized'}</Badge>
                            {product.is_consumed && <Badge variant="secondary">Consumed</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        {expiryStatus && (
                          <div className="text-sm">
                            <Badge variant={expiryStatus.color as any} className="text-xs">
                              {expiryStatus.status === 'expired' 
                                ? `Expired ${expiryStatus.days}d ago`
                                : `Expires in ${expiryStatus.days}d`}
                            </Badge>
                          </div>
                        )}
                        {warrantyStatus && (
                          <div className="text-sm">
                            <Badge variant={warrantyStatus.color as any} className="text-xs">
                              {warrantyStatus.status === 'expired' 
                                ? `Warranty expired ${warrantyStatus.days}d ago`
                                : `Warranty expires in ${warrantyStatus.days}d`}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}