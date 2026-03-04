import { useSeoMeta } from '@unhead/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlossomServer } from '@/hooks/useBlossomServer';
import { useBlossomList } from '@/hooks/useBlossomList';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { BlobUploadDialog } from '@/components/BlobUploadDialog';
import { BlobDetailDialog } from '@/components/BlobDetailDialog';
import { 
  Server, 
  Database, 
  Upload, 
  Download, 
  Clock, 
  FileText,
  HardDrive,
  Image,
  Video,
  Music,
  FileIcon,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flower2
} from 'lucide-react';
import { formatBytes } from '@/lib/formatBytes';
import { formatDistance } from 'date-fns';

const POPULAR_SERVERS = [
  'https://bs.samt.st',
  'https://cdn.satellite.earth',
  'https://nostr.download',
  'https://blossom.primal.net',
];

const Index = () => {
  useSeoMeta({
    title: 'Blossom Explorer - Browse Nostr File Storage',
    description: 'Explore Blossom servers, browse uploaded files, and manage your media storage on the Nostr network.',
  });

  const [serverUrl, setServerUrl] = useState('https://bs.samt.st');
  const [activeServer, setActiveServer] = useState('https://bs.samt.st');
  const { user } = useCurrentUser();

  const handleConnect = () => {
    if (serverUrl.trim()) {
      setActiveServer(serverUrl.trim());
    }
  };

  const handleQuickConnect = (url: string) => {
    setServerUrl(url);
    setActiveServer(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Flower2 className="h-16 w-16 text-pink-600 dark:text-pink-400" />
              <div className="absolute inset-0 animate-ping opacity-20">
                <Flower2 className="h-16 w-16 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Blossom Explorer
          </h1>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse and explore file storage servers on the Nostr network. Upload, manage, and discover media blobs stored simply on mediaservers.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Connection Section */}
        <Card className="mb-8 border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              Connect to Blossom Server
            </CardTitle>
            <CardDescription>
              Enter a Blossom server URL to explore its contents and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://cdn.satellite.earth"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                className="font-mono text-sm"
              />
              <Button onClick={handleConnect} className="bg-pink-600 hover:bg-pink-700">
                Connect
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Popular servers:</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SERVERS.map((url) => (
                  <Button
                    key={url}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickConnect(url)}
                    className="font-mono text-xs"
                  >
                    {url.replace('https://', '')}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Server Explorer */}
        {activeServer && (
          <BlossomServerExplorer serverUrl={activeServer} user={user} />
        )}

        {!activeServer && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
                No Server Selected
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Enter a Blossom server URL above to start exploring files and server capabilities
              </p>
            </CardContent>
          </Card>
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

interface BlossomServerExplorerProps {
  serverUrl: string;
  user: { pubkey: string } | null;
}

function BlossomServerExplorer({ serverUrl, user }: BlossomServerExplorerProps) {
  const { data: serverInfo, isLoading: serverLoading, error: serverError } = useBlossomServer(serverUrl);
  const { data: blobs, isLoading: blobsLoading, error: blobsError } = useBlossomList(
    serverUrl,
    user?.pubkey || ''
  );

  // Parse hostname safely
  let hostname = serverUrl;
  try {
    hostname = new URL(serverUrl).hostname;
  } catch (e) {
    // Keep the original serverUrl if parsing fails
  }

  if (serverLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (serverError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to connect to server: {serverError.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Server Info Card */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                {hostname}
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                {serverUrl}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={<Database className="h-4 w-4" />}
                  label="Total Files"
                  value={blobs?.length.toString() || '0'}
                  loading={blobsLoading}
                />
                <StatCard
                  icon={<HardDrive className="h-4 w-4" />}
                  label="Total Size"
                  value={formatBytes(blobs?.reduce((acc, b) => acc + (b.size || 0), 0) || 0)}
                  loading={blobsLoading}
                />
                <StatCard
                  icon={<Upload className="h-4 w-4" />}
                  label="Upload Endpoint"
                  value={serverInfo?.supportsUpload ? 'Available' : 'Unknown'}
                  loading={serverLoading}
                />
                <StatCard
                  icon={<Download className="h-4 w-4" />}
                  label="List Endpoint"
                  value={serverInfo?.supportsList ? 'Available' : 'Unknown'}
                  loading={serverLoading}
                />
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-4">
              {!user && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Log in to view your uploaded files on this server
                  </AlertDescription>
                </Alert>
              )}

              {user && serverInfo?.supportsUpload && (
                <div className="mb-4 flex justify-end">
                  <BlobUploadDialog 
                    serverUrl={serverUrl}
                    onUploadComplete={() => {
                      // The mutation will automatically invalidate and refetch the list
                    }}
                  />
                </div>
              )}

              {user && (
                <>
                  {blobsLoading && (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  )}

                  {blobsError && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to load files: {blobsError.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {!blobsLoading && !blobsError && blobs && blobs.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No files found on this server</p>
                    </div>
                  )}

                  {!blobsLoading && !blobsError && blobs && blobs.length > 0 && (
                    <ScrollArea className="h-[400px] rounded-md border">
                      <div className="p-4 space-y-2">
                        {blobs.map((blob) => (
                          <BlobCard key={blob.sha256} blob={blob} />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </>
              )}

              {!user && (
                <div className="py-8 flex justify-center">
                  <LoginArea className="max-w-60" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="capabilities" className="mt-4">
              <div className="space-y-4">
                <CapabilityItem
                  label="GET /<sha256>"
                  description="Blob retrieval endpoint"
                  status="supported"
                />
                <CapabilityItem
                  label="HEAD /<sha256>"
                  description="Check if blob exists"
                  status="supported"
                />
                <CapabilityItem
                  label="PUT /upload"
                  description="Upload new blobs"
                  status={serverInfo?.supportsUpload ? 'supported' : 'unknown'}
                />
                <CapabilityItem
                  label="GET /list/<pubkey>"
                  description="List user's blobs"
                  status={serverInfo?.supportsList ? 'supported' : 'unknown'}
                />
                <CapabilityItem
                  label="DELETE /<sha256>"
                  description="Delete user's blobs"
                  status={serverInfo?.supportsDelete ? 'supported' : 'unknown'}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading?: boolean;
}

function StatCard({ icon, label, value, loading }: StatCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-6 w-16" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
    </div>
  );
}

interface CapabilityItemProps {
  label: string;
  description: string;
  status: 'supported' | 'unsupported' | 'unknown';
}

function CapabilityItem({ label, description, status }: CapabilityItemProps) {
  const statusColors = {
    supported: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
    unsupported: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
    unknown: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  };

  const statusIcons = {
    supported: <CheckCircle2 className="h-4 w-4" />,
    unsupported: <XCircle className="h-4 w-4" />,
    unknown: <AlertCircle className="h-4 w-4" />,
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div>
        <p className="font-mono text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Badge variant="outline" className={statusColors[status]}>
        <span className="flex items-center gap-1">
          {statusIcons[status]}
          {status}
        </span>
      </Badge>
    </div>
  );
}

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
    if (!type) return <FileIcon className="h-5 w-5" />;
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-blue-600" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5 text-purple-600" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5 text-green-600" />;
    if (type.includes('text') || type.includes('pdf')) return <FileText className="h-5 w-5 text-orange-600" />;
    return <FileIcon className="h-5 w-5" />;
  };

  return (
    <BlobDetailDialog blob={blob}>
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {getFileIcon(blob.type)}
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs truncate">
              {blob.sha256.substring(0, 16)}...{blob.sha256.substring(blob.sha256.length - 8)}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {blob.size && <span>{formatBytes(blob.size)}</span>}
              {blob.type && (
                <>
                  <span>•</span>
                  <span>{blob.type}</span>
                </>
              )}
              {blob.uploaded && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistance(new Date(blob.uploaded * 1000), new Date(), { addSuffix: true })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </BlobDetailDialog>
  );
}

export default Index;
