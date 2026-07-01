export const MANAGEMENT_CONSOLE_ROUTE_BASE_PATH = 'managementConsoleRoutes';

export const MANAGEMENT_CONSOLE_ABSOLUTE_ROUTES = {
  root: `/${MANAGEMENT_CONSOLE_ROUTE_BASE_PATH}`,

  home: `/${MANAGEMENT_CONSOLE_ROUTE_BASE_PATH}/home`,

  activeSession: `/${MANAGEMENT_CONSOLE_ROUTE_BASE_PATH}/active-session`,

  userCreation: `/${MANAGEMENT_CONSOLE_ROUTE_BASE_PATH}/user-creation`,
  about:`/${MANAGEMENT_CONSOLE_ROUTE_BASE_PATH}/about`,
  contact:`/${MANAGEMENT_CONSOLE_ROUTE_BASE_PATH}/contact`,

  /*
    Management Console login fail হলে এখানে redirect হবে।
  */
  microfontHome: '/landing/home',
} as const;