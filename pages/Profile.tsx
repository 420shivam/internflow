import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Input, Button } from '../components/ui';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Profile</h2>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold">
            {user?.name.charAt(0)}
          </div>
          <div className="ml-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{user?.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{user?.role}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">{user?.id}</dd>
            </div>
          </dl>
        </div>
      </div>

      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Profile (Simulation)</h3>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Input label="First name" defaultValue={user?.name.split(' ')[0]} />
            </div>
            <div className="sm:col-span-3">
              <Input label="Last name" defaultValue={user?.name.split(' ')[1] || ''} />
            </div>
          </div>
          <div className="flex justify-end">
             <Button variant="secondary" disabled>Save Changes</Button>
             <span className="ml-2 text-xs text-gray-500 self-center">(Read-only for Demo)</span>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
