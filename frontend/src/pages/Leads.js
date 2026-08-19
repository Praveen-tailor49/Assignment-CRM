import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads, createLead, updateLead, deleteLead } from '../store/slices/leadSlice';
import { fetchUsers } from '../store/slices/userSlice';
import { Plus, Search, Edit2, Trash2, Filter, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';

const Leads = () => {
  const dispatch = useDispatch();
  const { leads, pagination, loading } = useSelector(state => state.leads);
  const { users } = useSelector(state => state.users);
  const { user } = useSelector(state => state.auth);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', source: '', status: 'New', assigned_user_id: ''
  });

  useEffect(() => {
    dispatch(fetchLeads({ page, limit: 10, search, status, assignedUserId, sortBy, sortOrder }));
  }, [dispatch, page, search, status, assignedUserId, sortBy, sortOrder]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const hasPermission = (requiredPermission) => {
    if (!user) return false;
    return user.Roles?.some(role => role.Permissions?.some(p => p.name === requiredPermission));
  };

  const isSalesUser = user?.Roles?.some(r => r.name === 'Sales User');
  
  const canEditLead = (lead) => {
    if (!hasPermission('lead.edit')) return false;
    if (isSalesUser && lead.assigned_user_id !== user.id && lead.created_by !== user.id) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (currentLead) {
        await dispatch(updateLead({ id: currentLead.id, data: formData })).unwrap();
        toast.success('Lead updated successfully');
      } else {
        await dispatch(createLead(formData)).unwrap();
        toast.success('Lead created successfully');
      }
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', company: '', status: 'New', assigned_user_id: '' });
      setCurrentLead(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await dispatch(deleteLead(id)).unwrap();
        toast.success('Lead deleted successfully');
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const openModal = (lead = null) => {
    if (lead) {
      setCurrentLead(lead);
      setFormData({
        name: lead.name, email: lead.email || '', phone: lead.phone || '',
        company: lead.company || '', source: lead.source || '', status: lead.status, assigned_user_id: lead.assigned_user_id || ''
      });
    } else {
      setCurrentLead(null);
      setFormData({ name: '', email: '', phone: '', company: '', source: '', status: 'New', assigned_user_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Leads Management" 
        description="Manage and track your sales pipeline."
        action={
          hasPermission('lead.create') && (
            <Button onClick={() => openModal()} icon={Plus}>
              Add Lead
            </Button>
          )
        }
      />

      {/* Filters */}
      <Card className="p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search leads by name, email, or company..."
            className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Filter size={16} className="absolute left-3 top-3 text-gray-400" />
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
              className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white w-full"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <select 
            value={assignedUserId} 
            onChange={(e) => { setAssignedUserId(e.target.value); setPage(1); }} 
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-full sm:w-auto"
          >
            <option value="">All Assignees</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                Lead Name {sortBy === 'name' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status')}>
                Status {sortBy === 'status' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4">Assigned To</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-40 mb-1" /><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-8 w-16 float-right" /></td>
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Briefcase size={48} className="mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-900 mb-1">No leads found</p>
                    <p className="text-sm mb-4">We couldn't find any leads matching your criteria.</p>
                    {hasPermission('lead.create') && (
                      <Button onClick={() => openModal()} icon={Plus} variant="secondary">Add New Lead</Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">{lead.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{lead.company || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{lead.source || '-'}</td>
                  <td className="px-6 py-4">
                    <Badge status={lead.status}>{lead.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{lead.assignedUser?.name || 'Unassigned'}</td>
                  <td className="px-6 py-4 flex gap-2 justify-end">
                    {canEditLead(lead) && (
                      <Button variant="ghost" size="icon" onClick={() => openModal(lead)} className="text-indigo-600 hover:text-indigo-900">
                        <Edit2 size={18} />
                      </Button>
                    )}
                    {hasPermission('lead.delete') && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <span className="text-sm text-gray-600">
            Showing <span className="font-medium">{leads.length > 0 ? (page - 1) * 10 + 1 : 0}</span> to <span className="font-medium">{Math.min(page * 10, pagination.total || 0)}</span> of <span className="font-medium">{pagination.total || 0}</span> leads
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft size={16} className="mr-1" /> Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages || pagination.totalPages === 0 || loading}
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)} 
        title={currentLead ? 'Edit Lead' : 'Add New Lead'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="Acme Inc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input type="text" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="Website, Referral, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white">
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <select value={formData.assigned_user_id} onChange={e => setFormData({...formData, assigned_user_id: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white">
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{currentLead ? 'Save Changes' : 'Create Lead'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leads;
