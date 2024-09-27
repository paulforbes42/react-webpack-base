import { createBrowserRouter } from 'react-router-dom';
import request from './utils/request';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  createBrowserRouter: jest.fn(),
}));

jest.mock('./utils/request');

describe('routes', () => {
  it('should run loaders', async () => {
    jest.isolateModules(async () => {
      jest.requireActual('./routes');

      expect(createBrowserRouter).toHaveBeenCalled();

      const routes = createBrowserRouter.mock.calls[0][0];

      const adminUsersRoute = routes[1].children.find(
        (r) => r.path === '/admin',
      ).children.find(
        (r) => r.path === '/admin/users',
      );
      await adminUsersRoute.loader();
      expect(request).toHaveBeenCalledWith('/api/users');

      const adminUserRoute = routes[1].children.find(
        (r) => r.path === '/admin',
      ).children.find(
        (r) => r.path === '/admin/user/:userId',
      );
      await adminUserRoute.loader({ params: { userId: 'test' } });
      expect(request).toHaveBeenCalledWith('/api/user/test/detail');
    });
  });
});
