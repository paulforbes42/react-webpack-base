import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import {
  Link,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import request from '../../utils/request';

import ActiveTable from '../../components/active-table/active-table';

const userTableHeaders = [
  {
    key: 'id',
    title: 'ID',
    type: 'link',
    href: (row) => `/admin/user/${row.id}`,
  },
  {
    key: 'firstName',
    title: 'First Name',
  },
  {
    key: 'lastName',
    title: 'Last Name',
  },
  {
    key: 'email',
    title: 'Email',
  },
  {
    key: 'createdAt',
    title: 'Created',
  },
];

export default function AdminUsersView() {
  const userData = useLoaderData();
  const navigate = useNavigate();
  const [users, setUsers] = useState(userData);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const userTableActions = useMemo(() => ([
    {
      key: 'create-user-icon',
      icon: <FontAwesomeIcon icon={faPlus} />,
      tooltip: 'Create User',
      variant: 'outline-primary',
      onClick: () => navigate('/admin/user'),
    },
  ]), []);

  const pageTo = useCallback((page, limit) => {
    const fetchData = async () => {
      const data = await request(`/api/users?page=${page}&limit=${limit}`);

      setUsers(data);
      setLoading(false);
      setCurrentPage(page);
    };

    setLoading(true);
    fetchData();
  });

  return (
    <Container>
      <h1 className="mb-4">Manage Users</h1>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin' }}>Admin</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin/users' }} active>Users</Breadcrumb.Item>
      </Breadcrumb>
      <Row>
        <Col>
          <ActiveTable
            actions={userTableActions}
            headers={userTableHeaders}
            title="User List"
            rows={users.rows}
            totalRows={users.count}
            loading={loading}
            page={currentPage}
            limit={10}
            refresh={pageTo}
            preventDirtyNavigation
          />
        </Col>
      </Row>
    </Container>
  );
}
