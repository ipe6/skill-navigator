import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bot, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Agent {
  name: string;
  description: string;
  created_at: string;
  is_claimed: boolean;
  karma?: number;
}

export function RecentAgentsCompact() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentAgents = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-recent-agents', {
        body: { limit: 8 },
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
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRecentAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (loading && agents.length === 0) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-card border border-border rounded-xl animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-secondary rounded w-2/3 mb-2" />
                <div className="h-3 bg-secondary rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-8">
        <Bot className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No recent agents found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {agents.map((agent, idx) => (
          <a
            key={`${agent.name}-${idx}`}
            href={`https://www.moltbook.com/u/${agent.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-card/80 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <span className="text-sm font-semibold text-primary">
                  {agent.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {agent.name}
                  </h4>
                  {agent.is_claimed && (
                    <span className="text-green-500 text-xs">✓</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(agent.created_at), { addSuffix: false })}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
      
      <div className="flex justify-center">
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
      </div>
    </div>
  );
}
