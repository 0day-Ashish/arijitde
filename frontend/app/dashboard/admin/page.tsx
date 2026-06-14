'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  User,
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
  Loader2,
  FileSpreadsheet,
  Plus,
  Trash2,
  Save
} from 'lucide-react';

// Goal Mapping helper
const GOAL_LABELS: Record<string, { label: string; desc: string; icon: any }> = {
  WEALTH_CREATION: { label: 'Wealth Creation', desc: 'Long-term compounding to build a substantial corpus', icon: Sparkles },
  RETIREMENT: { label: 'Retirement Planning', desc: 'Securing financial independence for your post-work years', icon: ShieldCheck },
  HOUSE_PURCHASE: { label: 'House Purchase', desc: 'Saving for a dream home', icon: TrendingUp },
  CHILD_EDUCATION: { label: 'Child Education', desc: 'Building a corpus for children\'s education', icon: Calendar },
  MARRIAGE: { label: 'Marriage', desc: 'Funding an upcoming marriage', icon: Sparkles },
  PASSIVE_INCOME: { label: 'Passive Income', desc: 'Generate steady returns from investments', icon: TrendingUp },
  TAX_SAVING: { label: 'Tax Saving', desc: 'Optimizing investments for tax efficiency', icon: ShieldCheck },
  NOT_SURE_YET: { label: 'Not Sure Yet', desc: 'Exploring and learning about investment options', icon: Compass },
  // Legacy
  SHORT_TERM: { label: 'Short-Term Goals', desc: 'Funding immediate capital needs (1-3 years)', icon: Calendar },
  LONG_TERM: { label: 'Long-Term Goals', desc: 'Buying a house, children\'s education, or other major plans', icon: TrendingUp },
  EXPLORING: { label: 'Exploring Markets', desc: 'Learning options and testing investment strategies', icon: Compass },
};

const DetailField = ({ label, value }: { label: string; value: any }) => (
  <div className="border-b border-neutral-100 py-2.5 last:border-0">
    <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">{label}</span>
    <span className="text-xs font-semibold text-neutral-800 break-all">{value || 'N/A'}</span>
  </div>
);


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
    attendedLeads: 0,
    totalFolios: 0,
    totalExistingClients: 0,
    totalPortfolioValuations: 0,
  });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'existingClients' | 'consultations'>('users');

  // Folio state variables
  const [uploadingFolioFile, setUploadingFolioFile] = useState(false);

  // Existing Client state variables
  const [existingClientsList, setExistingClientsList] = useState<any[]>([]);
  const [existingClientsPagination, setExistingClientsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [existingClientsSearchQuery, setExistingClientsSearchQuery] = useState('');
  const [existingClientsPage, setExistingClientsPage] = useState(1);
  const [fetchingExistingClients, setFetchingExistingClients] = useState(false);
  const [selectedExistingClient, setSelectedExistingClient] = useState<any>(null);
  const [uploadingExistingClientFile, setUploadingExistingClientFile] = useState(false);

  // Portfolio Valuation state variables
  const [portfolioValuationsList, setPortfolioValuationsList] = useState<any[]>([]);
  const [portfolioValuationsPagination, setPortfolioValuationsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [portfolioValuationsSearchQuery, setPortfolioValuationsSearchQuery] = useState('');
  const [portfolioValuationsPage, setPortfolioValuationsPage] = useState(1);
  const [fetchingPortfolioValuations, setFetchingPortfolioValuations] = useState(false);
  const [selectedPortfolioValuation, setSelectedPortfolioValuation] = useState<any>(null);
  const [uploadingPortfolioValuationFile, setUploadingPortfolioValuationFile] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'GUEST' | 'CLIENT' | 'ADMIN'>('ALL');

  // Contact Messages State
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [fetchingContactMessages, setFetchingContactMessages] = useState(false);

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

  // Availability state variables
  const [availabilitySlots, setAvailabilitySlots] = useState<string[]>([]);
  const [newSlotDateTime, setNewSlotDateTime] = useState<string>('');
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [fetchingAvailability, setFetchingAvailability] = useState(false);

  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(null);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);

  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    danger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    danger: false
  });

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

  const handleFolioFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFolioFile(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${backendUrl}/api/admin/folios/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to upload folio records');
      }

      alert(resData.message || 'Folio holdings imported and matched successfully!');
      existingClientsPage === 1 ? fetchExistingClients(1, existingClientsSearchQuery) : setExistingClientsPage(1);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload file');
    } finally {
      setUploadingFolioFile(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleClearFolios = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Folio Database',
      message: 'Are you absolutely sure you want to delete all folio records? This action is irreversible and will permanently wipe the imported folio database.',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`${backendUrl}/api/admin/folios/clear`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const resData = await res.json();
          if (!res.ok) throw new Error(resData.error || 'Failed to clear folio records');

          alert(resData.message || 'All folio records deleted.');
          existingClientsPage === 1 ? fetchExistingClients(1, existingClientsSearchQuery) : setExistingClientsPage(1);
          await fetchAdminData();
        } catch (err: any) {
          alert(err.message || 'Failed to clear records');
        }
      }
    });
  };

  // 3b. Fetch Existing Clients when tab is existingClients or pagination/search changes
  const fetchExistingClients = async (page = 1, search = '') => {
    if (!token) return;
    try {
      setFetchingExistingClients(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: search,
      });

      const res = await fetch(`${backendUrl}/api/admin/existing-clients?${queryParams.toString()}`, { headers });
      if (!res.ok) throw new Error('Failed to retrieve existing client records');
      
      const resData = await res.json();
      setExistingClientsList(resData.data.clients);
      setExistingClientsPagination(resData.data.pagination);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An unexpected error occurred while fetching existing clients');
    } finally {
      setFetchingExistingClients(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'existingClients') {
      fetchExistingClients(existingClientsPage, existingClientsSearchQuery);
    }
  }, [activeTab, existingClientsPage]);

  useEffect(() => {
    if (activeTab !== 'existingClients') return;
    const delayDebounceFn = setTimeout(() => {
      setExistingClientsPage(1);
      fetchExistingClients(1, existingClientsSearchQuery);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [existingClientsSearchQuery]);

  const handleExistingClientsFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingExistingClientFile(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${backendUrl}/api/admin/existing-clients/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to upload existing client records');
      }

      alert(resData.message || 'Existing client database imported successfully!');
      existingClientsPage === 1 ? fetchExistingClients(1, existingClientsSearchQuery) : setExistingClientsPage(1);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload file');
    } finally {
      setUploadingExistingClientFile(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleClearExistingClients = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Client Database',
      message: 'Are you absolutely sure you want to delete all existing client records? This action is irreversible and will permanently wipe the imported client database.',
      danger: true,
      onConfirm: async () => {
        try {
          setFetchingExistingClients(true);
          const res = await fetch(`${backendUrl}/api/admin/existing-clients/clear`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const resData = await res.json();
          if (!res.ok) throw new Error(resData.error || 'Failed to clear existing client records');

          alert(resData.message || 'All existing client records deleted.');
          setExistingClientsPage(1);
          setExistingClientsList([]);
          setExistingClientsPagination({ page: 1, limit: 10, total: 0, pages: 0 });
          await fetchAdminData();
        } catch (err: any) {
          alert(err.message || 'Failed to clear records');
        } finally {
          setFetchingExistingClients(false);
        }
      }
    });
  };



  const handlePortfolioValuationsFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPortfolioValuationFile(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${backendUrl}/api/admin/portfolio-valuations/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to upload portfolio valuation records');
      }

      alert(resData.message || 'Portfolio valuation database processed successfully!');
      existingClientsPage === 1 ? fetchExistingClients(1, existingClientsSearchQuery) : setExistingClientsPage(1);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload file');
    } finally {
      setUploadingPortfolioValuationFile(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleClearPortfolioValuations = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Portfolio Valuations',
      message: 'Are you absolutely sure you want to delete all portfolio valuation records? This action is irreversible and will permanently wipe the imported valuation sheets.',
      danger: true,
      onConfirm: async () => {
        try {
          setFetchingPortfolioValuations(true);
          const res = await fetch(`${backendUrl}/api/admin/portfolio-valuations/clear`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const resData = await res.json();
          if (!res.ok) throw new Error(resData.error || 'Failed to clear portfolio valuation records');

          alert(resData.message || 'All portfolio valuation records deleted.');
          setPortfolioValuationsPage(1);
          setPortfolioValuationsList([]);
          setPortfolioValuationsPagination({ page: 1, limit: 10, total: 0, pages: 0 });
          await fetchAdminData();
        } catch (err: any) {
          alert(err.message || 'Failed to clear records');
        } finally {
          setFetchingPortfolioValuations(false);
        }
      }
    });
  };

  const fetchContactMessages = async () => {
    try {
      setFetchingContactMessages(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`${backendUrl}/api/admin/contact-messages`, { headers });
      if (!res.ok) throw new Error('Failed to retrieve contact messages');
      const resData = await res.json();
      setContactMessages(resData.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setFetchingContactMessages(false);
    }
  };

  const fetchAvailabilitySlots = async () => {
    try {
      setFetchingAvailability(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`${backendUrl}/api/admin/availability`, { headers });
      if (!res.ok) throw new Error('Failed to retrieve availability slots');
      const resData = await res.json();
      setAvailabilitySlots(resData.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setFetchingAvailability(false);
    }
  };

  const handleSaveAvailability = async (updatedSlots: string[]) => {
    try {
      setSavingAvailability(true);
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const res = await fetch(`${backendUrl}/api/admin/availability`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ slots: updatedSlots })
      });
      if (!res.ok) throw new Error('Failed to save availability');
      const resData = await res.json();
      setAvailabilitySlots(resData.data || []);
      alert('Availability slots saved successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save availability slots');
    } finally {
      setSavingAvailability(false);
    }
  };

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
      
      // Fetch contact messages
      await fetchContactMessages();
      await fetchAvailabilitySlots();
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
    const trimmedPan = pan.trim().toUpperCase();
    if (trimmedPan !== '') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(trimmedPan)) {
        alert('Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F) or empty to clear.');
        return;
      }
    }

    try {
      setSavingClientProfile(true);
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`${backendUrl}/api/admin/users/${userId}/client-profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ advisorNotes, activePlan, pan: trimmedPan }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update client profile');
      }

      const resData = await res.json();
      
      // Update local states
      const updatedPan = trimmedPan === '' ? null : trimmedPan;
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
      fetchAdminData(false);
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
      (user.phone || '').includes(searchQuery) ||
      (user.pan?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Compile list of pending payments across all users
  const pendingPaymentsList = usersList.flatMap(user => 
    (user.payments || [])
      .filter((p: any) => p.status === 'PENDING')
      .map((p: any) => ({ ...p, user }))
  );

  // Compile list of all leads across all users
  const allLeadsList = usersList.flatMap(user => 
    (user.leads || []).map((lead: any) => ({ ...lead, user }))
  ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 flex flex-col gap-8">
        
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight font-clash text-neutral-900">System Dashboard</h1>
            <p className="text-[11px] md:text-xs text-neutral-500 font-mono mt-1">Real-time telemetry and user record verification</p>
          </div>
          <button 
            onClick={() => fetchAdminData(false)}
            className="p-2 md:p-2.5 border border-neutral-200 bg-white hover:bg-neutral-50 transition duration-200 cursor-pointer text-neutral-500 hover:text-neutral-900 rounded-xl"
            title="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-left">

          {/* Card 4: Consultations */}
          <div 
            onClick={() => setActiveTab('consultations')}
            className={`border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition duration-300 cursor-pointer ${
              activeTab === 'consultations' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="flex items-start sm:items-center justify-between gap-2 mb-3">
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider font-clash leading-tight ${activeTab === 'consultations' ? 'text-neutral-300' : 'text-neutral-500'}`}>Consultations</span>
              <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${activeTab === 'consultations' ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <PhoneCall className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'consultations' ? 'text-white' : 'text-neutral-900'}`} />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight font-clash">{stats.attendedLeads}/{stats.totalLeads}</h3>
            <p className={`text-[10px] font-mono mt-1 ${activeTab === 'consultations' ? 'text-neutral-400' : 'text-neutral-500'}`}>Attended / Total Booked</p>
          </div>

          {/* Card 6: Existing Clients */}
          <div 
            onClick={() => setActiveTab('existingClients')}
            className={`border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition duration-300 cursor-pointer ${
              activeTab === 'existingClients' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="flex items-start sm:items-center justify-between gap-2 mb-3">
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider font-clash leading-tight ${activeTab === 'existingClients' ? 'text-neutral-300' : 'text-neutral-500'}`}>Existing Clients</span>
              <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${activeTab === 'existingClients' ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight font-clash">{stats.totalExistingClients || 0}</h3>
            <p className={`text-[10px] font-mono mt-1 ${activeTab === 'existingClients' ? 'text-neutral-400' : 'text-neutral-500'}`}>Imported client profiles</p>
          </div>

        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-neutral-200 gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 text-sm font-bold font-clash tracking-wide border-b-2 cursor-pointer transition duration-200 whitespace-nowrap ${
              activeTab === 'users' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Users Registry ({filteredUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 text-sm font-bold font-clash tracking-wide border-b-2 cursor-pointer transition duration-200 flex items-center gap-2 whitespace-nowrap ${
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
          <button
            onClick={() => setActiveTab('consultations')}
            className={`py-3 text-sm font-bold font-clash tracking-wide border-b-2 cursor-pointer transition duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'consultations' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Consultation Leads
          </button>

          <button
            onClick={() => setActiveTab('existingClients')}
            className={`py-3 text-sm font-bold font-clash tracking-wide border-b-2 cursor-pointer transition duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'existingClients' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Existing Clients
            {stats.totalExistingClients > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-neutral-900 text-white rounded-full font-bold">
                {stats.totalExistingClients}
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
                              {user.pan && (
                                <div className="text-neutral-500 font-mono text-[10px] mt-0.5 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded w-max">
                                  PAN: {user.pan}
                                </div>
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
                                View Details
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

          {activeTab === 'consultations' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold font-clash text-neutral-500 uppercase tracking-wider mb-2">
                Advisory & Consultation Leads ({allLeadsList.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allLeadsList.length === 0 ? (
                  <div className="col-span-2 border border-dashed border-neutral-200 rounded-2xl p-12 text-center text-sm text-neutral-500 bg-neutral-50 font-mono">
                    <PhoneCall className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    No booked advisory calls found.
                  </div>
                ) : (
                  allLeadsList.map((lead) => (
                    <div 
                      key={lead.id} 
                      className="border border-neutral-200 bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition duration-300 text-neutral-900"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-neutral-900 text-sm">
                            {lead.name}
                          </h3>
                          <p className="text-xs text-neutral-500 font-mono">Account: {lead.user?.name || 'Anonymous'} ({lead.user?.email || 'N/A'})</p>
                          <p className="text-xs text-neutral-600 font-semibold font-mono mt-1 flex items-center gap-1">
                            <PhoneCall className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Phone: {lead.phone}</span>
                          </p>
                          <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                            Booked: {new Date(lead.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                            lead.status === 'NEW' ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20' :
                            lead.status === 'CONTACTED' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                      </div>

                      <div className="border border-neutral-200 bg-neutral-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-neutral-500 block uppercase font-mono">Scheduled Time Slot</span>
                            <span className="text-xs font-semibold text-neutral-950">
                              {lead.slot ? new Date(lead.slot).toLocaleString(undefined, {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'No slot selected'}
                            </span>
                          </div>
                        </div>
                        
                        {lead.notes && (
                          <div className="border-t border-neutral-200/60 pt-2 flex items-start gap-2">
                            <FileText className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-neutral-500 block uppercase font-mono">Advisor Notes</span>
                              <p className="text-xs text-neutral-700 font-sans italic">"{lead.notes}"</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 mt-1">
                        <button
                          onClick={() => {
                            selectUserForDetails(lead.user);
                            setSelectedLeadId(lead.id);
                            setLeadStatus(lead.status);
                            setLeadNotes(lead.notes || '');
                          }}
                          className="flex-1 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          Manage Lead & Audit User
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}



          {activeTab === 'existingClients' && (
            <div className="space-y-6">
              {/* Top Action Bar with Upload Zones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Upload Zone 1: Client Info */}
                <div className="border border-dashed border-neutral-300 bg-white hover:border-neutral-900 transition-colors duration-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative min-h-[140px]">
                  {uploadingExistingClientFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
                      <span className="text-sm font-bold font-clash text-neutral-900">Uploading & Parsing Existing Clients File...</span>
                      <span className="text-xs text-neutral-500 font-mono">Extracting all columns to database</span>
                    </div>
                  ) : (
                    <label htmlFor="existing-client-csv-upload" className="cursor-pointer flex flex-col items-center gap-3 w-full h-full select-none">
                      <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-900">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-sm font-bold font-clash text-neutral-900 block">Click to Upload Existing Clients CSV / Excel</span>
                        <span className="text-[11px] text-neutral-500 font-mono mt-1 block">Supports target existing client database schemas</span>
                      </div>
                      <input 
                        type="file" 
                        id="existing-client-csv-upload" 
                        accept=".csv,.xlsx" 
                        className="hidden" 
                        onChange={handleExistingClientsFileUpload} 
                      />
                    </label>
                  )}
                </div>

                {/* Upload Zone 2: Portfolio Valuations */}
                <div className="border border-dashed border-neutral-300 bg-white hover:border-neutral-900 transition-colors duration-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative min-h-[140px]">
                  {uploadingPortfolioValuationFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
                      <span className="text-sm font-bold font-clash text-neutral-900">Uploading & Parsing Portfolio Valuations File...</span>
                      <span className="text-xs text-neutral-500 font-mono">Matching and updating database records</span>
                    </div>
                  ) : (
                    <label htmlFor="portfolio-valuation-csv-upload" className="cursor-pointer flex flex-col items-center gap-3 w-full h-full select-none">
                      <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-900">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-sm font-bold font-clash text-neutral-900 block">Click to Upload Portfolio Valuations CSV / Excel</span>
                        <span className="text-[11px] text-neutral-500 font-mono mt-1 block">Matches by PAN & Name to update valuation columns</span>
                      </div>
                      <input 
                        type="file" 
                        id="portfolio-valuation-csv-upload" 
                        accept=".csv,.xlsx" 
                        className="hidden" 
                        onChange={handlePortfolioValuationsFileUpload} 
                      />
                    </label>
                  )}
                </div>

                {/* Upload Zone 3: Folio Holdings */}
                <div className="border border-dashed border-neutral-300 bg-white hover:border-neutral-900 transition-colors duration-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative min-h-[140px]">
                  {uploadingFolioFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
                      <span className="text-sm font-bold font-clash text-neutral-900">Uploading & Parsing Folios File...</span>
                      <span className="text-xs text-neutral-500 font-mono">Matching and updating database records</span>
                    </div>
                  ) : (
                    <label htmlFor="existing-client-folio-upload" className="cursor-pointer flex flex-col items-center gap-3 w-full h-full select-none">
                      <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-900">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-sm font-bold font-clash text-neutral-900 block">Click to Upload Folio Holdings CSV / Excel</span>
                        <span className="text-[11px] text-neutral-500 font-mono mt-1 block">Matches by PAN & Name to update mutual fund folios</span>
                      </div>
                      <input 
                        type="file" 
                        id="existing-client-folio-upload" 
                        accept=".csv,.xlsx" 
                        className="hidden" 
                        onChange={handleFolioFileUpload} 
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Search & Listing */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="flex-1 relative w-full">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search existing clients by name, PAN, email, mobile, city or app/iwell code..."
                      value={existingClientsSearchQuery}
                      onChange={(e) => setExistingClientsSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition duration-200 text-neutral-900 placeholder-neutral-400"
                    />
                  </div>
                </div>

                {/* Existing Clients Table */}
                <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs font-sans text-neutral-900">
                      <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-widest text-[10px] font-bold text-neutral-500 select-none">
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Folio</th>
                          <th className="px-6 py-4 text-right">AUM</th>
                          <th className="px-6 py-4 text-right">Absolute Return</th>
                          <th className="px-6 py-4 text-right">Avg Holding</th>
                          <th className="px-6 py-4 text-right">CAGR (%)</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {fetchingExistingClients ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500 font-mono">
                              <Loader2 className="w-6 h-6 text-neutral-900 animate-spin mx-auto mb-2" />
                              Loading existing client records...
                            </td>
                          </tr>
                        ) : existingClientsList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500 font-mono">
                              No client records found in database
                            </td>
                          </tr>
                        ) : (
                          existingClientsList.map((client) => (
                            <tr key={client.id} className="hover:bg-neutral-50 transition duration-150 group">
                              <td className="px-6 py-4 font-sans">
                                <div className="font-semibold text-neutral-900 text-sm group-hover:text-neutral-700 transition-colors duration-150">
                                  {client.title ? `${client.title} ` : ''}{client.name || 'N/A'}
                                </div>
                                <div className="flex flex-wrap gap-2 items-center mt-0.5">
                                  {client.pan && <span className="text-[10px] text-neutral-500 font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">PAN: {client.pan}</span>}
                                  {client.username && <span className="text-neutral-400 font-mono text-[9px]">@{client.username}</span>}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-mono text-neutral-700">
                                {client.folios && client.folios.length > 0 ? (
                                  client.folios.length > 1 ? (
                                    <div className="relative inline-block w-full max-w-[160px]">
                                      <select
                                        className="w-full text-xs font-mono bg-neutral-50 border border-neutral-200 text-neutral-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer truncate"
                                        defaultValue={client.folios[0].folioNumber || ''}
                                        title={`${client.folios.length} Folios (Click to view)`}
                                      >
                                        {client.folios.map((folio: any) => (
                                          <option key={folio.id} value={folio.folioNumber} title={`${folio.folioNumber} - ${folio.schemeName || 'Unknown Scheme'}`}>
                                            {folio.folioNumber} {folio.schemeName ? `(${folio.schemeName})` : ''}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  ) : (
                                    client.folios[0].folioNumber || 'N/A'
                                  )
                                ) : 'N/A'}
                              </td>
                              <td className="px-6 py-4 font-mono text-neutral-900 font-bold text-right">
                                {client.currentValue !== null && client.currentValue !== undefined 
                                  ? `₹${client.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
                                  : (client.aum !== null && client.aum !== undefined ? `₹${client.aum.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A')}
                              </td>
                              <td className="px-6 py-4 font-mono text-neutral-700 text-right">
                                {client.absoluteReturn !== null && client.absoluteReturn !== undefined ? `${client.absoluteReturn.toFixed(2)}%` : 'N/A'}
                              </td>
                              <td className="px-6 py-4 font-mono text-neutral-700 text-right">
                                {client.averageHoldingDays !== null && client.averageHoldingDays !== undefined ? `${Math.round(client.averageHoldingDays)} days` : 'N/A'}
                              </td>
                              <td className="px-6 py-4 font-mono text-neutral-900 font-bold text-right">
                                {client.cagr !== null && client.cagr !== undefined ? `${client.cagr.toFixed(2)}%` : 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedExistingClient(client)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-900 hover:text-white rounded-lg transition duration-200 text-xs font-semibold cursor-pointer text-neutral-900"
                                >
                                  Audit Details
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controller */}
                  {existingClientsPagination.pages > 1 && (
                    <div className="border-t border-neutral-200 px-6 py-4 flex items-center justify-between bg-neutral-50">
                      <span className="text-[11px] font-mono text-neutral-500">
                        Showing page {existingClientsPagination.page} of {existingClientsPagination.pages} ({existingClientsPagination.total} total records)
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={existingClientsPagination.page <= 1 || fetchingExistingClients}
                          onClick={() => setExistingClientsPage(prev => prev - 1)}
                          className="px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer select-none"
                        >
                          Previous
                        </button>
                        <button
                          disabled={existingClientsPagination.page >= existingClientsPagination.pages || fetchingExistingClients}
                          onClick={() => setExistingClientsPage(prev => prev + 1)}
                          className="px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer select-none"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Contact Messages Section */}
        <div className="mt-8 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight font-clash text-neutral-900">Contact Form Submissions</h2>
            <p className="text-[11px] md:text-xs text-neutral-500 font-mono mt-1">Queries submitted by public users on the homepage</p>
          </div>

          <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs font-sans text-neutral-900">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-widest text-[10px] font-bold text-neutral-500 select-none">
                    <th className="px-6 py-4 w-[200px]">Submitted At</th>
                    <th className="px-6 py-4 w-[200px]">Name</th>
                    <th className="px-6 py-4 w-[250px]">Email</th>
                    <th className="px-6 py-4">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {fetchingContactMessages ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-neutral-400 font-mono">
                        Loading contact messages...
                      </td>
                    </tr>
                  ) : contactMessages.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-neutral-400 font-mono">
                        No contact messages found.
                      </td>
                    </tr>
                  ) : (
                    contactMessages.map((msg: any) => (
                      <tr key={msg.id} className="hover:bg-neutral-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-neutral-500 font-mono">
                          {new Date(msg.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </td>
                        <td className="px-6 py-4 font-semibold text-neutral-800 font-clash whitespace-nowrap">
                          {msg.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-neutral-600 whitespace-nowrap">
                          <a href={`mailto:${msg.email}`} className="text-neutral-600 hover:text-neutral-900 hover:underline">
                            {msg.email}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-neutral-700 break-words max-w-md">
                          {msg.message}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
                    <span className="text-neutral-500 block text-[10px] uppercase">Date of Birth</span>
                    <span className="text-neutral-900">
                      {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Anniversary Date</span>
                    <span className="text-neutral-900">
                      {selectedUser.anniversary ? new Date(selectedUser.anniversary).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Not provided'}
                    </span>
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
                      <option value="PREMIUM">Premium Pro Plan</option>
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
                            <span className="text-neutral-900 font-bold">{a.ageRange || `${a.age} Years Old`}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 text-[10px] block uppercase">Assessed Date</span>
                            <span className="text-neutral-900">{new Date(a.createdAt).toLocaleString()}</span>
                          </div>
                          {a.lifeStage && (
                            <div>
                              <span className="text-neutral-500 text-[10px] block uppercase">Life Stage</span>
                              <span className="text-neutral-900 font-bold">{a.lifeStage.replace(/_/g, ' ')}</span>
                            </div>
                          )}
                          {a.investmentTenure && (
                            <div>
                              <span className="text-neutral-500 text-[10px] block uppercase">Investment Horizon</span>
                              <span className="text-neutral-900 font-bold">{a.investmentTenure.replace(/_/g, ' ')}</span>
                            </div>
                          )}
                          {a.isCompletePortfolio !== null && a.isCompletePortfolio !== undefined && (
                            <div>
                              <span className="text-neutral-500 text-[10px] block uppercase">Complete Portfolio</span>
                              <span className="text-neutral-900 font-bold">{a.isCompletePortfolio ? 'Yes' : 'Partial'}</span>
                            </div>
                          )}
                          {a.investmentStyle && (
                            <div>
                              <span className="text-neutral-500 text-[10px] block uppercase">Investment Style</span>
                              <span className="text-neutral-900 font-bold">{a.investmentStyle.replace(/_/g, ' ')}</span>
                            </div>
                          )}
                          {a.expectedReturn && (
                            <div>
                              <span className="text-neutral-500 text-[10px] block uppercase">Expected Return</span>
                              <span className="text-neutral-900 font-bold">{a.expectedReturn.replace(/_/g, ' ')}</span>
                            </div>
                          )}
                          {a.riskBehavior && (
                            <div className="col-span-2">
                              <span className="text-neutral-500 text-[10px] block uppercase">Risk Behavior</span>
                              <span className="text-neutral-900 font-bold">{a.riskBehavior.replace(/_/g, ' ')}</span>
                            </div>
                          )}
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



      {/* Existing Client Details Slide Drawer */}
      {selectedExistingClient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay dim background */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-pointer"
            onClick={() => setSelectedExistingClient(null)}
          />

          {/* Drawer container */}
          <div className="relative z-10 w-full max-w-4xl bg-white border-l border-neutral-200 h-full shadow-2xl overflow-y-auto flex flex-col p-6 md:p-8 animate-in slide-in-from-right duration-350 ease-out text-neutral-900">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
              <div>
                <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Existing Client Audit Ledger</span>
                <h2 className="text-xl font-semibold font-clash text-neutral-900 mt-0.5">
                  {selectedExistingClient.title ? `${selectedExistingClient.title} ` : ''}{selectedExistingClient.name || 'Client Details'}
                </h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">PAN: {selectedExistingClient.pan || 'N/A'}</p>
              </div>
              <button 
                onClick={() => setSelectedExistingClient(null)}
                className="p-2 border border-neutral-200 hover:bg-neutral-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Scrollable details view */}
            <div className="space-y-8 flex-1 pb-10">
              
              {/* Section 1: Personal & Profile Details */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Personal & Profile Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <DetailField label="Title" value={selectedExistingClient.title} />
                  <DetailField label="Name" value={selectedExistingClient.name} />
                  <DetailField label="PAN" value={selectedExistingClient.pan} />
                  <DetailField label="Aadhaar" value={selectedExistingClient.aadhaar} />
                  <DetailField label="Date of Birth" value={selectedExistingClient.dob} />
                  <DetailField label="Birthday Wish" value={selectedExistingClient.birthdayWish} />
                  <DetailField label="Anniversary" value={selectedExistingClient.anniversary} />
                  <DetailField label="Date of Death" value={selectedExistingClient.dateOfDeath} />
                  <DetailField label="Profession" value={selectedExistingClient.profession} />
                  <DetailField label="Annual Income" value={selectedExistingClient.annualIncome} />
                  <DetailField label="Client Rating" value={selectedExistingClient.clientRating} />
                  <DetailField label="Username" value={selectedExistingClient.username} />
                </div>
              </div>

              {/* Section 2: Contact & Address Details */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Contact & Address Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailField label="Email Address" value={selectedExistingClient.email} />
                  <DetailField label="Disable Email" value={selectedExistingClient.disableEmail} />
                  <DetailField label="Secondary Email" value={selectedExistingClient.secondaryEmail} />
                  <DetailField label="Mobile Number" value={selectedExistingClient.mobile} />
                  <DetailField label="Landline" value={selectedExistingClient.landline} />
                  <DetailField label="Address 1" value={selectedExistingClient.address1} />
                  <DetailField label="Address 2" value={selectedExistingClient.address2} />
                  <DetailField label="Address 3" value={selectedExistingClient.address3} />
                  <DetailField label="City" value={selectedExistingClient.city} />
                  <DetailField label="State" value={selectedExistingClient.state} />
                  <DetailField label="Country" value={selectedExistingClient.country} />
                  <DetailField label="PIN Code" value={selectedExistingClient.pinCode} />
                </div>
              </div>

              {/* Section 3: Overseas Contact Details */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Overseas Contact Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailField label="Overseas Address 1" value={selectedExistingClient.overseasAddress1} />
                  <DetailField label="Overseas Address 2" value={selectedExistingClient.overseasAddress2} />
                  <DetailField label="Overseas Address 3" value={selectedExistingClient.overseasAddress3} />
                  <DetailField label="Overseas City" value={selectedExistingClient.overseasCity} />
                  <DetailField label="Overseas State" value={selectedExistingClient.overseasState} />
                  <DetailField label="Overseas Country" value={selectedExistingClient.overseasCountry} />
                  <DetailField label="Overseas PIN" value={selectedExistingClient.overseasPin} />
                  <DetailField label="Overseas Phone" value={selectedExistingClient.overseasPhone} />
                  <DetailField label="Overseas Mobile" value={selectedExistingClient.overseasMobile} />
                </div>
              </div>

              {/* Section 4: Advisory & Target Allocation */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Advisory & Target Allocation
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailField label="Current AUM" value={selectedExistingClient.aum !== null && selectedExistingClient.aum !== undefined ? `₹${selectedExistingClient.aum.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A'} />
                  <DetailField label="Target SIP Amount" value={selectedExistingClient.targetSipAmount !== null && selectedExistingClient.targetSipAmount !== undefined ? `₹${selectedExistingClient.targetSipAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A'} />
                  <DetailField label="Target ELSS Amount" value={selectedExistingClient.targetElssAmount !== null && selectedExistingClient.targetElssAmount !== undefined ? `₹${selectedExistingClient.targetElssAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A'} />
                  <DetailField label="Target Equity Allocation" value={selectedExistingClient.targetEquityAllocation !== null && selectedExistingClient.targetEquityAllocation !== undefined ? `${selectedExistingClient.targetEquityAllocation}%` : 'N/A'} />
                  <DetailField label="Target Debt Allocation" value={selectedExistingClient.targetDebtAllocation !== null && selectedExistingClient.targetDebtAllocation !== undefined ? `${selectedExistingClient.targetDebtAllocation}%` : 'N/A'} />
                  <DetailField label="Preferred Billing Mode" value={selectedExistingClient.preferredBillingMode} />
                  <DetailField label="First Investment Date" value={selectedExistingClient.firstInvestmentDate} />
                  <DetailField label="Review Frequency" value={selectedExistingClient.reviewFrequency} />
                  <DetailField label="Last Review Date" value={selectedExistingClient.lastReviewDate} />
                  <DetailField label="Model Name" value={selectedExistingClient.modelName} />
                  <DetailField label="File Number" value={selectedExistingClient.fileNumber} />
                </div>
              </div>

              {/* Section 4.5: Portfolio Valuation Details */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Portfolio Valuation Details (Fresh from CSV)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailField label="Balance Units" value={selectedExistingClient.balanceUnits !== null && selectedExistingClient.balanceUnits !== undefined ? selectedExistingClient.balanceUnits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : 'N/A'} />
                  <DetailField label="Purchase Value" value={selectedExistingClient.purchaseValue !== null && selectedExistingClient.purchaseValue !== undefined ? `₹${selectedExistingClient.purchaseValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A'} />
                  <DetailField label="Current Value (AUM)" value={selectedExistingClient.currentValue !== null && selectedExistingClient.currentValue !== undefined ? `₹${selectedExistingClient.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A'} />
                  <DetailField label="One-Day Change" value={selectedExistingClient.oneDayChange !== null && selectedExistingClient.oneDayChange !== undefined ? `₹${selectedExistingClient.oneDayChange.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A'} />
                  <DetailField label="Dividend" value={selectedExistingClient.dividend !== null && selectedExistingClient.dividend !== undefined ? `₹${selectedExistingClient.dividend.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A'} />
                  <DetailField label="Average Holding Days" value={selectedExistingClient.averageHoldingDays !== null && selectedExistingClient.averageHoldingDays !== undefined ? `${selectedExistingClient.averageHoldingDays} days` : 'N/A'} />
                  <DetailField label="Gain" value={selectedExistingClient.gain !== null && selectedExistingClient.gain !== undefined ? `₹${selectedExistingClient.gain.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A'} />
                  <DetailField label="Absolute Return" value={selectedExistingClient.absoluteReturn !== null && selectedExistingClient.absoluteReturn !== undefined ? `${selectedExistingClient.absoluteReturn.toFixed(2)}%` : 'N/A'} />
                  <DetailField label="CAGR (%)" value={selectedExistingClient.cagr !== null && selectedExistingClient.cagr !== undefined ? `${selectedExistingClient.cagr.toFixed(2)}%` : 'N/A'} />
                </div>
              </div>

              {/* Section 4.6: Folio Holdings / Scheme Details */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900">
                    Folio Holdings / Scheme Details ({selectedExistingClient.folios?.length || 0})
                  </h3>
                </div>

                {!selectedExistingClient.folios || selectedExistingClient.folios.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-mono py-2">No associated mutual fund folios found for this client.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedExistingClient.folios.map((folio: any, index: number) => (
                      <div key={folio.id || index} className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-neutral-100 pb-2">
                          <div>
                            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">Scheme Name</span>
                            <span className="text-xs font-bold text-neutral-800">{folio.schemeName || 'N/A'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block md:text-right">Folio Number</span>
                            <span className="text-xs font-mono font-semibold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 inline-block">{folio.folioNumber || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                          <div>
                            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">Balance Units</span>
                            <span className="text-xs font-mono font-semibold text-neutral-800">
                              {folio.units !== null && folio.units !== undefined ? folio.units.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">AUM Value</span>
                            <span className="text-xs font-mono font-bold text-neutral-900">
                              {folio.aum !== null && folio.aum !== undefined ? `₹${folio.aum.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">Tax Status</span>
                            <span className="text-xs font-semibold text-neutral-800">{folio.taxStatus || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">Freeze Date</span>
                            <span className="text-xs font-semibold text-neutral-800">{folio.freezeDate || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Collapsible/Details for bank details & nominees within folio */}
                        <div className="mt-2 pt-2 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {folio.bankName && (
                            <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                              <span className="text-[9px] text-neutral-400 font-mono uppercase tracking-wider block mb-1">Folio Bank Details</span>
                              <div className="font-semibold text-neutral-700">{folio.bankName}</div>
                              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">A/C: {folio.accountNumber || 'N/A'} | IFSC: {folio.ifscCode || 'N/A'} ({folio.accountType || 'N/A'})</div>
                            </div>
                          )}
                          {folio.nomineeOpted && (
                            <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                              <span className="text-[9px] text-neutral-400 font-mono uppercase tracking-wider block mb-1">Nominees (From Folio)</span>
                              <div className="font-semibold text-neutral-700">Status: {folio.nomineeOpted}</div>
                              {folio.nominee1Name && (
                                <div className="text-[10px] text-neutral-500 mt-0.5 font-sans">
                                  1. {folio.nominee1Name} ({folio.nominee1Relation || 'N/A'} - {folio.nominee1Percentage || '0'}%)
                                </div>
                              )}
                              {folio.nominee2Name && (
                                <div className="text-[10px] text-neutral-500 mt-0.5 font-sans">
                                  2. {folio.nominee2Name} ({folio.nominee2Relation || 'N/A'} - {folio.nominee2Percentage || '0'}%)
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 5: System Codes & References */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  System Codes & References
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailField label="App Code" value={selectedExistingClient.appCode} />
                  <DetailField label="IWELL Code" value={selectedExistingClient.iwellCode} />
                  <DetailField label="IWELL Code 2" value={selectedExistingClient.iwellCode2} />
                  <DetailField label="Family Head" value={selectedExistingClient.familyHead} />
                  <DetailField label="Family Head IWELL Code" value={selectedExistingClient.familyHeadIwellCode} />
                  <DetailField label="Family Head IWELL Code 2" value={selectedExistingClient.familyHeadIwellCode2} />
                  <DetailField label="Referred By" value={selectedExistingClient.referredBy} />
                  <DetailField label="Tags" value={selectedExistingClient.tags} />
                  <div className="col-span-3">
                    <DetailField label="Update Log" value={selectedExistingClient.updateLog} />
                  </div>
                </div>
              </div>

              {/* Section 6: Equity & Demat Info */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Equity & Demat Info
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailField label="Equity Code 1" value={selectedExistingClient.equityCode1} />
                  <DetailField label="Equity Code 2" value={selectedExistingClient.equityCode2} />
                  <DetailField label="Depository" value={selectedExistingClient.depository} />
                  <DetailField label="DP Name" value={selectedExistingClient.dpName} />
                  <DetailField label="DP ID" value={selectedExistingClient.dpId} />
                  <DetailField label="NPS Account Number" value={selectedExistingClient.npsAccountNumber} />
                  <DetailField label="KYC Status" value={selectedExistingClient.kycStatus} />
                </div>
              </div>

              {/* Section 7: Billing Percentages */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Billing Rates (%)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailField label="Equity MF Billing (%)" value={selectedExistingClient.equityMfBilling !== null && selectedExistingClient.equityMfBilling !== undefined ? `${selectedExistingClient.equityMfBilling}%` : 'N/A'} />
                  <DetailField label="Debt MF Billing (%)" value={selectedExistingClient.debtMfBilling !== null && selectedExistingClient.debtMfBilling !== undefined ? `${selectedExistingClient.debtMfBilling}%` : 'N/A'} />
                  <DetailField label="Shares Billing (%)" value={selectedExistingClient.sharesBilling !== null && selectedExistingClient.sharesBilling !== undefined ? `${selectedExistingClient.sharesBilling}%` : 'N/A'} />
                  <DetailField label="Bonds Billing (%)" value={selectedExistingClient.bondsBilling !== null && selectedExistingClient.bondsBilling !== undefined ? `${selectedExistingClient.bondsBilling}%` : 'N/A'} />
                  <DetailField label="Fixed Deposit Billing (%)" value={selectedExistingClient.fixedDepositBilling !== null && selectedExistingClient.fixedDepositBilling !== undefined ? `${selectedExistingClient.fixedDepositBilling}%` : 'N/A'} />
                  <DetailField label="Other Asset Billing (%)" value={selectedExistingClient.otherAssetBilling !== null && selectedExistingClient.otherAssetBilling !== undefined ? `${selectedExistingClient.otherAssetBilling}%` : 'N/A'} />
                </div>
              </div>

              {/* Section 8: Bank Details, Remarks & Nominees */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Bank Details, Remarks & Nominees
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-3">
                    <DetailField label="Bank Details" value={selectedExistingClient.bankDetails} />
                    <DetailField label="Remarks" value={selectedExistingClient.remarks} />
                  </div>

                  <DetailField label="Nominee 1 Name" value={selectedExistingClient.nominee1Name} />
                  <DetailField label="Nominee 1 Relation" value={selectedExistingClient.nominee1Relation} />
                  <DetailField label="Nominee 1 DOB" value={selectedExistingClient.nominee1Dob} />
                  <DetailField label="Nominee 1 %" value={selectedExistingClient.nominee1Percentage} />

                  <DetailField label="Nominee 2 Name" value={selectedExistingClient.nominee2Name} />
                  <DetailField label="Nominee 2 Relation" value={selectedExistingClient.nominee2Relation} />
                  <DetailField label="Nominee 2 DOB" value={selectedExistingClient.nominee2Dob} />
                  <DetailField label="Nominee 2 %" value={selectedExistingClient.nominee2Percentage} />

                  <DetailField label="Nominee 3 Name" value={selectedExistingClient.nominee3Name} />
                  <DetailField label="Nominee 3 Relation" value={selectedExistingClient.nominee3Relation} />
                  <DetailField label="Nominee 3 DOB" value={selectedExistingClient.nominee3Dob} />
                  <DetailField label="Nominee 3 %" value={selectedExistingClient.nominee3Percentage} />
                </div>
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

      {/* Custom Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          />
          <div className="relative z-[70] bg-white border border-neutral-200 rounded-[2rem] p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${confirmModal.danger ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <h3 className="text-lg font-bold text-neutral-900 mb-2 font-clash">{confirmModal.title}</h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-sans mb-6">{confirmModal.message}</p>
            
            <div className="flex gap-4 w-full">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3 text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 rounded-xl transition duration-200 text-neutral-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className={`flex-1 py-3 text-xs font-bold text-white rounded-xl transition duration-200 cursor-pointer ${confirmModal.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-neutral-900 hover:bg-neutral-800'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
