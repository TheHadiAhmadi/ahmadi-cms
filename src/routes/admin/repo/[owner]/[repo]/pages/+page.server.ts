import { octokit } from '$lib/server/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { owner, repo } = params;

  let config: any = { 
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

  const pagesPath = config.pagesPath || 'src/pages';
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
    pages
  };
};