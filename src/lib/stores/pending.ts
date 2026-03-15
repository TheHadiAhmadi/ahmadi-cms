import { writable, derived, get } from 'svelte/store';
import { 
  getPendingChanges, 
  deletePendingChanges, 
  type PendingChange 
} from '$lib/db';

function createPendingChangesStore() {
  const { subscribe, set, update } = writable<PendingChange[]>([]);
  
  return {
    subscribe,
    
    async load(repo?: string) {
      try {
        const changes = await getPendingChanges(repo);
        set(changes);
      } catch (e) {
        console.error('Failed to load pending changes:', e);
      }
    },
    
    async refresh(repo?: string) {
      await this.load(repo);
    },
    
    async remove(ids: string[]) {
      try {
        await deletePendingChanges(ids);
        update(changes => changes.filter(c => !ids.includes(c.id)));
      } catch (e) {
        console.error('Failed to remove pending changes:', e);
      }
    }
  };
}

export const pendingChanges = createPendingChangesStore();

export const pendingChangesCount = derived(
  pendingChanges,
  $changes => $changes.length
);

export const pendingChangesByRepo = derived(
  pendingChanges,
  $changes => {
    const grouped: Record<string, PendingChange[]> = {};
    for (const change of $changes) {
      if (!grouped[change.repo]) {
        grouped[change.repo] = [];
      }
      grouped[change.repo].push(change);
    }
    return grouped;
  }
);
