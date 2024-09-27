import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  createMemoryRouter,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';

import request from '../../utils/request';

import AdminUsersView from './users';

jest.mock('../../utils/request');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Admin Users View', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('should render', async () => {
    const router = createMemoryRouter([{
      path: '/test',
      element: <AdminUsersView />,
      loader: () => ({
        count: 89,
        rows: [
          {
            id: 'testId',
            firstName: 'testFirstName',
            lastName: 'testLastName',
            email: 'testEmail',
            createdAt: 'testCreatedAt',
          },
        ],
      }),
    }], { initialEntries: ['/test'] });

    const { getByText } = render(
      <RouterProvider router={router} />,
    );

    await waitFor(() => expect(getByText('User List')).toBeInTheDocument());
    expect(getByText('testId')).toBeInTheDocument();
    expect(getByText('testFirstName')).toBeInTheDocument();
    expect(getByText('testLastName')).toBeInTheDocument();
    expect(getByText('testEmail')).toBeInTheDocument();
    expect(getByText('testCreatedAt')).toBeInTheDocument();
  });

  it('should paginate the user list', async () => {
    request.mockReturnValue([]);
    const router = createMemoryRouter([{
      path: '/test',
      element: <AdminUsersView />,
      loader: () => ({
        count: 89,
        rows: [
          {
            id: 'testId',
            firstName: 'testFirstName',
            lastName: 'testLastName',
            email: 'testEmail',
            createdAt: 'testCreatedAt',
          },
        ],
      }),
    }], { initialEntries: ['/test'] });

    const { getByText, getByTestId } = render(
      <RouterProvider router={router} />,
    );

    await waitFor(() => expect(getByText('User List')).toBeInTheDocument());

    expect(getByTestId('pagination-8')).toBeInTheDocument();
    fireEvent.click(getByTestId('pagination-8'));

    await waitFor(() => expect(request).toHaveBeenCalledWith('/api/users?page=8&limit=10'));
  });

  it('should create a new user', async () => {
    const router = createMemoryRouter([{
      path: '/test',
      element: <AdminUsersView />,
      loader: () => ({
        count: 89,
        rows: [
          {
            id: 'testId',
            firstName: 'testFirstName',
            lastName: 'testLastName',
            email: 'testEmail',
            createdAt: 'testCreatedAt',
          },
        ],
      }),
    }], { initialEntries: ['/test'] });

    const { getByTestId, getByText } = render(
      <RouterProvider router={router} />,
    );

    await waitFor(() => expect(getByText('User List')).toBeInTheDocument());

    fireEvent.click(getByTestId('create-user-icon'));

    expect(mockNavigate).toHaveBeenCalledWith('/admin/user');
  });
});
