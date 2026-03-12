import { octokit } from '$lib/server/github';
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const { owner, repo, path } = params;

  try {
    const { data: file } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path
    });

    if (!Array.isArray(file) && 'content' in file) {
      const content = Buffer.from(file.content, 'base64').toString();
      return {
        owner,
        repo,
        path,
        content,
        sha: file.sha
      };
    }

    throw new Error('Not a file');
  } catch (e) {
    console.error('Error fetching file content:', e);
    throw redirect(303, `/admin/repo/${owner}/${repo}`);
  }
};

export const actions: Actions = {
  save: async ({ request, params }) => {
    const { owner, repo, path } = params;
    const data = await request.formData();
    const content = data.get('content') as string;
    const sha = data.get('sha') as string;
    const message = data.get('message') as string || 'Update content via Ahmadi CMS';

    try {
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        sha
      });

      return { success: true };
    } catch (e) {
      console.error('Error saving file:', e);
      return fail(500, { message: 'Failed to save changes' });
    }
  },
  upload: async ({ request, params }) => {
    const { owner, repo } = params;
    const data = await request.formData();
    const file = data.get('file') as File;

    if (!file) return fail(400, { message: 'No file provided' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const content = Buffer.from(arrayBuffer).toString('base64');
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `public/files/${fileName}`;

      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: `Upload image ${fileName} via Ahmadi CMS`,
        content
      });

      return { 
        success: true, 
        url: `/${filePath.replace('public/', '')}` 
      };
    } catch (e) {
      console.error('Error uploading image:', e);
      return fail(500, { message: 'Failed to upload image' });
    }
  }
};