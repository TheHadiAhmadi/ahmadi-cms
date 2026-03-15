import { octokit, ORG } from '$lib/server/github';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json() as { repo: string; changes: any[] };
    const { repo, changes } = body;

    if (!repo || !changes || !Array.isArray(changes)) {
      return json({ success: false, message: 'Invalid request' }, { status: 400 });
    }

    const results: { path: string; success: boolean; error?: string }[] = [];

    for (const change of changes) {
      try {
        const content = Buffer.from(change.content || '').toString('base64');
        
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: ORG,
          repo,
          path: change.path,
          message: change.message || `Update ${change.path} via CMS`,
          content,
          ...(change.sha ? { sha: change.sha } : {})
        });

        results.push({ path: change.path, success: true });
      } catch (e: any) {
        results.push({ path: change.path, success: false, error: e.message });
      }
    }

    const failed = results.filter(r => !r.success);
    
    if (failed.length > 0) {
      return json({ 
        success: false, 
        message: `Failed to publish ${failed.length} file(s)`,
        results 
      }, { status: 500 });
    }

    return json({ success: true, results });
  } catch (e: any) {
    return json({ success: false, message: e.message }, { status: 500 });
  }
};
