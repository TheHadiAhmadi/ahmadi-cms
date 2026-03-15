import { octokit, ORG } from '$lib/server/github';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const { repo: repoName } = params;

  let config: any = { 
    collections: [],
    singletons: [],
    pages: [],
    seo: {},
    contentPath: 'src/content',
    filesPath: 'public/files'
  };

  // Read config.json
  try {
    const { data: configFile } = await octokit.rest.repos.getContent({
      owner: ORG,
      repo: repoName,
      path: 'src/content/config.json'
    });
    
    if ('content' in configFile && !Array.isArray(configFile)) {
      config = { ...config, ...JSON.parse(Buffer.from(configFile.content, 'base64').toString()) };
    }
  } catch (e) {
    console.log('No src/content/config.json found');
  }

  const contentPath = config.contentPath || 'src/content';
  const filesPath = config.filesPath || 'public/files';

  // Collection definitions come directly from config.json
  const collectionDefs: any[] = config.collections || [];

  // Read settings from settings.json
  let settings: any = {};
  try {
    const { data: settingsFile } = await octokit.rest.repos.getContent({
      owner: ORG,
      repo: repoName,
      path: `${contentPath}/settings.json`
    });
    
    if ('content' in settingsFile && !Array.isArray(settingsFile)) {
      settings = JSON.parse(Buffer.from(settingsFile.content, 'base64').toString());
    }
  } catch (e) {
    console.log('No src/content/settings.json found');
  }

  const collections = collectionDefs;

  let contents: any[] = [];
  try {
    const { data: contentFiles } = await octokit.rest.repos.getContent({
      owner: ORG,
      repo: repoName,
      path: contentPath
    });

    if (Array.isArray(contentFiles)) {
      contents = contentFiles.map(file => ({
        name: file.name,
        path: file.path,
        type: file.type,
        sha: file.sha,
        size: file.size
      }));
    }
  } catch (e) {
    console.error('Error fetching content:', e);
  }

  let files: any[] = [];
  try {
    const { data: imageFiles } = await octokit.rest.repos.getContent({
      owner: ORG,
      repo: repoName,
      path: filesPath
    });

    if (Array.isArray(imageFiles)) {
      files = imageFiles.map(file => ({
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

  // Pages are now defined in pages.json (client-editable)
  let pages: any[] = [];
  let pagesSha: string | null = null;
  try {
    const { data: pagesFile } = await octokit.rest.repos.getContent({
      owner: ORG,
      repo: repoName,
      path: `${contentPath}/pages.json`
    });
    
    if ('content' in pagesFile && !Array.isArray(pagesFile)) {
      pages = JSON.parse(Buffer.from(pagesFile.content, 'base64').toString());
      pagesSha = pagesFile.sha;
    }
  } catch (e) {
    console.log('No src/content/pages.json found');
  }

  return {
    repo: repoName,
    config,
    collectionDefs,
    settings,
    collections,
    contents,
    files,
    pages,
    pagesSha,
    currentPath: contentPath,
    filesPath
  };
};

export const actions: Actions = {
  savePages: async ({ request, params }) => {
    const { repo: repoName } = params;
    const data = await request.formData();
    const pagesJson = data.get('pages') as string;
    const sha = data.get('sha') as string;

    if (!pagesJson) return fail(400, { message: 'Pages data is required' });

    let config: any = { contentPath: 'src/content' };
    try {
      const { data: configFile } = await octokit.rest.repos.getContent({
        owner: ORG, repo: repoName, path: 'src/content/config.json'
      });
      if ('content' in configFile && !Array.isArray(configFile)) {
        config = { ...config, ...JSON.parse(Buffer.from(configFile.content, 'base64').toString()) };
      }
    } catch {}

    const contentPath = config.contentPath || 'src/content';
    const pagesPath = `${contentPath}/pages.json`;

    try {
      const content = Buffer.from(pagesJson).toString('base64');
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: ORG,
        repo: repoName,
        path: pagesPath,
        message: 'Update pages configuration via CMS',
        content,
        ...(sha ? { sha } : {})
      });
      return { success: true };
    } catch (e) {
      console.error('Error saving pages:', e);
      return fail(500, { message: 'Failed to save pages' });
    }
  },

  createFile: async ({ request, params }) => {
    const { repo: repoName } = params;
    const data = await request.formData();
    const name = data.get('name') as string;
    const path = data.get('path') as string;
    const type = data.get('type') as string;

    if (!name) return fail(400, { message: 'Name is required' });

    const filePath = path ? `${path}/${name}` : name;
    const content = type === 'folder' ? '' : '---\ntitle: \n---\n\n';

    try {
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: ORG,
        repo: repoName,
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
    const { repo: repoName } = params;
    const data = await request.formData();
    const path = data.get('path') as string;
    const sha = data.get('sha') as string;

    if (!path || !sha) return fail(400, { message: 'Path and SHA are required' });

    try {
      await octokit.rest.repos.deleteFile({
        owner: ORG,
        repo: repoName,
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