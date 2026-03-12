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

  return {
    owner,
    repo,
    config
  };
};