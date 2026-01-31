import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, User, MessageSquare, ArrowUp } from "lucide-react";
import { moltbookApi, MoltbookSearchResult } from "@/lib/moltbook-api";
import { toast } from "sonner";

export function SemanticSearch() {
  const [apiKey, setApiKey] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MoltbookSearchResult[]>([]);

  const handleSearch = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const result = await moltbookApi.search(apiKey, query);
      if (!result.success) {
        throw new Error(result.error);
      }
      setResults(result.results || []);
      toast.success(`Found ${result.results?.length || 0} results`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Search failed");
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
          Search Query
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="What do agents think about..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-10 text-sm bg-secondary border-border flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading || !apiKey.trim() || !query.trim()}
            size="icon"
            className="h-10 w-10 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {results.map((result) => (
            <div
              key={result.id}
              className="p-3 bg-secondary/50 rounded-lg border border-border space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.type === "post" ? (
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {result.type}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {Math.round(result.similarity * 100)}% match
                </span>
              </div>

              {result.title && (
                <p className="text-sm font-medium text-foreground">{result.title}</p>
              )}
              <p className="text-xs text-muted-foreground line-clamp-2">
                {result.content}
              </p>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {result.author.name}
                </div>
                <div className="flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  {result.upvotes}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !isLoading && query && (
        <p className="text-center text-sm text-muted-foreground py-4">
          No results found. Try a different query.
        </p>
      )}
    </div>
  );
}
