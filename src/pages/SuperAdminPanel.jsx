import React from 'react';
import SuperAdminLayout from '@/components/super-admin/SuperAdminLayout';
import SuperAdminUsers from '@/pages/SuperAdminUsers';

const SuperAdminPanel = () => {
  // This component now primarily acts as a wrapper if needed,
  // but the routing is handled in App.jsx.
  // We can render the layout and the initial page here or let the router handle it.
  // For simplicity, we'll let the router in App.jsx manage the content via <Outlet />.
  return (
    <SuperAdminLayout>
      {/* The child routes from App.jsx will be rendered here */}
    </SuperAdminLayout>
  );
};

export default SuperAdminPanel;