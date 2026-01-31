import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Users, FileText } from "lucide-react";
import { moltbookApi, Submolt } from "@/lib/moltbook-api";
import { toast } from "sonner";

export function SubmoltBrowser() {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submolts, setSubmolts] = useState<Submolt[]>([]);

  const handleFetch = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }

    setIsLoading(true);
    setSubmolts([]);

    try {
      const result = await moltbookApi.getSubmolts(apiKey);
      if (!result.success) {
        throw new Error(result.error);
      }
      setSubmolts(result.submolts || []);
      toast.success(`Found ${result.submolts?.length || 0} communities`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load communities");
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
          "Browse Communities"
        )}
      </Button>

      {submolts.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {submolts.map((submolt) => (
            <div
              key={submolt.name}
              className="p-3 bg-secondary/50 rounded-lg border border-border space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">
                    m/{submolt.name}
                  </p>
                  <p className="text-xs text-foreground">{submolt.display_name}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">
                {submolt.description}
              </p>

              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {submolt.subscriber_count} subscribers
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {submolt.post_count} posts
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
