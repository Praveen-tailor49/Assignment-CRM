import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '../store/slices/authSlice';
import api from '../services/api';
import { User, Lock, Upload, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    try {
      await api.put('/profile', profileData);
      toast.success('Profile updated successfully');
      dispatch(fetchCurrentUser());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingPassword(true);
    try {
      await api.put('/profile/password', passwordData);
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleFileUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('profile_picture', e.target.files[0]);
      try {
        await api.put('/profile/picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Profile picture updated successfully');
        dispatch(fetchCurrentUser());
      } catch (error) {
        toast.error('Failed to update profile picture. Route might not exist.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Account Settings" 
        description="Manage your profile information and security preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader 
            title="Profile Information" 
            subtitle="Update your personal details and contact information." 
            icon={<User size={20} className="text-indigo-600" />}
          />
          <CardContent>
            <div className="mb-8 flex items-center space-x-6">
              <div className="relative group">
                {user?.profile_picture ? (
                  <img src={`http://localhost:5000${user.profile_picture}`} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-3xl shadow-md border-4 border-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors group-hover:scale-110">
                  <Camera size={16} className="text-gray-600" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Profile Picture</h4>
                <p className="text-xs text-gray-500 mb-2">JPG, GIF or PNG. Max size of 2MB.</p>
                <Button variant="secondary" size="sm" isLoading={isUploading} onClick={() => document.querySelector('input[type="file"]').click()}>
                  <Upload size={14} className="mr-2" /> Upload New
                </Button>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-shadow" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-shadow bg-gray-50 text-gray-500" required disabled title="Contact administrator to change email" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="text" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-shadow" />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button type="submit" isLoading={isSubmittingProfile}>Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader 
            title="Change Password" 
            subtitle="Ensure your account is using a long, random password to stay secure."
            icon={<Lock size={20} className="text-gray-600" />}
          />
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm transition-shadow" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm transition-shadow" required />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long.</p>
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800" isLoading={isSubmittingPassword}>Update Password</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
