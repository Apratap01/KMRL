import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ProfileRoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();

  const docId = location.state?.userId || null; // userId from previous step

  const roles = [
    'Operations Department',
    'Engineering & Maintenance Department',
    'Procurement & Stores Department',
    'Safety & Regulatory Compliance Department',
    'Human Resources (HR)',
    'Finance & Accounts Department',
    'Executive / Board of Directors'
  ];

  const handleContinue = async () => {
    if (!selectedRole) {
      setError('Please select a department role');
      return;
    }

    if (!docId) {
      setError('User ID missing. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `${import.meta.env.VITE_USER_API_ENDPOINT}/complete-profile`,
        {
          userId: docId,
          department: selectedRole,
        }
      );

      if (response.status === 200) {
        // ✅ Profile updated, navigate to dashboard (or wherever you want)
        navigate('/login');
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md transform transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Just One Step Away 🚀
            </h1>
            <p className="text-gray-600 text-sm">
              Select your department role to complete your profile
            </p>
          </div>

          <div className="space-y-6">
            {/* Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Department Role
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                >
                  <span className={selectedRole ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedRole || 'Select your department role'}
                  </span>
                  <svg
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 scrollbar-hide">
                    <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
                      {roles.map((role, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedRole(role);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-900 hover:bg-violet-50 hover:text-violet-700 transition-colors duration-150 text-sm"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error message */}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={loading}
              className={`w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-200 active:scale-95 ${
                loading
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:from-purple-700 hover:to-violet-700 transform hover:scale-105 hover:shadow-xl'
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                ) : (
                  <>
                    <span>Continue</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileRoleSelection;
