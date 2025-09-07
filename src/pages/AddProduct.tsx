import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function AddProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category_id: '',
    batch_number: '',
    purchase_date: '',
    expiry_date: '',
    warranty_date: '',
    price: '',
    store: '',
    notes: '',
    barcode: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const productData = {
        ...formData,
        user_id: user.id,
        price: formData.price ? parseFloat(formData.price) : null,
        purchase_date: formData.purchase_date || null,
        expiry_date: formData.expiry_date || null,
        warranty_date: formData.warranty_date || null,
        category_id: formData.category_id || null,
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      // Create reminders if dates are provided
      const reminders = [];
      if (formData.expiry_date && data) {
        const expiryDate = new Date(formData.expiry_date);
        const reminderDate = new Date(expiryDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days before
        
        reminders.push({
          user_id: user.id,
          product_id: data.id,
          reminder_type: 'expiry',
          reminder_date: reminderDate.toISOString().split('T')[0],
          days_before: 7
        });
      }

      if (formData.warranty_date && data) {
        const warrantyDate = new Date(formData.warranty_date);
        const reminderDate = new Date(warrantyDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before
        
        reminders.push({
          user_id: user.id,
          product_id: data.id,
          reminder_type: 'warranty',
          reminder_date: reminderDate.toISOString().split('T')[0],
          days_before: 30
        });
      }

      // Insert reminders if any
      if (reminders.length > 0) {
        const { error: reminderError } = await supabase
          .from('reminders')
          .insert(reminders);
        
        if (reminderError) {
          console.warn('Failed to create reminders:', reminderError);
        }
      }

      toast({
        title: "Success!",
        description: "Product added successfully",
      });

      navigate('/dashboard');
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-primary">Add New Product</h1>
          <p className="text-muted-foreground">Track expiry dates, warranties, and more</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Fill in the details of your product to start tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g. Organic Milk"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="e.g. Amul"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batch_number">Batch Number</Label>
                    <Input
                      id="batch_number"
                      value={formData.batch_number}
                      onChange={(e) => handleInputChange('batch_number', e.target.value)}
                      placeholder="e.g. LOT001"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Important Dates</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchase_date">Purchase Date</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiry_date">Expiry Date</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="warranty_date">Warranty Until</Label>
                    <Input
                      id="warranty_date"
                      type="date"
                      value={formData.warranty_date}
                      onChange={(e) => handleInputChange('warranty_date', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Purchase Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Purchase Details (Optional)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="299.99"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="store">Store/Shop</Label>
                    <Input
                      id="store"
                      value={formData.store}
                      onChange={(e) => handleInputChange('store', e.target.value)}
                      placeholder="e.g. Big Bazaar"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode/QR Code</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    placeholder="Scan or enter manually"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Adding Product...' : 'Add Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}