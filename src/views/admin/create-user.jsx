import React, {
  useCallback,
  useContext,
  useState,
} from 'react';

import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import request from '../../utils/request';
import ToastContext from '../../context/toast';

import ActiveForm from '../../components/active-form/active-form';

const createUserFields = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Email',
    required: true,
  },
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'First Name',
    required: true,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Last Name',
    required: true,
  },
  {
    name: 'pass',
    label: 'Password',
    type: 'password',
    placeholder: 'Password',
    required: true,
  },
];

export default function AdminCreateUserView() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const setToast = useContext(ToastContext);
  const navigate = useNavigate();

  const createUser = useCallback((data) => {
    const fetchData = async () => {
      try {
        const { id } = await request('/api/user', {
          method: 'POST',
          body: data,
        });
        setToast({
          header: 'User Created',
          body: 'The user has been created.',
        });
        navigate(`/admin/user/${id}`);
      } catch (e) {
        if (e.status === 400) { setFormError('Validation failure.'); }
        if (e.status === 409) { setFormError('Email already exists in system.'); }
        if (e.status === 500) { setFormError('Internal Server Error.'); }

        setToast({
          header: 'Error',
          body: 'A failure has occurred.',
          variant: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    setFormError(null);
    setIsLoading(true);
    fetchData();
  }, []);

  return (
    <Container>
      <h1 className="mb-4">Create User</h1>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin' }}>Admin</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin/users' }}>Users</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin/user/create' }} active>Create</Breadcrumb.Item>
      </Breadcrumb>
      <Row>
        <Col>
          <Card>
            <Card.Header>User Information</Card.Header>
            <ActiveForm
              fields={createUserFields}
              formError={formError}
              onSubmit={createUser}
              isLoading={isLoading}
            />
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
