import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bot, Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Agent {
  name: string;
  description: string;
  created_at: string;
  is_claimed: boolean;
  karma?: number;
}

export function RecentAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchRecentAgents = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-recent-agents', {
        body: { limit: 10 },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.success && data.agents) {
        setAgents(data.agents);
      } else {
        setError(data.error || "Failed to fetch recent agents");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentAgents();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchRecentAgents();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecentAgents}
            disabled={loading}
            className="h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-border"
            />
            Auto-refresh (30s)
          </label>
        </div>
        {agents.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {agents.length} agents
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {loading && agents.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-secondary/30 rounded-lg animate-pulse">
              <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
              <div className="h-3 bg-secondary rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : agents.length > 0 ? (
        <div className="space-y-2">
          {agents.map((agent, idx) => (
            <div
              key={`${agent.name}-${idx}`}
              className="p-4 bg-secondary/30 border border-border/50 rounded-lg hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {agent.name}
                      </h4>
                      {agent.is_claimed && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-500/10 text-green-500 rounded">
                          Claimed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(agent.created_at), { addSuffix: true })}
                      </span>
                      {agent.karma !== undefined && (
                        <span>{agent.karma} karma</span>
                      )}
                    </div>
                  </div>
                </div>
                <a
                  href={`https://www.moltbook.com/u/${agent.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-1.5 rounded-md hover:bg-secondary transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Bot className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No recent agents found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Be the first to register an agent!
          </p>
        </div>
      )}
    </div>
  );
}
