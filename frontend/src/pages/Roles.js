import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoles, createRole, updateRolePermissions, fetchPermissions } from '../store/slices/roleSlice';
import { Plus, Shield, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';

const Roles = () => {
  const dispatch = useDispatch();
  const { roles, permissions, loading } = useSelector(state => state.roles);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ name: '' });
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermissions());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!currentRole) {
        await dispatch(createRole(formData)).unwrap();
        toast.success('Role created successfully');
      }
      setIsModalOpen(false);
      setFormData({ name: '' });
    } catch (error) {
      toast.error('Failed to create role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dispatch(updateRolePermissions({ id: currentRole.id, permissionIds: selectedPermissions })).unwrap();
      toast.success('Permissions updated successfully');
      setIsPermissionModalOpen(false);
    } catch (error) {
      toast.error('Failed to update permissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    setCurrentRole(null);
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  const openPermissionModal = (role) => {
    setCurrentRole(role);
    setSelectedPermissions(role.Permissions?.map(p => p.id) || []);
    setIsPermissionModalOpen(true);
  };

  const togglePermission = (permId) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  // Group permissions by category (e.g. "lead.view" -> "lead")
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = perm.name.split('.')[0] || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Roles & Permissions" 
        description="Configure roles and manage granular system access."
        action={
          <Button onClick={openModal} icon={Plus}>
            Create Role
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-20 mb-2" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </Card>
          ))
        ) : (
          roles.map(role => (
            <Card key={role.id} className="flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-indigo-500" size={20} />
                    <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Permissions</p>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {role.Permissions?.length || 0} active
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {role.Permissions?.length === 0 ? (
                      <span className="text-sm text-gray-400 italic">No permissions assigned</span>
                    ) : (
                      role.Permissions?.slice(0, 5).map(perm => (
                        <span key={perm.id} className="px-2 py-1 bg-gray-50 text-gray-600 border border-gray-100 rounded text-xs">
                          {perm.name}
                        </span>
                      ))
                    )}
                    {(role.Permissions?.length > 5) && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded text-xs">
                        +{role.Permissions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => openPermissionModal(role)} 
                  icon={Shield}
                >
                  Manage Permissions
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Role Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)} 
        title="Create New Role"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name <span className="text-red-500">*</span></label>
            <input required type="text" value={formData.name} onChange={e => setFormData({ name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="e.g. Regional Manager" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Create Role</Button>
          </div>
        </form>
      </Modal>

      {/* Permission Modal */}
      <Modal 
        isOpen={isPermissionModalOpen} 
        onClose={() => !isSubmitting && setIsPermissionModalOpen(false)} 
        title={`Manage Permissions: ${currentRole?.name}`}
      >
        <form onSubmit={handlePermissionSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">Select the specific actions this role is allowed to perform.</p>
          
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
            {Object.keys(groupedPermissions).map(category => (
              <div key={category}>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                  {category} Permissions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupedPermissions[category].map(perm => (
                    <label key={perm.id} className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedPermissions.includes(perm.id) ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <div>
                        <span className={`block text-sm font-medium ${selectedPermissions.includes(perm.id) ? 'text-indigo-900' : 'text-gray-900'}`}>{perm.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsPermissionModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Save Permissions</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Roles;
