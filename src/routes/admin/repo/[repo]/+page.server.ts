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

  // Read collection definitions from collections/ folder
  let collectionDefs: any[] = [];
  try {
    const { data: collectionFiles } = await octokit.rest.repos.getContent({
      owner: ORG,
      repo: repoName,
      path: `${contentPath}/collections`
    });

    if (Array.isArray(collectionFiles)) {
      const jsonFiles = collectionFiles.filter(f => f.type === 'file' && f.name.endsWith('.json'));
      
      for (const file of jsonFiles) {
        try {
          const { data: fileContent } = await octokit.rest.repos.getContent({
            owner: ORG,
            repo: repoName,
            path: file.path
          });
          
          if ('content' in fileContent && !Array.isArray(fileContent)) {
            const def = JSON.parse(Buffer.from(fileContent.content, 'base64').toString());
            collectionDefs.push(def);
          }
        } catch (err) {
          console.error(`Error reading collection definition ${file.path}:`, err);
        }
      }
    }
  } catch (e) {
    console.log('No src/content/collections folder found');
  }

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

  // Get collection folders from definitions
  const collectionFolders = collectionDefs.map(c => c.folder || c.slug);

  let contents: any[] = [];
  let collections: any[] = [];
  
  try {
    const { data: contentFiles } = await octokit.rest.repos.getContent({
      owner: ORG,
      repo: repoName,
      path: contentPath
    });

    if (Array.isArray(contentFiles)) {
      // Filter to only include folders that are defined in collection definitions
      collections = contentFiles.filter(f => 
        f.type === 'dir' && collectionFolders.includes(f.name)
      );
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

  // Pages are now defined in config.pages
  const pages = config.pages || [];

  return {
    repo: repoName,
    config,
    collectionDefs,
    settings,
    collections,
    contents,
    files,
    pages,
    currentPath: contentPath,
    filesPath
  };
};

export const actions: Actions = {
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