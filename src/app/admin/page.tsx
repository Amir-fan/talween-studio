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
  email_verified: boolean;
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
  email_type: string;
  recipient_email: string;
  subject: string;
  status: string;
  sent_at: number;
  created_at: number;
}

export default function AdminDashboard() {
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
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Check for admin authentication immediately
  useEffect(() => {
    console.log('🔍 ADMIN PAGE - Immediate auth check:');
    
    // Check for admin token in cookies first
    if (typeof window !== 'undefined') {
      const adminToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_token='))
        ?.split('=')[1];
      
      if (adminToken) {
        console.log('🔍 Found admin token in cookies, granting admin access');
        setIsAdminAuthenticated(true);
        setIsCheckingAuth(false);
        return;
      }
      
      // Check localStorage for admin user
      const storedUser = localStorage.getItem('talween_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.uid === 'admin') {
            console.log('🔍 Found admin user in localStorage, granting admin access');
            setIsAdminAuthenticated(true);
            setIsCheckingAuth(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }
    
    // If no admin authentication found, redirect immediately
    console.log('🚫 No admin authentication found - redirecting immediately');
    if (!hasRedirected) {
      setHasRedirected(true);
      // Use window.location.href for immediate redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/login?redirect=/admin';
      }
    }
  }, [router]);

  // Also check auth context when it loads
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      console.log('✅ Admin access granted from auth context');
      setIsAdminAuthenticated(true);
      setIsCheckingAuth(false);
    } else if (!authLoading && !isAdminAuthenticated) {
      console.log('🚫 Auth context loaded but no admin access');
      setIsCheckingAuth(false);
    }
  }, [user, isAdmin, authLoading, isAdminAuthenticated]);

  // Show loading while checking authentication or redirecting
  if (isCheckingAuth || (!isAdminAuthenticated && !authLoading) || hasRedirected) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {hasRedirected ? 'جاري التوجيه إلى صفحة تسجيل الدخول...' : 'جاري التحقق من الصلاحيات...'}
          </p>
        </div>
      </div>
    );
  }

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users from Google Sheets
      const usersResponse = await fetch(`${config.googleAppsScriptUrl}?action=getUsers&apiKey=${config.googleSheetsApiKey}`);
      const usersData = await usersResponse.json();
      
      if (usersData.success) {
        setUsers(usersData.users || []);
        
        // Calculate stats from users data
        const users = usersData.users || [];
        const stats = {
          totalUsers: users.length,
          verifiedUsers: users.filter((u: any) => u['البريد الإلكتروني مؤكد'] === 'نعم').length,
          activeUsers: users.filter((u: any) => u['الحالة'] === 'active').length,
          totalCredits: users.reduce((sum: number, u: any) => sum + parseInt(u['النقاط'] || '0'), 0),
          totalSpent: users.reduce((sum: number, u: any) => sum + parseInt(u['إجمالي المدفوع'] || '0'), 0),
          subscriptionTiers: {
            FREE: users.filter((u: any) => u['مستوى الاشتراك'] === 'FREE').length,
            EXPLORER: users.filter((u: any) => u['مستوى الاشتراك'] === 'EXPLORER').length,
            CREATIVE_WORLD: users.filter((u: any) => u['مستوى الاشتراك'] === 'CREATIVE_WORLD').length,
            CREATIVE_TEACHER: users.filter((u: any) => u['مستوى الاشتراك'] === 'CREATIVE_TEACHER').length,
          }
        };
        setStats(stats);
      } else {
        console.error('Failed to load users:', usersData.error);
      }
      
      // For now, set empty arrays for orders and email logs
      setOrders([]);
      setEmailLogs([]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async (userId: string) => {
    if (!creditsToAdd || isNaN(Number(creditsToAdd))) return;
    
    try {
      const response = await fetch(`${config.googleAppsScriptUrl}?action=addCredits&apiKey=${config.googleSheetsApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'addCredits',
          apiKey: config.googleSheetsApiKey,
          userId, 
          amount: Number(creditsToAdd) 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('تم إضافة النقاط بنجاح');
        setCreditsToAdd('');
        setSelectedUser(null);
        loadData();
      } else {
        alert(`فشل في إضافة النقاط: ${data.error}`);
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      alert('حدث خطأ أثناء إضافة النقاط');
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

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      return;
    }

    try {
      const response = await fetch(`${config.googleAppsScriptUrl}?action=deleteUser&apiKey=${config.googleSheetsApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'deleteUser',
          apiKey: config.googleSheetsApiKey,
          userId 
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('تم حذف المستخدم بنجاح');
        loadData(); // Refresh the data
      } else {
        alert(`فشل في حذف المستخدم: ${data.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('فشل في حذف المستخدم');
    }
  };

  const filteredUsers = users.filter(user => 
    (user['البريد الإلكتروني'] || user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user['الاسم'] || user.display_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الإدارة</h1>
          <p className="text-gray-600 mt-2">إدارة المستخدمين والطلبات والنظام</p>
        </div>

        {/* Google Sheets Status */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">حالة Google Sheets</h3>
                <p className="text-sm text-muted-foreground">
                  {process.env.NODE_ENV === 'development' ? 
                    'Google Sheets غير مُعد - استخدم تصدير CSV كبديل' : 
                    'تحقق من إعدادات البيئة لـ Google Sheets'
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.open('/api/admin/export-users', '_blank')} 
                  variant="outline" 
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  تصدير CSV
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.verifiedUsers || 0} محقق من البريد
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي النقاط</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCredits || 0}</div>
              <p className="text-xs text-muted-foreground">
                موزعة على المستخدمين
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalSpent || 0}</div>
              <p className="text-xs text-muted-foreground">
                من جميع الطلبات
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">رسائل البريد</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailLogs.length}</div>
              <p className="text-xs text-muted-foreground">
                إجمالي الرسائل المرسلة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="emails">البريد</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>إدارة المستخدمين</CardTitle>
                    <CardDescription>عرض وإدارة جميع المستخدمين المسجلين</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={loadData} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      تحديث
                    </Button>
                    <Button onClick={handleSyncToSheets} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      مزامنة Google Sheets
                    </Button>
                    <Button 
                      onClick={() => window.open('/api/admin/export-users', '_blank')} 
                      variant="outline" 
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      تصدير CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="البحث في المستخدمين..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>النقاط</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الاشتراك</TableHead>
                      <TableHead>تاريخ التسجيل</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user['المعرف'] || user.id}>
                        <TableCell className="font-medium">{user['الاسم'] || user.display_name || 'غير محدد'}</TableCell>
                        <TableCell>{user['البريد الإلكتروني'] || user.email || 'غير محدد'}</TableCell>
                        <TableCell>{user['النقاط'] || user.credits || 0}</TableCell>
                        <TableCell>
                          <Badge variant={(user['الحالة'] || user.status) === 'active' ? 'default' : 'secondary'}>
                            {(user['الحالة'] || user.status) === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user['مستوى الاشتراك'] || user.subscription_tier || 'FREE'}</Badge>
                        </TableCell>
                        <TableCell>
                          {user['تاريخ الإنشاء'] || (user.created_at ? new Date(user.created_at * 1000).toLocaleDateString('ar-SA') : 'غير محدد')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
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
                              onClick={() => handleDeleteUser(user['المعرف'] || user.id, user['الاسم'] || user.display_name || 'المستخدم')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الطلبات</CardTitle>
                <CardDescription>عرض جميع الطلبات والمبيعات</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الطلب</TableHead>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>{order.user_id}</TableCell>
                        <TableCell>${order.total_amount}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at * 1000).toLocaleDateString('ar-SA')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>سجلات البريد الإلكتروني</CardTitle>
                <CardDescription>عرض جميع الرسائل المرسلة</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>النوع</TableHead>
                      <TableHead>المستقبل</TableHead>
                      <TableHead>الموضوع</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.email_type}</TableCell>
                        <TableCell>{log.recipient_email}</TableCell>
                        <TableCell>{log.subject}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(log.created_at * 1000).toLocaleDateString('ar-SA')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات النظام</CardTitle>
                <CardDescription>إدارة إعدادات النظام والمزامنة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">مزامنة Google Sheets</h3>
                    <p className="text-sm text-muted-foreground">
                      مزامنة جميع البيانات مع Google Sheets
                    </p>
                  </div>
                  <Button onClick={handleSyncToSheets}>
                    <Download className="h-4 w-4 mr-2" />
                    مزامنة الآن
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Credits Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>إضافة نقاط للمستخدم</CardTitle>
                <CardDescription>
                  إضافة نقاط لـ {selectedUser.display_name}
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
                    disabled={!creditsToAdd || isNaN(Number(creditsToAdd))}
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
