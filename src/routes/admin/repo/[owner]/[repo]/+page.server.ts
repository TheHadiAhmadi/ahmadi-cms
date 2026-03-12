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

  const contentPath = config.contentPath || 'src/content';
  const imagePath = config.imagePath || 'public/files';
  const pagesPath = config.pagesPath || 'src/pages';

  let contents: any[] = [];
  let collections: any[] = [];
  
  try {
    const { data: contentFiles } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: contentPath
    });

    if (Array.isArray(contentFiles)) {
      collections = contentFiles.filter(f => f.type === 'dir');
      contents = contentFiles.map(file => ({
        name: file.name,
        path: file.path,
        type: file.type,
        sha: file.sha,
        size: file.size,
        download_url: file.download_url
      }));
    }
  } catch (e) {
    console.error('Error fetching content:', e);
  }

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

  let pages: any[] = [];
  try {
    const { data: pageFiles } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: pagesPath
    });

    if (Array.isArray(pageFiles)) {
      pages = pageFiles.filter(f => f.type === 'file').map(file => ({
        name: file.name,
        path: file.path,
        type: file.type,
        sha: file.sha,
        size: file.size,
        download_url: file.download_url
      }));
    }
  } catch (e) {
    console.log('No pages folder found');
  }

  return {
    owner,
    repo,
    config,
    collections,
    contents,
    images,
    pages,
    currentPath: contentPath,
    imagePath,
    pagesPath
  };
};

export const actions: Actions = {
  createFile: async ({ request, params }) => {
    const { owner, repo } = params;
    const data = await request.formData();
    const name = data.get('name') as string;
    const path = data.get('path') as string;
    const type = data.get('type') as string;

    if (!name) {
      return fail(400, { message: 'Name is required' });
    }

    const filePath = path ? `${path}/${name}` : name;
    const content = type === 'folder' ? '' : '---\ntitle: \n---\n\n';

    try {
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: `Create ${type === 'folder' ? 'folder' : 'file'} ${name} via CMS`,
        content: Buffer.from(content).toString('base64')
      });

      return { success: true };
    } catch (e) {
      console.error('Error creating file:', e);
      return fail(500, { message: 'Failed to create file' });
    }
  },

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
  },

  uploadImage: async ({ request, params }) => {
    const { owner, repo } = params;
    const data = await request.formData();
    const file = data.get('file') as File;

    if (!file) {
      return fail(400, { message: 'No file provided' });
    }

    const imagePath = 'public/files';
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const fullPath = `${imagePath}/${fileName}`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const content = Buffer.from(arrayBuffer).toString('base64');

      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: fullPath,
        message: `Upload image ${fileName} via CMS`,
        content
      });

      return { success: true, url: `/files/${fileName}` };
    } catch (e) {
      console.error('Error uploading image:', e);
      return fail(500, { message: 'Failed to upload image' });
    }
  }
};