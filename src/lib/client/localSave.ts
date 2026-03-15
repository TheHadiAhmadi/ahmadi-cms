import { getPendingChanges, savePendingChange, deletePendingChanges, type PendingChange, generateChangeId } from '$lib/db';

export interface LocalSaveResult {
  success: boolean;
  changeId?: string;
  error?: string;
}

export async function saveCollectionEntry(
  repo: string,
  collectionSlug: string,
  entries: any[],
  sha?: string
): Promise<LocalSaveResult> {
  const path = `src/content/collections/${collectionSlug}.json`;
  
  try {
    await savePendingChange({
      id: generateChangeId(repo, path),
      repo,
      path,
      type: 'collection',
      content: JSON.stringify(entries, null, 2),
      sha,
      collectionSlug,
      message: `Update ${collectionSlug} collection via CMS`
    });
    return { success: true, changeId: `${repo}:${path}` };
  } catch (e) {
    return { success: false, error: 'Failed to save locally' };
  }
}

export async function savePages(
  repo: string,
  pages: any[],
  sha?: string
): Promise<LocalSaveResult> {
  const path = 'src/content/pages.json';
  
  try {
    await savePendingChange({
      id: generateChangeId(repo, path),
      repo,
      path,
      type: 'page',
      content: JSON.stringify(pages, null, 2),
      sha,
      message: 'Update pages configuration via CMS'
    });
    return { success: true, changeId: `${repo}:${path}` };
  } catch (e) {
    return { success: false, error: 'Failed to save locally' };
  }
}

export async function saveSettings(
  repo: string,
  settings: any,
  sha?: string
): Promise<LocalSaveResult> {
  const path = 'src/content/settings.json';
  
  try {
    await savePendingChange({
      id: generateChangeId(repo, path),
      repo,
      path,
      type: 'setting',
      content: JSON.stringify(settings, null, 2),
      sha,
      message: 'Update settings via CMS'
    });
    return { success: true, changeId: `${repo}:${path}` };
  } catch (e) {
    return { success: false, error: 'Failed to save locally' };
  }
}

export async function publishChanges(repo: string): Promise<{ success: boolean; error?: string }> {
  try {
    const changes = await getPendingChanges(repo);
    
    if (changes.length === 0) {
      return { success: true };
    }

    const response = await fetch(`/api/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo, changes })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to publish' };
    }

    const publishedIds = changes.map(c => c.id);
    await deletePendingChanges(publishedIds);
    
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Network error during publish' };
  }
}
