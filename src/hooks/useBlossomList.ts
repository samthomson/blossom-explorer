import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { useNostr } from '@nostrify/react';

export interface BlobDescriptor {
  url?: string;
  sha256: string;
  size?: number;
  type?: string;
  uploaded?: number;
}

/**
 * Hook to list blobs from a Blossom server
 * Requires user authentication
 */
export function useBlossomList(serverUrl: string, pubkey: string) {
  const { user } = useCurrentUser();
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['blossom-list', serverUrl, pubkey],
    queryFn: async (): Promise<BlobDescriptor[]> => {
      if (!user) {
        throw new Error('User must be logged in to list blobs');
      }

      // Normalize URL
      const url = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;

      // Create authorization event (BUD-02)
      const authEvent = await nostr.event({
        kind: 24242,
        content: 'List Blobs',
        tags: [
          ['t', 'list'],
          ['expiration', Math.floor(Date.now() / 1000 + 60).toString()], // 1 minute expiration
        ],
      });

      // Base64 encode the event
      const authHeader = `Nostr ${btoa(JSON.stringify(authEvent))}`;

      // Fetch the list
      const response = await fetch(`${url}/list/${pubkey}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No blobs found, return empty array
          return [];
        }
        throw new Error(`Failed to fetch blobs: ${response.statusText}`);
      }

      const blobs: BlobDescriptor[] = await response.json();
      return blobs;
    },
    enabled: !!serverUrl && !!pubkey && !!user,
    staleTime: 30 * 1000, // 30 seconds
  });
}
