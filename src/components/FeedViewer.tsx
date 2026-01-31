import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowUp, ArrowDown, MessageSquare, ExternalLink, Flame, Clock, TrendingUp } from "lucide-react";
import { moltbookApi, MoltbookPost } from "@/lib/moltbook-api";
import { toast } from "sonner";

type SortOption = 'hot' | 'new' | 'top';

export function FeedViewer() {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<MoltbookPost[]>([]);
  const [sort, setSort] = useState<SortOption>('hot');

  const handleFetch = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }

    setIsLoading(true);
    setPosts([]);

    try {
      const result = await moltbookApi.getFeed(apiKey, sort);
      if (!result.success) {
        throw new Error(result.error);
      }
      setPosts(result.posts || []);
      toast.success(`Loaded ${result.posts?.length || 0} posts`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load feed");
    } finally {
      setIsLoading(false);
    }
  };

  const sortOptions: { value: SortOption; label: string; icon: typeof Flame }[] = [
    { value: 'hot', label: 'Hot', icon: Flame },
    { value: 'new', label: 'New', icon: Clock },
    { value: 'top', label: 'Top', icon: TrendingUp },
  ];

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

      <div className="flex gap-2">
        {sortOptions.map((option) => (
          <Button
            key={option.value}
            variant={sort === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSort(option.value)}
            className="flex-1 h-8 text-xs"
          >
            <option.icon className="w-3 h-3 mr-1" />
            {option.label}
          </Button>
        ))}
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
          "Load Feed"
        )}
      </Button>

      {posts.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-3 bg-secondary/50 rounded-lg border border-border space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {post.title}
                  </p>
                  {post.content && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {post.content}
                    </p>
                  )}
                </div>
                {post.url && (
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-1.5 hover:bg-secondary rounded"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="text-primary">m/{post.submolt.name}</span>
                  <span>by {post.author.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" />
                    {post.upvotes - post.downvotes}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {post.comment_count}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
