'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  CreditCard, 
  Mail, 
  TrendingUp, 
  UserPlus, 
  Settings,
  Download,
  RefreshCw,
  Search,
  Filter,
  Shield,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { config } from '@/lib/config';

interface User {
  id: string;
  email: string;
  display_name: string;
  credits: number;
  status: string;
  subscription_tier: string;
  created_at: number;
  last_login: number;
  total_spent: number;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: number;
}

interface EmailLog {
  id: string;
  user_id: string;
  email_type: string;
  status: string;
  sent_at: number;
  created_at: number;
}

// Admin Dashboard Component - Client-side only
function AdminDashboardContent() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState('');

  // Use auth context for authentication
  const isAdminAuthenticated = isAdmin && user;

  // Debug authentication status
  useEffect(() => {
    console.log('🔍 ADMIN AUTH DEBUG:');
    console.log('  - authLoading:', authLoading);
    console.log('  - isAdmin:', isAdmin);
    console.log('  - user:', user);
    console.log('  - user?.id:', user?.id);
    console.log('  - isAdminAuthenticated:', isAdminAuthenticated);
    console.log('  - document.cookie:', typeof document !== 'undefined' ? document.cookie : 'N/A');
  }, [authLoading, isAdmin, user, isAdminAuthenticated]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAdminAuthenticated) {
      console.log('🚫 No admin authentication - redirecting to login');
        router.push('/login?redirect=/admin');
    }
  }, [authLoading, isAdminAuthenticated, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAdminAuthenticated) {
    return null;
  }

  // Load data only on client side
  useEffect(() => {
    if (isAdminAuthenticated) {
      loadData();
    }
  }, [isAdminAuthenticated]);

  // Auto-refresh data every 30 seconds to catch new users
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing admin data...');
      loadData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAdminAuthenticated]);

  const loadData = async () => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    setLoading(true);
    try {
      console.log('🔍 Loading admin data...');
      
      // Load users from local database first (which should have Google Sheets users synced)
      const usersResponse = await fetch('/api/admin/data');
      console.log('Users response status:', usersResponse.status);
      
      if (!usersResponse.ok) {
        throw new Error(`HTTP error! status: ${usersResponse.status}`);
      }
      
      const data = await usersResponse.json();
      console.log('Admin data:', data);
      
      if (data.users) {
        const rawUsers = data.users || [];
        console.log('Raw users from Google Sheets:', rawUsers);
        console.log('First user structure:', rawUsers[0]);
        
        // Map Google Sheets data to expected format
        const usersList = rawUsers.map((user: any) => ({
          id: user.id || user.uid || user['المعرف'] || '',
          email: user.email || user['البريد الإلكتروني'] || '',
          display_name: user.display_name || user.displayName || user['الاسم'] || '',
          credits: user.credits || user['النقاط'] || 0,
          status: user.status || user['الحالة'] || 'active',
          subscription_tier: user.subscription_tier || user.subscriptionTier || user['نوع الاشتراك'] || 'FREE',
          created_at: user.created_at || user.createdAt || user['تاريخ الإنشاء'] || Date.now(),
          last_login: user.last_login || user.lastLogin || user['آخر دخول'] || Date.now(),
          total_spent: user.total_spent || user.totalSpent || user['إجمالي الإنفاق'] || 0
        }));
        
        console.log('Mapped users:', usersList);
        setUsers(usersList);
        
        // Calculate stats
        const totalUsers = usersList.length;
        const totalCredits = usersList.reduce((sum: number, u: User) => sum + (u.credits || 0), 0);
        
        console.log('Stats:', { totalUsers, totalCredits });
        
        setStats({
          totalUsers,
          totalCredits,
          activeUsers: usersList.filter((u: User) => u.status === 'active').length
        });
      } else {
        console.error('Failed to load users:', usersData.error);
        alert(`فشل في تحميل المستخدمين: ${usersData.error || 'خطأ غير معروف'}`);
      }
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      alert(`خطأ في تحميل البيانات: ${error.message || 'خطأ في الاتصال'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async (userId: string) => {
    if (!creditsToAdd || isNaN(Number(creditsToAdd))) {
      alert('يرجى إدخال عدد صحيح من النقاط');
      return;
    }
    
    try {
      console.log('Adding credits:', { userId, credits: creditsToAdd });
      
      const response = await fetch('/api/admin/add-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          amount: Number(creditsToAdd) 
        })
      });
      
      console.log('Add credits response status:', response.status);
      const data = await response.json();
      console.log('Add credits response data:', data);
      
      if (data.success) {
        alert(`تم إضافة ${creditsToAdd} نقطة بنجاح. النقاط الجديدة: ${data.newCredits || 'غير محدد'}`);
        setCreditsToAdd('');
        setSelectedUser(null);
        loadData(); // Reload data
      } else {
        alert(`فشل في إضافة النقاط: ${data.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      alert(`حدث خطأ أثناء إضافة النقاط: ${error.message || 'خطأ في الاتصال'}`);
    }
  };

  const handleSyncToSheets = async () => {
    try {
      const response = await fetch('/api/admin/sync-sheets', { method: 'POST' });
      if (response.ok) {
        alert('تم مزامنة البيانات مع Google Sheets بنجاح');
      } else {
        const errorData = await response.json();
        alert(`فشل في المزامنة: ${errorData.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Error syncing to sheets:', error);
      alert('فشل في الاتصال بخدمة المزامنة. تأكد من إعداد Google Sheets.');
    }
  };

  const handleClearAllUsers = async () => {
    if (!confirm('⚠️ تحذير: هذا سيحذف جميع المستخدمين نهائياً!\n\nهل أنت متأكد من أنك تريد المتابعة؟')) {
      return;
    }

    if (!confirm('⚠️ تحذير نهائي!\n\nهذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع المستخدمين والبيانات المرتبطة بهم.\n\nهل أنت متأكد 100%؟')) {
      return;
    }

    try {
      console.log('🗑️ Starting complete user cleanup...');
      
      const response = await fetch('/api/admin/clear-all-users', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Clear all users result:', data);
        
        alert('✅ تم حذف جميع المستخدمين بنجاح!\n\nيمكنك الآن البدء مع عملائك الجدد.');
        
        // Reload data to show empty state
        loadData();
      } else {
        const errorData = await response.json();
        alert(`❌ فشل في حذف المستخدمين: ${errorData.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Error clearing all users:', error);
      alert(`❌ حدث خطأ أثناء حذف المستخدمين: ${error.message || 'خطأ في الاتصال'}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع بياناته نهائياً.')) {
      return;
    }

    try {
      console.log('Deleting user:', userId);
      
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies with the request
        body: JSON.stringify({ userId })
      });
      
      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        // Try to get the actual error message from the response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status
          console.log('Could not parse error response:', e);
        }
        
        console.error('Delete user failed:', errorMessage);
        alert(`حدث خطأ أثناء حذف المستخدم: ${errorMessage}`);
        return;
      }

      const data = await response.json();
      console.log('Delete response data:', data);
      
      if (data.success) {
        const cleanupResults = data.deletedUser?.cleanupResults;
        const details = [
          `تم حذف المستخدم: ${data.deletedUser?.email || userId}`,
          `تم حذف ${cleanupResults?.deletedOrders || 0} طلب`,
          `تم حذف ${cleanupResults?.deletedEmailLogs || 0} سجل بريد إلكتروني`,
          `تم حذف ${cleanupResults?.deletedUserContent || 0} محتوى مستخدم`
        ].join('\n');
        
        alert(`تم حذف المستخدم بنجاح!\n\n${details}`);
        loadData(); // Reload data
      } else {
        alert(`فشل في حذف المستخدم: ${data.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`حدث خطأ أثناء حذف المستخدم: ${error.message || 'خطأ في الاتصال'}`);
    }
  };

  const filteredUsers = (users || []).filter(user => {
    if (!user || !user.email) return false;
    
    // If no search term, show all users
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return user.email.toLowerCase().includes(searchLower) ||
           (user.display_name && user.display_name.toLowerCase().includes(searchLower));
  });
  
  console.log('Debug - users:', users);
  console.log('Debug - searchTerm:', searchTerm);
  console.log('Debug - filteredUsers:', filteredUsers);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة الإدارة</h1>
              <p className="text-gray-600 mt-2">إدارة المستخدمين والنقاط والطلبات</p>
              </div>
            <div className="flex space-x-2">
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                تحديث
              </Button>
              <Button onClick={handleSyncToSheets} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                مزامنة
              </Button>
              <Button onClick={handleClearAllUsers} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                مسح الكل
                </Button>
              </div>
            </div>
        </div>

        {/* Stats Cards */}
        {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                  إجمالي المستخدمين
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي النقاط</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalCredits}</div>
              <p className="text-xs text-muted-foreground">
                  نقاط متاحة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المستخدمين النشطين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                  مستخدم نشط
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الطلبات</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">
                  طلب إجمالي
              </p>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Users Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                <CardTitle>المستخدمين</CardTitle>
                <CardDescription>إدارة المستخدمين والنقاط</CardDescription>
                  </div>
              <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="البحث عن مستخدم..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                    />
                  </div>
                </div>
            </div>
          </CardHeader>
          <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                  <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>النقاط</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.display_name || 'غير محدد'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.credits || 0}</Badge>
                    </TableCell>
                        <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status || 'غير محدد'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                      <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                            >
                              إضافة نقاط
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                )) : (
                    <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      لا توجد مستخدمين
                        </TableCell>
                      </TableRow>
                )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

        {/* Add Credits Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>إضافة نقاط</CardTitle>
                <CardDescription>
                  إضافة نقاط للمستخدم: {selectedUser.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="credits">عدد النقاط</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={creditsToAdd}
                    onChange={(e) => setCreditsToAdd(e.target.value)}
                    placeholder="أدخل عدد النقاط"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUser(null)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={() => handleAddCredits(selectedUser.id)}
                  >
                    إضافة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Admin Page with SSR protection
export default function AdminPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return <AdminDashboardContent />;
}