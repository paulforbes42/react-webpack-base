import React from 'react';
import {
  fireEvent, render, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  createMemoryRouter,
  RouterProvider,
} from 'react-router-dom';

import request from '../../utils/request';
import SiteLayout from '../../components/site-layout/site-layout';
import AdminUserView from './user';

jest.mock('../../utils/request');

describe('Admin User View', () => {
  it('should render', async () => {
    const router = createMemoryRouter([{
      element: <SiteLayout />,
      loader: () => ({
        id: 'testId',
        firstName: 'Test',
        permissions: [],
      }),
      children: [{
        path: '/test',
        element: <AdminUserView />,
        loader: () => ({
          id: 'testId',
          firstName: 'testFirstName',
          lastName: 'testLastName',
          email: 'testEmail',
          createdAt: 'testCreatedAt',
        }),
      }],
    }], { initialEntries: ['/test'] });

    const { getByText } = render(
      <RouterProvider router={router} />,
    );

    await waitFor(() => expect(getByText('User Detail')).toBeInTheDocument());

    expect(getByText('ID')).toBeInTheDocument();
    expect(getByText('Email')).toBeInTheDocument();
    expect(getByText('First Name')).toBeInTheDocument();
    expect(getByText('Last Name')).toBeInTheDocument();
    expect(getByText('Created')).toBeInTheDocument();
  });

  it('should submit the user detail form', async () => {
    const router = createMemoryRouter([{
      element: <SiteLayout />,
      loader: () => ({
        id: 'testId',
        firstName: 'Test',
        permissions: [],
      }),
      children: [{
        path: '/test/:userId',
        element: <AdminUserView />,
        loader: () => ({
          id: 'testId',
          firstName: 'testFirstName',
          lastName: 'testLastName',
          email: 'testEmail',
          createdAt: 'testCreatedAt',
        }),
      }],
    }], { initialEntries: ['/test/testId'] });

    const {
      getByText, getByPlaceholderText, findByText,
    } = render(
      <RouterProvider router={router} />,
    );

    expect(await findByText('User Detail')).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText('First Name'), { target: { value: 'testFirstName1' } });

    expect(getByText('Submit')).toBeInTheDocument();
    fireEvent.submit(getByText('Submit'));

    expect(await findByText('User Detail')).toBeInTheDocument();
    expect(request).toHaveBeenCalledWith('/api/user/testId', {
      method: 'PUT',
      body: {
        firstName: 'testFirstName1',
        lastName: 'testLastName',
        email: 'testEmail',
      },
    });
  });

  it('should handle invalid user failures', async () => {
    request.mockImplementation(() => {
      throw new Response('Invalid', { status: 404 });
    });
    const router = createMemoryRouter([{
      element: <SiteLayout />,
      loader: () => ({
        id: 'testId',
        firstName: 'Test',
        permissions: [],
      }),
      children: [{
        path: '/test/:userId',
        element: <AdminUserView />,
        loader: () => ({
          id: 'testId',
          firstName: 'testFirstName',
          lastName: 'testLastName',
          email: 'testEmail',
          createdAt: 'testCreatedAt',
        }),
      }],
    }], { initialEntries: ['/test/testId'] });

    const {
      getByText, getByPlaceholderText, findByText,
    } = render(
      <RouterProvider router={router} />,
    );

    expect(await findByText('User Detail')).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText('First Name'), { target: { value: 'testFirstName1' } });

    fireEvent.submit(getByText('Submit'));

    expect(await findByText('User Detail')).toBeInTheDocument();

    expect(getByText('Invalid user specified.')).toBeInTheDocument();
  });

  it('should handle internal server error failures', async () => {
    request.mockImplementation(() => {
      throw new Response('Invalid', { status: 500 });
    });
    const router = createMemoryRouter([{
      element: <SiteLayout />,
      loader: () => ({
        id: 'testId',
        firstName: 'Test',
        permissions: [],
      }),
      children: [{
        path: '/test/:userId',
        element: <AdminUserView />,
        loader: () => ({
          id: 'testId',
          firstName: 'testFirstName',
          lastName: 'testLastName',
          email: 'testEmail',
          createdAt: 'testCreatedAt',
        }),
      }],
    }], { initialEntries: ['/test/testId'] });

    const {
      getByText, getByPlaceholderText, findByText,
    } = render(
      <RouterProvider router={router} />,
    );

    expect(await findByText('User Detail')).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText('First Name'), { target: { value: 'testFirstName1' } });

    fireEvent.submit(getByText('Submit'));

    expect(await findByText('User Detail')).toBeInTheDocument();

    expect(getByText('Internal Server Error.')).toBeInTheDocument();
  });
});
