import React from 'react';
import {
  createBrowserRouter,
} from 'react-router-dom';

import request from './utils/request';

import ErrorElement from './components/error-element/error-element';
import Redirect from './components/redirect/redirect';
import ProtectedRoute from './components/protected-route/protected-route';

import AdminCreateUserView from './views/admin/create-user';
import AdminHomeView from './views/admin/home';
import AdminUserView from './views/admin/user';
import AdminUsersView from './views/admin/users';

import SiteLayout from './components/site-layout/site-layout';
import HomeView from './views/home/home';
import LoginView from './views/login/login';

const router = createBrowserRouter([
  {
    path: '/login',
    errorElement: <Redirect to="/login" />,
    element: <LoginView />,
  },
  {
    element: <SiteLayout />,
    errorElement: <ErrorElement />,
    loader: () => request('/api/user'),
    children: [
      {
        path: '/',
        element: <HomeView />,
      },
      {
        path: '/admin',
        element: <ProtectedRoute />,
        children: [
          {
            path: '/admin',
            element: <AdminHomeView />,
          },
          {
            path: '/admin/users',
            element: <AdminUsersView />,
            loader: () => request('/api/users'),
          },
          {
            path: '/admin/user/:userId',
            element: <AdminUserView />,
            loader: ({ params }) => request(`/api/user/${params.userId}/detail`),
          },
          {
            path: '/admin/user',
            element: <AdminCreateUserView />,
          },
        ],
      },
    ],
  },
]);

export default router;
