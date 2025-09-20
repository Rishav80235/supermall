import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { User, Shield, LogOut } from 'lucide-react';

const AuthTest = () => {
  const { currentUser, isAdmin, handleLogout } = useContext(AppContext);
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, { test, result, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runAuthTests = () => {
    setTestResults([]);
    
    // Test 1: Check if user is logged in
    addTestResult(
      'User Authentication',
      currentUser ? 'PASS' : 'FAIL',
      currentUser ? `User: ${currentUser.email}` : 'No user logged in'
    );

    // Test 2: Check admin status
    addTestResult(
      'Admin Status',
      isAdmin ? 'PASS' : 'FAIL',
      isAdmin ? 'User is admin' : 'User is not admin'
    );

    // Test 3: Check user data
    if (currentUser) {
      addTestResult(
        'User Data',
        'PASS',
        `UID: ${currentUser.uid}, Display Name: ${currentUser.displayName || 'N/A'}`
      );
    }

    // Test 4: Check localStorage
    const hasAuthData = localStorage.getItem('firebase:authUser') || sessionStorage.getItem('firebase:authUser');
    addTestResult(
      'Local Storage',
      hasAuthData ? 'PASS' : 'FAIL',
      hasAuthData ? 'Auth data found in storage' : 'No auth data in storage'
    );
  };

  const clearTests = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Authentication Test Panel</h2>
        <div className="flex gap-2">
          <button
            onClick={runAuthTests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run Tests
          </button>
          <button
            onClick={clearTests}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Current Auth Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Current Authentication Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium">User Status</p>
              <p className="text-sm text-gray-600">
                {currentUser ? 'Logged In' : 'Not Logged In'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium">Admin Status</p>
              <p className="text-sm text-gray-600">
                {isAdmin ? 'Admin User' : 'Regular User'}
              </p>
            </div>
          </div>
        </div>

        {currentUser && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">User Details:</p>
            <p className="text-sm text-blue-700">Email: {currentUser.email}</p>
            <p className="text-sm text-blue-700">UID: {currentUser.uid}</p>
            <p className="text-sm text-blue-700">Display Name: {currentUser.displayName || 'N/A'}</p>
          </div>
        )}
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  result.result === 'PASS'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.test}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      result.result === 'PASS'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result.result}
                  </span>
                </div>
                {result.details && (
                  <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{result.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Users */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-yellow-900">Test Users</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded-lg border border-yellow-200">
            <h4 className="font-medium text-gray-900">Admin User</h4>
            <p className="text-sm text-gray-600">Email: admin@supermall.com</p>
            <p className="text-sm text-gray-600">Password: admin123</p>
            <p className="text-xs text-gray-500">Role: Admin</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-yellow-200">
            <h4 className="font-medium text-gray-900">Customer User</h4>
            <p className="text-sm text-gray-600">Email: customer@supermall.com</p>
            <p className="text-sm text-gray-600">Password: customer123</p>
            <p className="text-xs text-gray-500">Role: Customer</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <a
          href="/signup"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Go to Sign Up
        </a>
        <a
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </a>
        {currentUser && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        )}
        {isAdmin && (
          <a
            href="/admin"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Admin Panel
          </a>
        )}
        {currentUser && !isAdmin && (
          <a
            href="/customer"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Customer Dashboard
          </a>
        )}
      </div>
    </div>
  );
};

export default AuthTest;
