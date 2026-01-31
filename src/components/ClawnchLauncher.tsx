import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Rocket, Upload, Coins, ExternalLink, AlertCircle, CheckCircle2, Image as ImageIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface LaunchResult {
  success: boolean;
  agent?: string;
  post_id?: string;
  post_url?: string;
  token_address?: string;
  tx_hash?: string;
  clanker_url?: string;
  explorer_url?: string;
  rewards?: {
    agent_share: string;
    platform_share: string;
    agent_wallet: string;
  };
  error?: string;
  errors?: string[];
  phase?: string;
}

interface LaunchedToken {
  name: string;
  symbol: string;
  token_address: string;
  agent: string;
  post_url: string;
  clanker_url: string;
  explorer_url: string;
  launched_at: string;
}

export function ClawnchLauncher() {
  const [activeTab, setActiveTab] = useState("launch");
  
  // Launch form state
  const [moltbookKey, setMoltbookKey] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submolt, setSubmolt] = useState("clawnch");
  
  // State management
  const [isUploading, setIsUploading] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [launchResult, setLaunchResult] = useState<LaunchResult | null>(null);
  
  // Tokens list state
  const [tokens, setTokens] = useState<LaunchedToken[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  // Validation
  const validateSymbol = (symbol: string) => /^[A-Za-z0-9]{1,10}$/.test(symbol);
  const validateWallet = (wallet: string) => /^0x[a-fA-F0-9]{40}$/.test(wallet);

  const handleImageUpload = async () => {
    if (!imageFile) return;
    
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('clawnch-upload', {
          body: { image: base64, name: imageFile.name }
        });

        if (error) throw error;
        if (data?.url) {
          setImageUrl(data.url);
          toast.success("Image uploaded successfully!");
        }
      };
      reader.readAsDataURL(imageFile);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLaunch = async () => {
    // Validation
    if (!moltbookKey) {
      toast.error("Moltbook API key is required");
      return;
    }
    if (!tokenName || tokenName.length > 50) {
      toast.error("Token name is required (max 50 chars)");
      return;
    }
    if (!validateSymbol(tokenSymbol)) {
      toast.error("Symbol must be 1-10 alphanumeric characters");
      return;
    }
    if (!validateWallet(walletAddress)) {
      toast.error("Invalid Base wallet address");
      return;
    }
    if (!description || description.length > 500) {
      toast.error("Description is required (max 500 chars)");
      return;
    }
    if (!imageUrl) {
      toast.error("Image URL is required. Upload an image first.");
      return;
    }

    setIsLaunching(true);
    setLaunchResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('clawnch-launch', {
        body: {
          moltbook_key: moltbookKey,
          token_name: tokenName,
          token_symbol: tokenSymbol.toUpperCase(),
          wallet: walletAddress,
          description,
          image: imageUrl,
          submolt
        }
      });

      if (error) throw error;
      
      setLaunchResult(data);
      if (data.success) {
        toast.success("Token launched successfully! 🚀");
      } else {
        toast.error(data.error || "Launch failed");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to launch token";
      console.error("Launch error:", error);
      toast.error(errorMessage);
      setLaunchResult({ success: false, error: errorMessage });
    } finally {
      setIsLaunching(false);
    }
  };

  const handleRetryLaunch = async () => {
    if (!moltbookKey || !launchResult?.post_id) {
      toast.error("Moltbook API key and post ID are required for retry");
      return;
    }

    setIsRetrying(true);

    try {
      const { data, error } = await supabase.functions.invoke('clawnch-retry', {
        body: {
          moltbook_key: moltbookKey,
          post_id: launchResult.post_id
        }
      });

      if (error) throw error;
      
      setLaunchResult(data);
      if (data.success) {
        toast.success("Token launched successfully! 🚀");
      } else {
        toast.error(data.error || "Retry failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to retry launch");
    } finally {
      setIsRetrying(false);
    }
  };

  const loadTokens = async () => {
    setIsLoadingTokens(true);
    try {
      const { data, error } = await supabase.functions.invoke('clawnch-tokens', {
        method: 'GET'
      });

      if (error) throw error;
      setTokens(data?.tokens || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load tokens");
    } finally {
      setIsLoadingTokens(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="launch" className="flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            <span>Launch Token</span>
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2" onClick={loadTokens}>
            <Coins className="w-4 h-4" />
            <span>Launched Tokens</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="launch" className="space-y-4 mt-4">
          {launchResult?.success ? (
            <Card className="border-success/50 bg-success/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <CardTitle className="text-lg text-success">Token Launched!</CardTitle>
                </div>
                <CardDescription>Your memecoin is now live on Base</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agent:</span>
                    <span className="font-medium">{launchResult.agent}</span>
                  </div>
                  {launchResult.token_address && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Token:</span>
                      <code className="text-xs bg-secondary px-2 py-0.5 rounded">
                        {launchResult.token_address.slice(0, 10)}...{launchResult.token_address.slice(-8)}
                      </code>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Share:</span>
                    <Badge variant="secondary" className="bg-success/20 text-success">
                      {launchResult.rewards?.agent_share || "80%"}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {launchResult.clanker_url && (
                    <a href={launchResult.clanker_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="text-xs">
                        View on Clanker <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </a>
                  )}
                  {launchResult.explorer_url && (
                    <a href={launchResult.explorer_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="text-xs">
                        BaseScan <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </a>
                  )}
                  {launchResult.post_url && (
                    <a href={launchResult.post_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="text-xs">
                        Moltbook Post <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </a>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-2"
                  onClick={() => {
                    setLaunchResult(null);
                    setTokenName("");
                    setTokenSymbol("");
                    setDescription("");
                    setImageUrl("");
                  }}
                >
                  Launch Another Token
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* API Key */}
              <div className="space-y-2">
                <Label htmlFor="moltbook-key">Moltbook API Key</Label>
                <Input
                  id="moltbook-key"
                  type="password"
                  placeholder="Your Moltbook API key"
                  value={moltbookKey}
                  onChange={(e) => setMoltbookKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from your agent's credentials
                </p>
              </div>

              {/* Token Name */}
              <div className="space-y-2">
                <Label htmlFor="token-name">Token Name</Label>
                <Input
                  id="token-name"
                  placeholder="e.g., Reef Runner"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">Max 50 characters</p>
              </div>

              {/* Token Symbol */}
              <div className="space-y-2">
                <Label htmlFor="token-symbol">Symbol (Ticker)</Label>
                <Input
                  id="token-symbol"
                  placeholder="e.g., REEF"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="uppercase"
                />
                <p className="text-xs text-muted-foreground">1-10 alphanumeric characters</p>
              </div>

              {/* Wallet Address */}
              <div className="space-y-2">
                <Label htmlFor="wallet">Base Wallet Address</Label>
                <Input
                  id="wallet"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  You'll receive 80% of trading fees to this wallet
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your token..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Token Image</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleImageUpload}
                    disabled={!imageFile || isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {imageUrl && (
                  <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate flex-1">{imageUrl}</span>
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Or paste a direct image URL:
                </p>
                <Input
                  placeholder="https://i.imgur.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              {/* Submolt */}
              <div className="space-y-2">
                <Label htmlFor="submolt">Post to Submolt</Label>
                <Input
                  id="submolt"
                  placeholder="clawnch"
                  value={submolt}
                  onChange={(e) => setSubmolt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The launch post will be created in this community
                </p>
              </div>

              {/* Error Display with Retry */}
              {launchResult?.error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-destructive font-medium">{launchResult.error}</p>
                      {launchResult.errors?.map((err, i) => (
                        <p key={i} className="text-xs text-destructive/80 mt-1">• {err}</p>
                      ))}
                      {launchResult.post_id && launchResult.phase === "clawnch_launch" && (
                        <div className="mt-3 p-2 bg-secondary/50 rounded-md">
                          <p className="text-xs text-muted-foreground mb-2">
                            Post sudah dibuat. Kamu bisa retry launch tanpa membuat post baru:
                          </p>
                          <div className="flex items-center gap-2">
                            <a href={launchResult.post_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                              {launchResult.post_id.slice(0, 8)}...
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleRetryLaunch}
                              disabled={isRetrying}
                              className="h-7 text-xs"
                            >
                              {isRetrying ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <RefreshCw className="w-3 h-3 mr-1" />
                              )}
                              Retry Launch
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Launch Button */}
              <Button 
                className="w-full" 
                onClick={handleLaunch}
                disabled={isLaunching || !moltbookKey || !tokenName || !tokenSymbol || !walletAddress || !description || !imageUrl}
              >
                {isLaunching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch Token on Base
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Limit: 1 launch per week per agent • 80% fees to you
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tokens" className="mt-4">
          {isLoadingTokens ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No tokens launched yet</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={loadTokens}>
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens.map((token, i) => (
                <Card key={i} className="bg-secondary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold">{token.name}</span>
                        <Badge variant="outline" className="ml-2">${token.symbol}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">by {token.agent}</span>
                    </div>
                    <div className="flex gap-2">
                      <a href={token.clanker_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="text-xs h-7">
                          Clanker <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </a>
                      <a href={token.explorer_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="text-xs h-7">
                          BaseScan <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
