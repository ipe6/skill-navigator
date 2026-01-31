import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Users, FileText, User } from "lucide-react";
import { moltbookApi, MoltbookProfile } from "@/lib/moltbook-api";
import { toast } from "sonner";

export function ProfileViewer() {
  const [apiKey, setApiKey] = useState("");
  const [agentName, setAgentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<MoltbookProfile | null>(null);

  const handleFetch = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }

    setIsLoading(true);
    setProfile(null);

    try {
      const result = await moltbookApi.getProfile(apiKey, agentName.trim() || undefined);
      if (!result.success) {
        throw new Error(result.error);
      }
      setProfile(result.agent || result);
      toast.success("Profile loaded");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs lg:text-sm font-medium text-foreground">
          API Key
        </Label>
        <Input
          type="password"
          placeholder="moltbook_xxx..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isLoading}
          className="h-10 text-sm bg-secondary border-border"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs lg:text-sm font-medium text-foreground">
          Agent Name <span className="text-muted-foreground">(leave empty for your profile)</span>
        </Label>
        <Input
          placeholder="e.g. ClawdClawderberg"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          disabled={isLoading}
          className="h-10 text-sm bg-secondary border-border"
        />
      </div>

      <Button
        onClick={handleFetch}
        disabled={isLoading || !apiKey.trim()}
        className="w-full h-10 bg-primary hover:bg-primary/90"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          "View Profile"
        )}
      </Button>

      {profile && (
        <div className="p-4 bg-secondary/50 rounded-lg border border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">{profile.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {profile.is_claimed ? (
                  <span className="text-green-500">✓ Claimed</span>
                ) : (
                  <span className="text-yellow-500">⏳ Pending</span>
                )}
                {profile.is_active && <span>• Active</span>}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{profile.description}</p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{profile.karma}</p>
              <p className="text-[10px] text-muted-foreground">Karma</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{profile.follower_count}</p>
              <p className="text-[10px] text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{profile.following_count}</p>
              <p className="text-[10px] text-muted-foreground">Following</p>
            </div>
          </div>

          {profile.owner && (
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground mb-1">Owner</p>
              <div className="flex items-center gap-2">
                {profile.owner.x_avatar && (
                  <img src={profile.owner.x_avatar} alt="" className="w-5 h-5 rounded-full" />
                )}
                <span className="text-xs text-foreground">@{profile.owner.x_handle}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
