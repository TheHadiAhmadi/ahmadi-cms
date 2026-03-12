import { octokit } from '$lib/server/github';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const { owner, repo } = params;

  let config: any = { 
    collections: [],
    contentPath: 'src/content',
    imagePath: 'public/files',
    pagesPath: 'src/pages'
  };

  try {
    const { data: configFile } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: 'cms.config.json'
    });
    
    if ('content' in configFile && !Array.isArray(configFile)) {
      config = { ...config, ...JSON.parse(Buffer.from(configFile.content, 'base64').toString()) };
    }
  } catch (e) {
    console.log('No cms.config.json found, using defaults');
  }

  const imagePath = config.imagePath || 'public/files';
  let images: any[] = [];
  
  try {
    const { data: imageFiles } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: imagePath
    });

    if (Array.isArray(imageFiles)) {
      images = imageFiles.map(file => ({
        name: file.name,
        path: file.path,
        type: file.type,
        sha: file.sha,
        size: file.size,
        download_url: file.download_url
      }));
    }
  } catch (e) {
    console.error('Error fetching images:', e);
  }

  return {
    owner,
    repo,
    config,
    images
  };
};

export const actions: Actions = {
  deleteFile: async ({ request, params }) => {
    const { owner, repo } = params;
    const data = await request.formData();
    const path = data.get('path') as string;
    const sha = data.get('sha') as string;

    if (!path || !sha) {
      return fail(400, { message: 'Path and SHA are required' });
    }

    try {
      await octokit.rest.repos.deleteFile({
        owner,
        repo,
        path,
        message: `Delete ${path} via CMS`,
        sha
      });

      return { success: true };
    } catch (e) {
      console.error('Error deleting file:', e);
      return fail(500, { message: 'Failed to delete file' });
    }
  }
};