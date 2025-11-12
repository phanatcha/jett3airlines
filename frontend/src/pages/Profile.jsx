import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainHeaderVer2 from '../components/MainHeaderVer2';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, logout, loading: authLoading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    dob: '',
    street: '',
    city: '',
    province: '',
    Country: '',
    postalcode: '',
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/profile' } });
    } else if (user) {
      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        street: user.street || '',
        city: user.city || '',
        province: user.province || '',
        Country: user.Country || '',
        postalcode: user.postalcode || '',
      });
    }
  }, [authLoading, isAuthenticated, navigate, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const result = await updateProfile(formData);

      if (result.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        street: user.street || '',
        city: user.city || '',
        province: user.province || '',
        Country: user.Country || '',
        postalcode: user.postalcode || '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <MainHeaderVer2 />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <MainHeaderVer2 />

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/my-bookings')}
              className="text-blue-900 hover:underline mb-2 flex items-center gap-1"
            >
              ← Back to My Bookings
            </button>
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={user.username || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                    isEditing ? 'bg-white' : 'bg-gray-100'
                  }`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                    isEditing ? 'bg-white' : 'bg-gray-100'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                    isEditing ? 'bg-white' : 'bg-gray-100'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                    isEditing ? 'bg-white' : 'bg-gray-100'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                    isEditing ? 'bg-white' : 'bg-gray-100'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Address Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                    isEditing ? 'bg-white' : 'bg-gray-100'
                  }`}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-100'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Province/State
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-100'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalcode"
                    value={formData.postalcode}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-100'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="Country"
                  value={formData.Country}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                    isEditing ? 'bg-white' : 'bg-gray-100'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          )}
        </form>

        {/* Account Actions */}
        {!isEditing && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/my-bookings')}
                className="w-full bg-blue-50 text-blue-900 py-3 rounded-lg hover:bg-blue-100 transition font-medium text-left px-4"
              >
                📋 View My Bookings
              </button>
              <button
                onClick={() => navigate('/flights')}
                className="w-full bg-blue-50 text-blue-900 py-3 rounded-lg hover:bg-blue-100 transition font-medium text-left px-4"
              >
                ✈️ Book a New Flight
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-600 py-3 rounded-lg hover:bg-red-100 transition font-medium text-left px-4"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
