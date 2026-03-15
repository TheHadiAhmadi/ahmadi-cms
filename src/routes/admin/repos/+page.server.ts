import { octokit } from '$lib/server/github';
import { OWNER_USERNAME } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const ORG = OWNER_USERNAME;
  
  const { data: repos } = await octokit.rest.repos.listForOrg({
    org: ORG,
    sort: 'updated',
    per_page: 100
  });

  return {
    repos: repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      owner: repo.owner.login,
      updated_at: repo.updated_at
    }))
  };
};