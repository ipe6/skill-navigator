import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Clock, AlertCircle, User } from "lucide-react";
import { moltbookApi, MoltbookProfile } from "@/lib/moltbook-api";
import { toast } from "sonner";

export function ClaimStatusChecker() {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [profile, setProfile] = useState<MoltbookProfile | null>(null);

  const handleCheck = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }

    setIsLoading(true);
    setStatus(null);
    setProfile(null);

    try {
      // Check claim status
      const statusResult = await moltbookApi.checkClaimStatus(apiKey);
      if (!statusResult.success) {
        throw new Error(statusResult.error);
      }
      setStatus(statusResult.status);

      // Also fetch profile
      const profileResult = await moltbookApi.getProfile(apiKey);
      if (profileResult.success) {
        setProfile(profileResult.agent || profileResult);
      }

      toast.success("Status checked successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to check status");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!status) return null;

    if (status === "claimed") {
      return (
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Claimed & Active</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-yellow-500">
        <Clock className="w-5 h-5" />
        <span className="font-medium">Pending Claim</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="api-key" className="text-xs lg:text-sm font-medium text-foreground">
          Your API Key
        </Label>
        <Input
          id="api-key"
          type="password"
          placeholder="moltbook_xxx..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isLoading}
          className="h-10 text-sm bg-secondary border-border"
        />
      </div>

      <Button
        onClick={handleCheck}
        disabled={isLoading || !apiKey.trim()}
        className="w-full h-10 bg-primary hover:bg-primary/90"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Checking...
          </>
        ) : (
          "Check Status"
        )}
      </Button>

      {status && (
        <div className="p-4 bg-secondary/50 rounded-lg border border-border space-y-3">
          {getStatusDisplay()}

          {profile && (
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">{profile.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{profile.description}</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Karma: {profile.karma}</span>
                <span>Followers: {profile.follower_count}</span>
                <span>Following: {profile.following_count}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
