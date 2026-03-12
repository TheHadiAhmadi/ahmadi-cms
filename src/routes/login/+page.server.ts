import { ADMIN_USERNAME, ADMIN_PASSWORD } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { dev } from '$app/environment';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      cookies.set('auth', 'true', {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: !dev,
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });

      throw redirect(303, '/admin');
    }

    return fail(400, { message: 'Invalid credentials' });
  }
};