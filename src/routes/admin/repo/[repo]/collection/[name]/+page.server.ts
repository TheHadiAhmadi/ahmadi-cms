import { octokit, ORG } from '$lib/server/github';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const { repo: repoName } = params;
  const collectionName = params.name;

  let config: any = { };
  let collectionDef: any = null;

  // Read config.json
  try {
    const { data: configFile } = await octokit.rest.repos.getContent({
      owner: ORG,
      repo: repoName,
      path: '/src/content/config.json'
    });
    
    if ('content' in configFile && !Array.isArray(configFile)) {
      config = { ...config, ...JSON.parse(Buffer.from(configFile.content, 'base64').toString()) };
    }
  } catch (e) {
    console.log('No src/content/config.json found');
  }

  // Read collection definition from collections folder
  try {
    const { data: collectionFile } = await octokit.rest.repos.getContent({
      owner: ORG,
      repo: repoName,
      path: `src/content/collections/${collectionName}.json`
    });
    
    if ('content' in collectionFile && !Array.isArray(collectionFile)) {
      collectionDef = JSON.parse(Buffer.from(collectionFile.content, 'base64').toString());
    }
  } catch (e) {
    console.log(`No collection definition found for ${collectionName}`);
  }

  const contentPath = config.contentPath || 'src/content';
  const collectionPath = `${contentPath}/${collectionDef?.folder || collectionName}`;
  let entries: any[] = [];
  
  try {
    const { data: files } = await octokit.rest.repos.getContent({
      owner: ORG,
      repo: repoName,
      path: collectionPath
    });

    if (Array.isArray(files)) {
      entries = files.filter(f => f.type === 'file').map(file => ({
        name: file.name,
        path: file.path,
        sha: file.sha,
        size: file.size
      }));
    }
  } catch (e) {
    console.error('Error fetching collection:', e);
  }

  return {
    repo: repoName,
    collectionName,
    collectionDef,
    entries,
    config
  };
};

export const actions: Actions = {
  deleteFile: async ({ request, params }) => {
    const data = await request.formData();
    const path = data.get('path') as string;
    const sha = data.get('sha') as string;

    if (!path || !sha) return fail(400, { message: 'Path and SHA are required' });

    try {
      await octokit.rest.repos.deleteFile({
        owner: ORG,
        repo: params.repo,
        path,
        message: `Delete ${path} via CMS`,
        sha
      });
      return { success: true };
    } catch (e) {
      return fail(500, { message: 'Failed to delete file' });
    }
  }
};