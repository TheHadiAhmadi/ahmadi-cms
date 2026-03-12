import { redirect, type Actions } from '@sveltejs/kit';

export const load = () => {
  throw redirect(303, '/login');
};

export const actions: Actions = {
  default: ({ cookies }) => {
    cookies.delete('auth', { path: '/' });
    throw redirect(303, '/login');
  }
};