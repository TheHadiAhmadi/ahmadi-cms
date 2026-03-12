import { GITHUB_TOKEN, ADMIN_USERNAME, ADMIN_PASSWORD } from '$env/static/private';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const auth = event.cookies.get('auth');

  if (event.url.pathname.startsWith('/admin')) {
    if (auth !== 'true') {
      throw redirect(303, '/login');
    }
  }

  if (event.url.pathname === '/login' && auth === 'true') {
    throw redirect(303, '/admin');
  }

  return resolve(event);
};