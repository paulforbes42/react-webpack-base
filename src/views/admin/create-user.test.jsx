import React from 'react';
import {
  fireEvent, render, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  createMemoryRouter,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';

import request from '../../utils/request';
import SiteLayout from '../../components/site-layout/site-layout';
import AdminCreateUserView from './create-user';

jest.mock('../../utils/request');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Admin User View', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

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
        element: <AdminCreateUserView />,
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

    await waitFor(() => expect(getByText('Create User')).toBeInTheDocument());

    expect(getByText('User Information')).toBeInTheDocument();
    expect(getByText('Email')).toBeInTheDocument();
    expect(getByText('First Name')).toBeInTheDocument();
    expect(getByText('Last Name')).toBeInTheDocument();
    expect(getByText('Password')).toBeInTheDocument();
  });

  it('should submit the user detail form', async () => {
    request.mockReturnValue({ id: 'testId' });
    const router = createMemoryRouter([{
      element: <SiteLayout />,
      loader: () => ({
        id: 'testId',
        firstName: 'Test',
        permissions: [],
      }),
      children: [{
        path: '/test/:userId',
        element: <AdminCreateUserView />,
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

    expect(await findByText('Create User')).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText('First Name'), { target: { value: 'testFirstName2' } });
    fireEvent.change(getByPlaceholderText('Last Name'), { target: { value: 'testLastName2' } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'test-pass' } });

    expect(getByText('Submit')).toBeInTheDocument();
    fireEvent.submit(getByText('Submit'));

    expect(await findByText('Create User')).toBeInTheDocument();
    expect(request).toHaveBeenCalledWith('/api/user', {
      method: 'POST',
      body: {
        firstName: 'testFirstName2',
        lastName: 'testLastName2',
        email: 'test@test.com',
        pass: 'test-pass',
      },
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/user/testId');
  });

  it('should handle validation failures', async () => {
    request.mockImplementation(() => {
      throw new Response('Invalid', { status: 400 });
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
        element: <AdminCreateUserView />,
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

    expect(await findByText('Create User')).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText('First Name'), { target: { value: 'testFirstName2' } });
    fireEvent.change(getByPlaceholderText('Last Name'), { target: { value: 'testLastName2' } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'test-pass' } });
    fireEvent.submit(getByText('Submit'));

    expect(await findByText('Create User')).toBeInTheDocument();

    expect(getByText('Validation failure.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle duplicate email failures', async () => {
    request.mockImplementation(() => {
      throw new Response('Invalid', { status: 409 });
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
        element: <AdminCreateUserView />,
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

    expect(await findByText('Create User')).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText('First Name'), { target: { value: 'testFirstName2' } });
    fireEvent.change(getByPlaceholderText('Last Name'), { target: { value: 'testLastName2' } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'test-pass' } });
    fireEvent.submit(getByText('Submit'));

    expect(await findByText('Create User')).toBeInTheDocument();

    expect(getByText('Email already exists in system.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
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
        element: <AdminCreateUserView />,
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

    expect(await findByText('Create User')).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText('First Name'), { target: { value: 'testFirstName2' } });
    fireEvent.change(getByPlaceholderText('Last Name'), { target: { value: 'testLastName2' } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'test-pass' } });
    fireEvent.submit(getByText('Submit'));

    expect(await findByText('Create User')).toBeInTheDocument();

    expect(getByText('Internal Server Error.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
