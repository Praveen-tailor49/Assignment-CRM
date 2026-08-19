import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, updateUser, deleteUser, updateUserRoles } from '../store/slices/userSlice';
import { fetchRoles } from '../store/slices/roleSlice';
import { Plus, Edit2, Trash2, Shield, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import Avatar from '../components/ui/Avatar';

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector(state => state.users);
  const { roles } = useSelector(state => state.roles);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (currentUser) {
        await dispatch(updateUser({ id: currentUser.id, data: formData })).unwrap();
        toast.success('User updated successfully');
      } else {
        await dispatch(createUser(formData)).unwrap();
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '' });
      setCurrentUser(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dispatch(updateUserRoles({ id: currentUser.id, roleIds: selectedRoles })).unwrap();
      toast.success('Roles updated successfully');
      setIsRoleModalOpen(false);
    } catch (error) {
      toast.error('Failed to update roles');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(id)).unwrap();
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({ name: user.name, email: user.email, password: '', phone: user.phone || '' });
    } else {
      setCurrentUser(null);
      setFormData({ name: '', email: '', password: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const openRoleModal = (user) => {
    setCurrentUser(user);
    setSelectedRoles(user.Roles?.map(r => r.id) || []);
    setIsRoleModalOpen(true);
  };

  const toggleRole = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Users Management" 
        description="Manage CRM users, their details, and system access."
        action={
          <Button onClick={() => openModal()} icon={Plus}>
            Add User
          </Button>
        }
      />

      <Card className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Contact Info</th>
              <th className="px-6 py-4">Roles</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-3 w-24" /></div>
                  </td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-8 w-24 float-right" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <UsersIcon size={48} className="mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-900">No users found</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} />
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-xs text-gray-500">{user.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {user.Roles?.map(role => (
                        <span key={role.id} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium">
                          {role.name}
                        </span>
                      ))}
                      {(!user.Roles || user.Roles.length === 0) && (
                        <span className="text-xs text-gray-400 italic">No roles assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 flex gap-2 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openRoleModal(user)} className="text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50" title="Manage Roles">
                      <Shield size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openModal(user)} className="text-indigo-600 hover:text-indigo-900" title="Edit User">
                      <Edit2 size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900" title="Delete User">
                      <Trash2 size={18} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* User Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)} 
        title={currentUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="jane@example.com" />
          </div>
          {!currentUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="••••••••" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="+1 (555) 000-0000" />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{currentUser ? 'Save Changes' : 'Create User'}</Button>
          </div>
        </form>
      </Modal>

      {/* Role Modal */}
      <Modal 
        isOpen={isRoleModalOpen} 
        onClose={() => !isSubmitting && setIsRoleModalOpen(false)} 
        title={`Assign Roles to ${currentUser?.name}`}
      >
        <form onSubmit={handleRoleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">Select the roles you want to assign to this user. Roles define which parts of the CRM the user can access.</p>
          <div className="space-y-3 max-h-64 overflow-y-auto p-1">
            {roles.map(role => (
              <label key={role.id} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedRoles.includes(role.id) ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <span className={`block text-sm font-medium ${selectedRoles.includes(role.id) ? 'text-indigo-900' : 'text-gray-900'}`}>{role.name}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsRoleModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Save Roles</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
