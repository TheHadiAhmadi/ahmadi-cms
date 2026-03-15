import { octokit, ORG } from '$lib/server/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const repoName = params.repo;
  let config: any = { contentPath: 'src/content', filesPath: 'public/files', pages: [], seo: {} };
  let settings: any = {};

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
  } catch (e) { console.log('No src/content/config.json found'); }

  const contentPath = config.contentPath || 'src/content';

  // Read settings.json
  try {
    const { data: settingsFile } = await octokit.rest.repos.getContent({
      owner: ORG,
      repo: repoName,
      path: `${contentPath}/settings.json`
    });
    if ('content' in settingsFile && !Array.isArray(settingsFile)) {
      settings = JSON.parse(Buffer.from(settingsFile.content, 'base64').toString());
    }
  } catch (e) { console.log('No src/content/settings.json found'); }

  return { repo: repoName, config, settings };
};