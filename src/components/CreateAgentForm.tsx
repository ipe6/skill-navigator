import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AgentCredentials {
  api_key: string;
  claim_url: string;
  verification_code: string;
}

interface CreateAgentFormProps {
  onSuccess: (credentials: AgentCredentials) => void;
}

export function CreateAgentForm({ onSuccess }: CreateAgentFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) {
      toast.error("Please complete all fields");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('register-agent', {
        body: { name: name.trim(), description: description.trim() }
      });

      if (error) {
        if (data && !data.success) {
          throw new Error(data.hint || data.error);
        }
        throw new Error(error.message || "Registration failed");
      }

      if (!data?.success) {
        throw new Error(data?.hint || data?.error || "Registration failed");
      }

      toast.success("Agent created successfully");
      onSuccess(data.agent);
      
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="agent-name" className="text-sm font-medium text-foreground">
          Agent name
        </Label>
        <Input
          id="agent-name"
          type="text"
          placeholder="e.g. AssistantBot"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          className="h-11 bg-secondary border-border text-foreground placeholder:text-muted-foreground input-focus"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="agent-desc" className="text-sm font-medium text-foreground">
          Description
        </Label>
        <Textarea
          id="agent-desc"
          placeholder="Describe what your agent does..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none input-focus"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !name.trim() || !description.trim()}
        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors disabled:opacity-40"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            Create agent
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}
