import { octokit, ORG } from '$lib/server/github';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const { repo: repoName, name: collectionSlug } = params;

  let config: any = { collections: [], contentPath: 'src/content' };

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

  const collectionDef = (config.collections || []).find((c: any) => c.slug === collectionSlug) ?? null;
  const contentPath = config.contentPath || 'src/content';
  const entriesPath = `${contentPath}/collections/${collectionSlug}.json`;

  let entries: any[] = [];
  let entriesSha: string | null = null;

  try {
    const { data: entriesFile } = await octokit.rest.repos.getContent({
      owner: ORG,
      repo: repoName,
      path: entriesPath
    });
    if ('content' in entriesFile && !Array.isArray(entriesFile)) {
      entries = JSON.parse(Buffer.from(entriesFile.content, 'base64').toString());
      entriesSha = entriesFile.sha;
    }
  } catch (e) {
    // File doesn't exist yet — empty collection
  }

  return { repo: repoName, collectionSlug, collectionDef, entries, entriesSha, config };
};

async function saveEntries(repoName: string, entriesPath: string, entries: any[], sha: string | null, message: string) {
  const content = Buffer.from(JSON.stringify(entries, null, 2)).toString('base64');
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: ORG,
    repo: repoName,
    path: entriesPath,
    message,
    content,
    ...(sha ? { sha } : {})
  });
}

export const actions: Actions = {
  createEntry: async ({ request, params }) => {
    const { repo: repoName, name: collectionSlug } = params;
    const data = await request.formData();
    const entryJson = data.get('entry') as string;

    if (!entryJson) return fail(400, { message: 'Entry data is required' });

    let config: any = { contentPath: 'src/content' };
    try {
      const { data: configFile } = await octokit.rest.repos.getContent({
        owner: ORG, repo: repoName, path: 'src/content/config.json'
      });
      if ('content' in configFile && !Array.isArray(configFile)) {
        config = { ...config, ...JSON.parse(Buffer.from(configFile.content, 'base64').toString()) };
      }
    } catch {}

    const entriesPath = `${config.contentPath || 'src/content'}/collections/${collectionSlug}.json`;
    let entries: any[] = [];
    let sha: string | null = null;

    try {
      const { data: f } = await octokit.rest.repos.getContent({ owner: ORG, repo: repoName, path: entriesPath });
      if ('content' in f && !Array.isArray(f)) {
        entries = JSON.parse(Buffer.from(f.content, 'base64').toString());
        sha = f.sha;
      }
    } catch {}

    entries.push(JSON.parse(entryJson));

    try {
      await saveEntries(repoName, entriesPath, entries, sha, `Add entry to ${collectionSlug} via CMS`);
      return { success: true };
    } catch (e) {
      return fail(500, { message: 'Failed to create entry' });
    }
  },

  saveEntry: async ({ request, params }) => {
    const { repo: repoName, name: collectionSlug } = params;
    const data = await request.formData();
    const index = Number(data.get('index'));
    const entryJson = data.get('entry') as string;

    if (isNaN(index) || !entryJson) return fail(400, { message: 'Index and entry data are required' });

    let config: any = { contentPath: 'src/content' };
    try {
      const { data: configFile } = await octokit.rest.repos.getContent({
        owner: ORG, repo: repoName, path: 'src/content/config.json'
      });
      if ('content' in configFile && !Array.isArray(configFile)) {
        config = { ...config, ...JSON.parse(Buffer.from(configFile.content, 'base64').toString()) };
      }
    } catch {}

    const entriesPath = `${config.contentPath || 'src/content'}/collections/${collectionSlug}.json`;
    let entries: any[] = [];
    let sha: string | null = null;

    try {
      const { data: f } = await octokit.rest.repos.getContent({ owner: ORG, repo: repoName, path: entriesPath });
      if ('content' in f && !Array.isArray(f)) {
        entries = JSON.parse(Buffer.from(f.content, 'base64').toString());
        sha = f.sha;
      }
    } catch {}

    if (index < 0 || index >= entries.length) return fail(400, { message: 'Invalid entry index' });
    entries[index] = JSON.parse(entryJson);

    try {
      await saveEntries(repoName, entriesPath, entries, sha, `Update entry in ${collectionSlug} via CMS`);
      return { success: true };
    } catch (e) {
      return fail(500, { message: 'Failed to save entry' });
    }
  },

  deleteEntry: async ({ request, params }) => {
    const { repo: repoName, name: collectionSlug } = params;
    const data = await request.formData();
    const index = Number(data.get('index'));

    if (isNaN(index)) return fail(400, { message: 'Entry index is required' });

    let config: any = { contentPath: 'src/content' };
    try {
      const { data: configFile } = await octokit.rest.repos.getContent({
        owner: ORG, repo: repoName, path: 'src/content/config.json'
      });
      if ('content' in configFile && !Array.isArray(configFile)) {
        config = { ...config, ...JSON.parse(Buffer.from(configFile.content, 'base64').toString()) };
      }
    } catch {}

    const entriesPath = `${config.contentPath || 'src/content'}/collections/${collectionSlug}.json`;
    let entries: any[] = [];
    let sha: string | null = null;

    try {
      const { data: f } = await octokit.rest.repos.getContent({ owner: ORG, repo: repoName, path: entriesPath });
      if ('content' in f && !Array.isArray(f)) {
        entries = JSON.parse(Buffer.from(f.content, 'base64').toString());
        sha = f.sha;
      }
    } catch {}

    if (index < 0 || index >= entries.length) return fail(400, { message: 'Invalid entry index' });
    entries.splice(index, 1);

    try {
      await saveEntries(repoName, entriesPath, entries, sha, `Delete entry from ${collectionSlug} via CMS`);
      return { success: true };
    } catch (e) {
      return fail(500, { message: 'Failed to delete entry' });
    }
  }
};
