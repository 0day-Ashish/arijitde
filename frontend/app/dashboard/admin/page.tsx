'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  CreditCard, 
  PhoneCall, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  UserCheck, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Compass, 
  LogOut, 
  FileText, 
  ChevronRight, 
  X, 
  RefreshCw, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Loader2
} from 'lucide-react';

// Goal Mapping helper
const GOAL_LABELS: Record<string, { label: string; desc: string; icon: any }> = {
  WEALTH_CREATION: { label: 'Wealth Creation', desc: 'Long-term compounding to build a substantial corpus', icon: Sparkles },
  RETIREMENT: { label: 'Retirement Planning', desc: 'Securing financial independence for your post-work years', icon: ShieldCheck },
  SHORT_TERM: { label: 'Short-Term Goals', desc: 'Funding immediate capital needs (1-3 years)', icon: Calendar },
  LONG_TERM: { label: 'Long-Term Goals', desc: 'Buying a house, children\'s education, or other major plans', icon: TrendingUp },
  EXPLORING: { label: 'Exploring Markets', desc: 'Learning options and testing investment strategies', icon: Compass },
};

export default function AdminDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  
  // Dashboard Stage & Data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    pendingPayments: 0,
    totalLeads: 0,
  });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'payments'>('users');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'GUEST' | 'CLIENT' | 'ADMIN'>('ALL');

  // Detail Drawer State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [advisorNotes, setAdvisorNotes] = useState('');
  const [activePlan, setActivePlan] = useState('PREMIUM');
  const [pan, setPan] = useState('');
  const [savingClientProfile, setSavingClientProfile] = useState(false);
  const [updatingUserRole, setUpdatingUserRole] = useState<string | null>(null);

  // Lead status updating state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadStatus, setLeadStatus] = useState<'NEW' | 'CONTACTED' | 'CONVERTED'>('NEW');
  const [leadNotes, setLeadNotes] = useState('');
  const [savingLeadStatus, setSavingLeadStatus] = useState(false);

  // Payment popup screenshot state
  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(null);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // 1. Auth Guard and token initialisation
  useEffect(() => {
    document.title = 'Admin Workspace | FinAnalysis';
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!savedToken || !savedUser) {
      window.location.href = '/onboarding';
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setToken(savedToken);
      setAdminUser(parsedUser);
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/onboarding';
    }
  }, []);

  // 2. Fetch Data when token is ready
  useEffect(() => {
    if (!token) return;
    fetchAdminData(true);
  }, [token]);

  const fetchAdminData = async (showFullLoader = false) => {
    try {
      if (showFullLoader) {
        setLoading(true);
      }
      setError(null);
      const headers = { 'Authorization': `Bearer ${token}` };

      // Verify role is ADMIN
      const meRes = await fetch(`${backendUrl}/api/auth/me`, { headers });
      if (!meRes.ok) throw new Error('Failed to verify token');
      const meData = await meRes.json();
      
      if (meData.data?.role !== 'ADMIN') {
        setError('Forbidden: You are not authorized to view the admin console.');
        setLoading(false);
        return;
      }

      // Fetch Stats & Users
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/stats`, { headers }),
        fetch(`${backendUrl}/api/admin/users`, { headers })
      ]);

      if (!statsRes.ok || !usersRes.ok) {
        throw new Error('Failed to retrieve system aggregates or user logs');
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData.data);
      setUsersList(usersData.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while fetching admin datasets');
    } finally {
      setLoading(false);
      setIsLoaded(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/onboarding';
  };

  // Promote/Downgrade User Role
  const handleUpdateRole = async (userId: string, newRole: 'GUEST' | 'CLIENT' | 'ADMIN') => {
    try {
      setUpdatingUserRole(userId);
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`${backendUrl}/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update user role');
      }

      const resData = await res.json();
      
      // Update local states
      setUsersList((prev: any[]) => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser((prev: any) => ({ ...prev, role: newRole }));
      }
      
      // Refresh stats
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    } finally {
      setUpdatingUserRole(null);
    }
  };

  // Update Client Profile Details
  const handleUpdateClientProfile = async (userId: string) => {
    try {
      setSavingClientProfile(true);
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`${backendUrl}/api/admin/users/${userId}/client-profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ advisorNotes, activePlan, pan }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update client profile');
      }

      const resData = await res.json();
      
      // Update local states
      const updatedPan = pan.trim() === '' ? null : pan.trim().toUpperCase();
      setUsersList((prev: any[]) => prev.map(u => u.id === userId ? { ...u, pan: updatedPan, client: resData.data } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser((prev: any) => ({ ...prev, pan: updatedPan, client: resData.data }));
      }
      
      alert('Client activation details updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update client profile');
    } finally {
      setSavingClientProfile(false);
    }
  };

  // Update Lead Status
  const handleUpdateLeadStatus = async () => {
    if (!selectedLeadId || !selectedUser) return;
    try {
      setSavingLeadStatus(true);
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`${backendUrl}/api/leads/${selectedLeadId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: leadStatus, notes: leadNotes }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update lead status');
      }

      const resData = await res.json();

      // Update lead in local state
      setUsersList((prev: any[]) => prev.map(u => {
        if (u.id === selectedUser.id) {
          const updatedLeads = u.leads.map((l: any) => l.id === selectedLeadId ? resData.data : l);
          return { ...u, leads: updatedLeads };
        }
        return u;
      }));

      setSelectedUser((prev: any) => {
        const updatedLeads = prev.leads.map((l: any) => l.id === selectedLeadId ? resData.data : l);
        return { ...prev, leads: updatedLeads };
      });

      setSelectedLeadId(null);
      setLeadNotes('');
      alert('Consultation lead updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update lead status');
    } finally {
      setSavingLeadStatus(false);
    }
  };

  // Verify/Approve/Reject Payments
  const handleProcessPayment = async (paymentId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingPaymentId(paymentId);
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`${backendUrl}/api/payments/${paymentId}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, reason: action === 'approve' ? 'Verified by admin' : 'Rejected receipt' }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to process payment');
      }

      const resData = await res.json();

      // Reload admin dataset to update role changes and receipts
      await fetchAdminData();
      
      // If we are currently showing a user in details drawer, re-fetch it from usersList
      if (selectedUser) {
        const updatedUser = usersList.find(u => u.payments.some((p: any) => p.id === paymentId));
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      }

      alert(`Payment transaction has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
    } catch (err: any) {
      alert(err.message || 'Failed to process payment');
    } finally {
      setProcessingPaymentId(null);
    }
  };

  // Filtered Users List
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.phone || '').includes(searchQuery);
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Compile list of pending payments across all users
  const pendingPaymentsList = usersList.flatMap(user => 
    (user.payments || [])
      .filter((p: any) => p.status === 'PENDING')
      .map((p: any) => ({ ...p, user }))
  );

  // Initialize Client edit profile inputs
  const selectUserForDetails = (user: any) => {
    setSelectedUser(user);
    setAdvisorNotes(user.client?.advisorNotes || '');
    setActivePlan(user.client?.activePlan || 'PREMIUM');
    setPan(user.pan || '');
    setSelectedLeadId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-12 h-12 text-neutral-900 animate-spin" />
          <h2 className="text-xl font-bold tracking-wider font-clash">Loading Admin Dashboard...</h2>
          <p className="text-sm text-neutral-500 font-mono">Fetching latest ledger states</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
        <div className="relative z-10 w-full max-w-md bg-white border border-destructive/20 rounded-3xl p-8 text-center shadow-xl">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 font-clash mb-2">Access Denied</h2>
          <p className="text-sm text-neutral-500 mb-8 leading-relaxed font-sans">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 py-3 text-sm font-semibold border border-neutral-200 bg-white rounded-xl hover:bg-neutral-50 transition duration-200 text-neutral-900"
            >
              Go Home
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-3 text-sm font-bold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition duration-200"
            >
              Log In Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex flex-col relative">
      {/* Header Panel */}
      <header className="w-full border-b border-neutral-200 bg-white px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white rounded-xl hover:bg-neutral-100 transition-all duration-200 text-xs font-semibold cursor-pointer text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </a>
          <div className="hidden md:flex items-center gap-3">
            <a href="/" className="text-xl font-bold tracking-wider text-neutral-900 font-chillax select-none hover:opacity-90">
              FinAnalysis
            </a>
            <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest bg-neutral-900 text-white rounded-md">
              Console
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Authenticated Admin</span>
            <span className="text-xs font-semibold text-neutral-900">{adminUser?.email}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 bg-white rounded-xl hover:bg-neutral-100 transition-all duration-200 text-xs font-semibold cursor-pointer text-neutral-900"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight font-clash text-neutral-900">System Dashboard</h1>
            <p className="text-xs text-neutral-500 font-mono mt-1">Real-time telemetry and user record verification</p>
          </div>
          <button 
            onClick={() => fetchAdminData(false)}
            className="p-2.5 border border-neutral-200 bg-white hover:bg-neutral-50 transition duration-200 cursor-pointer text-neutral-500 hover:text-neutral-900 rounded-xl"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          
          {/* Card 1: Users */}
          <div className="border border-neutral-200 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-clash">Total Users</span>
              <div className="p-2 bg-neutral-100 rounded-xl">
                <Users className="w-4 h-4 text-neutral-900" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 font-clash">{stats.totalUsers}</h3>
            <p className="text-[10px] text-neutral-500 font-mono mt-1">Registrations in database</p>
          </div>

          {/* Card 2: Clients */}
          <div className="border border-neutral-200 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-clash">Active Clients</span>
              <div className="p-2 bg-neutral-100 rounded-xl">
                <UserCheck className="w-4 h-4 text-neutral-900" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 font-clash">{stats.totalClients}</h3>
            <p className="text-[10px] text-neutral-500 font-mono mt-1">Premium users activated</p>
          </div>

          {/* Card 3: Pending Payments */}
          <div 
            onClick={() => setActiveTab('payments')}
            className={`border rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-300 cursor-pointer ${
              stats.pendingPayments > 0 ? 'bg-amber-500/10 border-amber-300/40 text-amber-900' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-clash">Pending Payments</span>
              <div className={`p-2 rounded-xl ${stats.pendingPayments > 0 ? 'bg-amber-500/20 text-amber-700' : 'bg-neutral-100 text-neutral-900'}`}>
                <CreditCard className={`w-4 h-4 ${stats.pendingPayments > 0 ? 'animate-pulse' : ''}`} />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 font-clash">{stats.pendingPayments}</h3>
            <p className="text-[10px] text-neutral-500 font-mono mt-1">Awaiting receipt approval</p>
          </div>

          {/* Card 4: Consultations */}
          <div className="border border-neutral-200 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-clash">Consultations</span>
              <div className="p-2 bg-neutral-100 rounded-xl">
                <PhoneCall className="w-4 h-4 text-neutral-900" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 font-clash">{stats.totalLeads}</h3>
            <p className="text-[10px] text-neutral-500 font-mono mt-1">Booked advisory leads</p>
          </div>

        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-neutral-200 gap-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 text-sm font-bold font-clash tracking-wide border-b-2 cursor-pointer transition duration-200 ${
              activeTab === 'users' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Users Registry ({filteredUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 text-sm font-bold font-clash tracking-wide border-b-2 cursor-pointer transition duration-200 flex items-center gap-2 ${
              activeTab === 'payments' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Payments Verification
            {stats.pendingPayments > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-white rounded-full font-bold">
                {stats.pendingPayments}
              </span>
            )}
          </button>
        </div>

        {/* Tab Viewport */}
        <div className="flex-1 w-full min-h-[400px]">
          
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search & Role Filter Header */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users by name, email or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition duration-200 text-neutral-900 placeholder-neutral-400"
                  />
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-2 border border-neutral-200 rounded-xl px-3 bg-white">
                  <Filter className="w-3.5 h-3.5 text-neutral-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="text-xs font-bold font-clash uppercase border-none focus:outline-none bg-transparent py-2.5 cursor-pointer pr-4 text-neutral-900"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="GUEST">Guests</option>
                    <option value="CLIENT">Clients</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs font-sans text-neutral-900">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-widest text-[10px] font-bold text-neutral-500 select-none">
                        <th className="px-6 py-4">Register Date</th>
                        <th className="px-6 py-4">User Details</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Payment Status</th>
                        <th className="px-6 py-4">Activity Summary</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500 font-mono">
                            No matching user accounts found in registry
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr 
                            key={user.id} 
                            className="hover:bg-neutral-50 transition duration-150 group"
                          >
                            <td className="px-6 py-5 whitespace-nowrap font-mono text-neutral-500">
                              {new Date(user.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-5">
                              <div className="font-semibold text-neutral-900 text-sm group-hover:text-neutral-700 transition-colors duration-150">
                                {user.name || 'Anonymous User'}
                              </div>
                              <div className="text-neutral-500 font-mono text-[11px] mt-0.5">{user.email}</div>
                              {user.phone && (
                                <div className="text-neutral-500 font-mono text-[11px] mt-0.5">{user.phone}</div>
                              )}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                                user.role === 'ADMIN' ? 'bg-neutral-900 text-white' :
                                user.role === 'CLIENT' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/25' :
                                'bg-neutral-100 text-neutral-600'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              {user.payments && user.payments.length > 0 ? (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                                  user.payments[0].status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/25' :
                                  user.payments[0].status === 'REJECTED' ? 'bg-rose-500/10 text-rose-700 border border-rose-500/25' :
                                  'bg-amber-500/10 text-amber-700 border border-amber-500/25'
                                }`}>
                                  {user.payments[0].status}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium text-neutral-400 bg-neutral-100 font-mono">
                                  UNPAID
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-neutral-500">
                                <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-200 rounded">
                                  Assessments: {user.assessments?.length || 0}
                                </span>
                                <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-200 rounded">
                                  Portfolios: {user.portfolios?.length || 0}
                                </span>
                                <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-200 rounded">
                                  Payments: {user.payments?.length || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right whitespace-nowrap">
                              <button
                                onClick={() => selectUserForDetails(user)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-900 hover:text-white rounded-lg transition duration-200 text-xs font-semibold cursor-pointer text-neutral-900"
                              >
                                Audit User
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold font-clash text-neutral-500 uppercase tracking-wider mb-2">
                Awaiting Verification ({pendingPaymentsList.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingPaymentsList.length === 0 ? (
                  <div className="col-span-2 border border-dashed border-neutral-200 rounded-2xl p-12 text-center text-sm text-neutral-500 bg-neutral-50 font-mono">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                    All user payment transactions are cleared! No pending verifications.
                  </div>
                ) : (
                  pendingPaymentsList.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="border border-neutral-200 bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition duration-300 text-neutral-900"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-neutral-900 text-sm">
                            {payment.user?.name || 'Anonymous User'}
                          </h3>
                          <p className="text-xs text-neutral-500 font-mono">{payment.user?.email}</p>
                          {payment.user?.phone && (
                            <p className="text-xs text-neutral-600 font-semibold font-mono mt-0.5">Phone: {payment.user.phone}</p>
                          )}
                          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                            Submitted: {new Date(payment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold tracking-tight text-neutral-900 font-clash">
                            ₹{payment.amount.toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 text-[10px] font-mono border border-amber-300/30 block mt-1">
                            {payment.status}
                          </span>
                        </div>
                      </div>

                      <div className="border border-neutral-200 bg-neutral-50 rounded-xl p-3 text-xs font-mono space-y-1">
                        <div><span className="text-neutral-500">UTR ID:</span> {payment.utrId || 'N/A'}</div>
                        <div><span className="text-neutral-500">Payment ID:</span> <span className="text-[10px]">{payment.id}</span></div>
                      </div>

                      {payment.screenshotUrl ? (
                        <div className="relative group border border-neutral-200 rounded-xl overflow-hidden aspect-video bg-black max-h-[140px]">
                          <img 
                            src={`${backendUrl}${payment.screenshotUrl}`} 
                            alt="Receipt Screenshot" 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 cursor-zoom-in"
                            onClick={() => setScreenshotModalUrl(`${backendUrl}${payment.screenshotUrl}`)}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 pointer-events-none">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 px-3 py-1.5 rounded-lg border border-white/20">
                              Zoom Receipt
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-dashed border-neutral-200 rounded-xl py-8 text-center text-xs text-neutral-500 font-mono">
                          No screenshot uploaded
                        </div>
                      )}

                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={() => handleProcessPayment(payment.id, 'reject')}
                          disabled={processingPaymentId === payment.id}
                          className="flex-1 py-2.5 border border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10 text-destructive text-xs font-bold rounded-xl transition duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject Receipt
                        </button>
                        <button
                          onClick={() => handleProcessPayment(payment.id, 'approve')}
                          disabled={processingPaymentId === payment.id}
                          className="flex-1 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                          {processingPaymentId === payment.id ? 'Processing...' : 'Verify & Approve'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </main>

      {/* User Details Slide Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay dim background */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-pointer"
            onClick={() => setSelectedUser(null)}
          />

          {/* Drawer container */}
          <div className="relative z-10 w-full max-w-2xl bg-white border-l border-neutral-200 h-full shadow-2xl overflow-y-auto flex flex-col p-6 md:p-8 animate-in slide-in-from-right duration-350 ease-out text-neutral-900">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
              <div>
                <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Audit Details</span>
                <h2 className="text-xl font-semibold font-clash text-neutral-900 mt-0.5">
                  {selectedUser.name || 'Anonymous User'}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 border border-neutral-200 hover:bg-neutral-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="space-y-6 flex-1">
              
              {/* Account Meta Section */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-3 font-sans">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Account Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono text-neutral-900">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">User ID</span>
                    <span className="text-neutral-900 text-[10.5px] select-all">{selectedUser.id}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Registered Date</span>
                    <span className="text-neutral-900">
                      {new Date(selectedUser.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Email Address</span>
                    <span className="text-neutral-900 select-all">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Phone Number</span>
                    <span className="text-neutral-900">{selectedUser.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">PAN Number</span>
                    <span className="text-neutral-900 font-mono">{selectedUser.pan || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Payment Status</span>
                    {selectedUser.payments && selectedUser.payments.length > 0 ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                        selectedUser.payments[0].status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/25' :
                        selectedUser.payments[0].status === 'REJECTED' ? 'bg-rose-500/10 text-rose-700 border border-rose-500/25' :
                        'bg-amber-500/10 text-amber-700 border border-amber-500/25'
                      }`}>
                        {selectedUser.payments[0].status}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium text-neutral-400 bg-neutral-100 font-mono">
                        UNPAID
                      </span>
                    )}
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="border-t border-neutral-200 pt-4 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 font-clash block">User Access Role</span>
                    <span className="text-[10px] text-neutral-500">Adjust system permissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {updatingUserRole === selectedUser.id && (
                      <Loader2 className="w-4 h-4 text-neutral-900 animate-spin" />
                    )}
                    <select
                      value={selectedUser.role}
                      onChange={(e) => handleUpdateRole(selectedUser.id, e.target.value as any)}
                      disabled={updatingUserRole === selectedUser.id}
                      className="text-xs font-bold font-clash uppercase border border-neutral-200 rounded-xl px-3 py-2 bg-white text-neutral-900 cursor-pointer"
                    >
                      <option value="GUEST">Guest</option>
                      <option value="CLIENT">Client</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Client Activation Profile Section */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4 font-sans">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900">
                    Client Profile Activation
                  </h3>
                  {selectedUser.client ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                      Activated Profile
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 text-[10px] font-bold uppercase tracking-wider border border-neutral-200">
                      Inactive Profile
                    </span>
                  )}
                </div>

                {selectedUser.client && (
                  <div className="text-xs font-mono text-neutral-500">
                    Activated On: {new Date(selectedUser.client.activatedAt).toLocaleString()}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-900 uppercase block mb-1">Active Plan</label>
                    <select
                      value={activePlan}
                      onChange={(e) => setActivePlan(e.target.value)}
                      className="w-full text-xs font-mono border border-neutral-200 rounded-xl px-3 py-2.5 bg-white text-neutral-900 focus:outline-none"
                    >
                      <option value="FREE">Free Tier</option>
                      <option value="LITE">Lite Compound Plan</option>
                      <option value="PREMIUM">Premium Pro Plan (Active)</option>
                      <option value="PRO">Pro Compounding Plan</option>
                      <option value="MAX">Max Portfolio Plan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-900 uppercase block mb-1">PAN Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="Enter 10-digit PAN (e.g. ABCDE1234F)"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      className="w-full text-xs font-mono border border-neutral-200 rounded-xl px-3 py-2.5 bg-white text-neutral-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-900 uppercase block mb-1">Advisor Verification Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Add assessment evaluation, portfolio adjustments notes, or payment screenshot validation comments..."
                      value={advisorNotes}
                      onChange={(e) => setAdvisorNotes(e.target.value)}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2 bg-white text-neutral-900 focus:outline-none font-sans"
                    />
                  </div>

                  <button
                    onClick={() => handleUpdateClientProfile(selectedUser.id)}
                    disabled={savingClientProfile}
                    className="w-full py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {savingClientProfile ? 'Saving Details...' : 'Save Client Configuration'}
                  </button>
                </div>
              </div>

              {/* Onboarding Questionnaire Assessment details */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4 font-sans text-neutral-900">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Onboarding Assessment
                </h3>
                
                {(!selectedUser.assessments || selectedUser.assessments.length === 0) ? (
                  <p className="text-xs text-neutral-500 font-mono text-center py-4">
                    User has not completed the onboarding assessment questionnaire yet.
                  </p>
                ) : (
                  selectedUser.assessments.map((a: any) => {
                    const goalMeta = GOAL_LABELS[a.goal] || { label: a.goal, desc: 'Exploring general models', icon: Compass };
                    const GoalIcon = goalMeta.icon;
                    return (
                      <div key={a.id} className="space-y-4">
                        <div className="flex gap-4 items-start">
                          <div className="p-3 bg-neutral-100 rounded-xl text-neutral-900">
                            <GoalIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-xs text-neutral-500 font-mono">Selected Advisory Goal</div>
                            <h4 className="text-sm font-bold font-clash text-neutral-900 mt-0.5">
                              {goalMeta.label}
                            </h4>
                            <p className="text-xs text-neutral-500 mt-1 font-sans">{goalMeta.desc}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-neutral-200 pt-3 text-xs font-mono">
                          <div>
                            <span className="text-neutral-500 text-[10px] block uppercase">User Declared Age</span>
                            <span className="text-neutral-900 font-bold">{a.age} Years Old</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 text-[10px] block uppercase">Assessed Date</span>
                            <span className="text-neutral-900">{new Date(a.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Uploaded Portfolios & Scores */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4 font-sans text-neutral-900">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Mutual Fund Portfolios ({selectedUser.portfolios?.length || 0})
                </h3>

                {(!selectedUser.portfolios || selectedUser.portfolios.length === 0) ? (
                  <p className="text-xs text-neutral-500 font-mono text-center py-4">
                    No portfolios uploaded by this user yet.
                  </p>
                ) : (
                  selectedUser.portfolios.map((p: any) => (
                    <div key={p.id} className="space-y-4 border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase font-mono">Upload Type: </span>
                          <span className="font-bold font-mono">{p.uploadType}</span>
                        </div>
                        <div className="font-mono text-neutral-500 text-[10.5px]">
                          {new Date(p.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Display Portfolio Scores */}
                      {p.score ? (
                        <div className="border border-neutral-200 bg-white rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-neutral-500 block uppercase font-mono">Compounding Score</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                                p.score.tag === 'ALIGNED' ? 'bg-emerald-500/10 text-emerald-700' :
                                p.score.tag === 'MODERATE' ? 'bg-amber-500/10 text-amber-700' :
                                'bg-destructive/10 text-destructive'
                              }`}>
                                {p.score.tag}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-bold font-clash tracking-tight text-neutral-900">
                                {p.score.total}<span className="text-xs text-neutral-500">/100</span>
                              </span>
                            </div>
                          </div>

                          {/* Individual ratings breakdown */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-2 text-[10px] font-mono border-t border-neutral-200">
                            <div>
                              <div className="flex justify-between text-neutral-500 mb-1">
                                <span>Goal Alignment</span>
                                <span className="font-bold text-neutral-900">{p.score.goalAlignment}%</span>
                              </div>
                              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
                                <div className="bg-neutral-900 h-full rounded-full" style={{ width: `${p.score.goalAlignment}%` }} />
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-neutral-500 mb-1">
                                <span>Asset Allocation</span>
                                <span className="font-bold text-neutral-900">{p.score.assetAlloc}%</span>
                              </div>
                              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
                                <div className="bg-neutral-900 h-full rounded-full" style={{ width: `${p.score.assetAlloc}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-neutral-500 mb-1">
                                <span>Diversification</span>
                                <span className="font-bold text-neutral-900">{p.score.diversification}%</span>
                              </div>
                              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
                                <div className="bg-neutral-900 h-full rounded-full" style={{ width: `${p.score.diversification}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-neutral-500 mb-1">
                                <span>Discipline</span>
                                <span className="font-bold text-neutral-900">{p.score.discipline}%</span>
                              </div>
                              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
                                <div className="bg-neutral-900 h-full rounded-full" style={{ width: `${p.score.discipline}%` }} />
                              </div>
                            </div>
                          </div>

                          {/* Score Insights */}
                          {p.score.insights && Array.isArray(p.score.insights) && p.score.insights.length > 0 && (
                            <div className="border-t border-neutral-200 pt-2 text-xs font-sans text-neutral-500 space-y-1">
                              <span className="text-[10px] text-neutral-900 uppercase font-bold tracking-wide font-clash block mb-1">
                                Advisory Insights
                              </span>
                              {p.score.insights.map((insight: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-1.5">
                                  <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-neutral-900 flex-shrink-0" />
                                  <span>{insight}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-neutral-500 font-mono">Scoring report not yet calculated.</p>
                      )}

                      {/* holdings table breakdown */}
                      {p.rows && p.rows.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-neutral-900 uppercase font-bold tracking-wide font-clash block">
                            Portfolio Holdings ({p.rows.length})
                          </span>
                          <div className="border border-neutral-200 bg-white rounded-xl overflow-hidden text-[10px] font-mono">
                            <table className="w-full text-left text-neutral-900">
                              <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold">
                                  <th className="px-3 py-2">Fund Name</th>
                                  <th className="px-3 py-2">Type</th>
                                  <th className="px-3 py-2 text-right">Invested</th>
                                  <th className="px-3 py-2 text-right">Current Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-200">
                                {p.rows.map((row: any) => (
                                  <tr key={row.id} className="hover:bg-neutral-50">
                                    <td className="px-3 py-2 text-neutral-900 font-semibold truncate max-w-[150px]" title={row.fundName}>
                                      {row.fundName}
                                    </td>
                                    <td className="px-3 py-2 text-neutral-500">{row.type}</td>
                                    <td className="px-3 py-2 text-right text-neutral-900">₹{row.invested.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right text-neutral-900 font-semibold">₹{row.currentValue.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Consultation Booking Leads */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4 font-sans text-neutral-900">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Advisory Leads ({selectedUser.leads?.length || 0})
                </h3>

                {(!selectedUser.leads || selectedUser.leads.length === 0) ? (
                  <p className="text-xs text-neutral-500 font-mono text-center py-4">
                    No consultation calls booked by this user.
                  </p>
                ) : (
                  selectedUser.leads.map((l: any) => (
                    <div 
                      key={l.id} 
                      className={`border rounded-xl p-4 space-y-3 shadow-sm ${
                        selectedLeadId === l.id ? 'bg-white border-neutral-300 ring-1 ring-neutral-900' : 'bg-white border-neutral-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono text-neutral-500 uppercase">Contact Info</span>
                          <h4 className="text-xs font-bold text-neutral-900 font-mono">{l.phone}</h4>
                          <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                            Name on Lead: {l.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${
                            l.status === 'CONVERTED' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' :
                            l.status === 'CONTACTED' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' :
                            'bg-neutral-100 text-neutral-600 border border-neutral-200'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[10px] font-mono border-t border-neutral-200 pt-2 text-neutral-500">
                        <div>
                          <span>Preferred Time Slot</span>
                          <span className="block text-neutral-900 font-bold mt-0.5">
                            {l.slot ? new Date(l.slot).toLocaleString() : 'As soon as possible'}
                          </span>
                        </div>
                        <div>
                          <span>Booked On</span>
                          <span className="block text-neutral-900 mt-0.5">{new Date(l.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {l.notes && (
                        <div className="text-[11px] font-mono bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 text-neutral-600">
                          <span className="text-[9px] text-neutral-900 uppercase font-bold font-clash block mb-1">Advisor Notes</span>
                          {l.notes}
                        </div>
                      )}

                      {/* Lead Action Form Toggle */}
                      {selectedLeadId === l.id ? (
                        <div className="border-t border-neutral-200 pt-3 mt-2 space-y-3 font-sans">
                          <div>
                            <label className="text-[10px] font-bold text-neutral-900 uppercase block mb-1">Update Status</label>
                            <select
                              value={leadStatus}
                              onChange={(e: any) => setLeadStatus(e.target.value)}
                              className="w-full text-xs font-mono border border-neutral-200 rounded-lg px-2.5 py-2 bg-white text-neutral-900 focus:outline-none"
                            >
                              <option value="NEW">NEW - Awaiting Contact</option>
                              <option value="CONTACTED">CONTACTED - Call Completed</option>
                              <option value="CONVERTED">CONVERTED - Signed Premium Client</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-neutral-900 uppercase block mb-1">Add Lead Notes</label>
                            <textarea
                              rows={2}
                              placeholder="Describe conversation results, client needs or schedule details..."
                              value={leadNotes}
                              onChange={(e) => setLeadNotes(e.target.value)}
                              className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-white text-neutral-900 focus:outline-none"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedLeadId(null)}
                              className="flex-1 py-2 text-xs font-bold border border-neutral-200 rounded-lg hover:bg-neutral-50 transition duration-200 cursor-pointer text-neutral-900"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleUpdateLeadStatus}
                              disabled={savingLeadStatus}
                              className="flex-1 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition duration-200 cursor-pointer disabled:opacity-50"
                            >
                              {savingLeadStatus ? 'Saving...' : 'Update Lead'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedLeadId(l.id);
                            setLeadStatus(l.status);
                            setLeadNotes(l.notes || '');
                          }}
                          className="w-full mt-2 py-1.5 border border-neutral-200 text-[10px] font-bold tracking-wider uppercase bg-white hover:bg-neutral-50 rounded-lg transition duration-200 cursor-pointer text-center text-neutral-900"
                        >
                          Modify Consultation Status
                        </button>
                      )}

                    </div>
                  ))
                )}
              </div>

              {/* Payments History */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4 font-sans text-neutral-900">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Payments Ledger ({selectedUser.payments?.length || 0})
                </h3>

                {(!selectedUser.payments || selectedUser.payments.length === 0) ? (
                  <p className="text-xs text-neutral-500 font-mono text-center py-4">
                    No payment transactions recorded.
                  </p>
                ) : (
                  selectedUser.payments.map((p: any) => (
                    <div key={p.id} className="border border-neutral-200 bg-white rounded-xl p-4 flex flex-col gap-3 font-sans">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase font-mono">Amount: </span>
                          <span className="font-bold text-neutral-900 font-mono text-sm">₹{p.amount.toLocaleString()}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${
                          p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' :
                          p.status === 'REJECTED' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                          'bg-amber-500/10 text-amber-700 border border-amber-500/20 animate-pulse'
                        }`}>
                          {p.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-neutral-500 border-t border-neutral-200 pt-2">
                        <div>
                          <span>UTR Transaction ID</span>
                          <span className="block text-neutral-900 mt-0.5">{p.utrId || 'N/A'}</span>
                        </div>
                        <div>
                          <span>Submitted On</span>
                          <span className="block text-neutral-900 mt-0.5">{new Date(p.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {p.screenshotUrl && (
                        <div className="flex items-center justify-between border-t border-neutral-200 pt-2 mt-1">
                          <button
                            onClick={() => setScreenshotModalUrl(`${backendUrl}${p.screenshotUrl}`)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-700 hover:text-neutral-900 tracking-wider uppercase font-clash cursor-pointer"
                          >
                            Inspect Receipt Screenshot
                            <ExternalLink className="w-3 h-3 text-neutral-500" />
                          </button>

                          {p.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleProcessPayment(p.id, 'reject')}
                                disabled={processingPaymentId === p.id}
                                className="px-2 py-1 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded font-mono text-[9px] font-bold cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleProcessPayment(p.id, 'approve')}
                                disabled={processingPaymentId === p.id}
                                className="px-2 py-1 bg-neutral-900 text-white hover:bg-neutral-800 rounded font-mono text-[9px] font-bold cursor-pointer"
                              >
                                Approve
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Screenshot Zoom Modal Overlay */}
      {screenshotModalUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-zoom-out"
            onClick={() => setScreenshotModalUrl(null)}
          />
          <div className="relative z-10 w-full max-w-3xl bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xl flex flex-col items-center text-neutral-900">
            <button
              onClick={() => setScreenshotModalUrl(null)}
              className="absolute top-4 right-4 p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full border border-neutral-200 cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-full max-h-[80vh] overflow-auto flex items-center justify-center p-2 mt-6">
              <img 
                src={screenshotModalUrl} 
                alt="Enlarged transaction proof" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md border border-neutral-200 bg-neutral-50"
              />
            </div>
            <div className="text-[10px] text-neutral-500 font-mono mt-4 text-center">
              Click outside the modal or click the close icon to dismiss.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
