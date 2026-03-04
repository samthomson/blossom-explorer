import { useSeoMeta } from '@unhead/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlossomList } from '@/hooks/useBlossomList';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { BlobUploadDialog } from '@/components/BlobUploadDialog';
import { BlobDetailDialog } from '@/components/BlobDetailDialog';
import { 
  Database, 
  HardDrive,
  Clock, 
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FileIcon,
  AlertCircle,
  Flower2,
  ExternalLink
} from 'lucide-react';
import { formatBytes } from '@/lib/formatBytes';
import { formatDistance } from 'date-fns';

const Index = () => {
  useSeoMeta({
    title: 'Blossom Explorer - Browse Nostr File Storage',
    description: 'Explore Blossom servers and browse uploaded files on the Nostr network.',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [serverUrl, setServerUrl] = useState(searchParams.get('server') || 'https://bs.samt.st');
  const { user } = useCurrentUser();

  const { data: blobs, isLoading: blobsLoading, error: blobsError } = useBlossomList(
    serverUrl,
    user?.pubkey || ''
  );

  useEffect(() => {
    if (serverUrl) {
      setSearchParams({ server: serverUrl });
    }
  }, [serverUrl, setSearchParams]);

  const totalSize = blobs?.reduce((acc, b) => acc + (b.size || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      {/* Header */}
      <div className="relative overflow-hidden border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="container mx-auto px-4 py-12 relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flower2 className="h-12 w-12 text-pink-600 dark:text-pink-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Blossom Explorer
            </h1>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Browse and explore file storage servers on the Nostr network
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Server Input */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Server URL (e.g., https://bs.samt.st)"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <div className="flex items-center gap-2">
                <LoginArea className="max-w-fit" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats and Upload */}
        {user && blobs && blobs.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>{blobs.length} files</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span>{formatBytes(totalSize)}</span>
              </div>
            </div>
            <BlobUploadDialog serverUrl={serverUrl} />
          </div>
        )}

        {/* Login Alert */}
        {!user && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Log in to view your uploaded files on this server
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {user && blobsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {user && blobsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load files: {blobsError.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {user && !blobsLoading && !blobsError && blobs && blobs.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <FileIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
                No files found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your first file to get started
              </p>
              <BlobUploadDialog serverUrl={serverUrl} />
            </CardContent>
          </Card>
        )}

        {/* Blob Grid */}
        {user && !blobsLoading && !blobsError && blobs && blobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blobs.map((blob) => (
              <BlobCard key={blob.sha256} blob={blob} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Vibed with{' '}
            <a 
              href="https://shakespeare.diy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-600 dark:text-pink-400 hover:underline"
            >
              Shakespeare
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

interface BlobCardProps {
  blob: {
    sha256: string;
    url?: string;
    size?: number;
    type?: string;
    uploaded?: number;
  };
}

function BlobCard({ blob }: BlobCardProps) {
  const getFileIcon = (type?: string) => {
    if (!type) return <FileIcon className="h-8 w-8 text-muted-foreground" />;
    if (type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-600" />;
    if (type.startsWith('video/')) return <Video className="h-8 w-8 text-purple-600" />;
    if (type.startsWith('audio/')) return <Music className="h-8 w-8 text-green-600" />;
    if (type.includes('text') || type.includes('pdf')) return <FileText className="h-8 w-8 text-orange-600" />;
    return <FileIcon className="h-8 w-8 text-muted-foreground" />;
  };

  const isImage = blob.type?.startsWith('image/');
  const isVideo = blob.type?.startsWith('video/');

  return (
    <BlobDetailDialog blob={blob}>
      <Card className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden">
        <CardContent className="p-0">
          {/* Preview */}
          <div className="relative h-48 bg-muted/50 flex items-center justify-center overflow-hidden">
            {isImage && blob.url && (
              <img 
                src={blob.url} 
                alt={blob.sha256}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<div class="flex items-center justify-center h-full">${getFileIcon(blob.type)}</div>`;
                }}
              />
            )}
            {isVideo && blob.url && (
              <video 
                src={blob.url}
                className="w-full h-full object-cover"
                muted
                playsInline
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {!isImage && !isVideo && (
              <div className="flex items-center justify-center h-full">
                {getFileIcon(blob.type)}
              </div>
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ExternalLink className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="p-3 space-y-1">
            <p className="font-mono text-xs truncate font-medium">
              {blob.sha256.substring(0, 20)}...{blob.sha256.substring(blob.sha256.length - 8)}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {blob.size && <span>{formatBytes(blob.size)}</span>}
              {blob.type && (
                <>
                  <span>•</span>
                  <span className="truncate">{blob.type.split('/')[1]}</span>
                </>
              )}
            </div>
            {blob.uploaded && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDistance(new Date(blob.uploaded * 1000), new Date(), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </BlobDetailDialog>
  );
}

export default Index;
