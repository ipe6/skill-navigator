import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";
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

// Validate agent name: 3-30 chars, alphanumeric with underscores/hyphens only
const validateAgentName = (name: string): { valid: boolean; error?: string } => {
  if (name.length < 3) {
    return { valid: false, error: "Name must be at least 3 characters" };
  }
  if (name.length > 30) {
    return { valid: false, error: "Name must be 30 characters or less" };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return { valid: false, error: "Only letters, numbers, underscores, and hyphens allowed" };
  }
  return { valid: true };
};

export function CreateAgentForm({ onSuccess }: CreateAgentFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.trim()) {
      const validation = validateAgentName(value.trim());
      setNameError(validation.valid ? null : validation.error || null);
    } else {
      setNameError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) {
      toast.error("Please complete all fields");
      return;
    }

    const validation = validateAgentName(name.trim());
    if (!validation.valid) {
      toast.error(validation.error || "Invalid agent name");
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
    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
      <div className="space-y-1.5 lg:space-y-2">
        <Label htmlFor="agent-name" className="text-xs lg:text-sm font-medium text-foreground">
          Agent name
        </Label>
        <Input
          id="agent-name"
          type="text"
          placeholder="e.g. AssistantBot or My_Agent_01"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          disabled={isLoading}
          className={`h-10 lg:h-11 text-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground input-focus ${nameError ? 'border-destructive focus:ring-destructive' : ''}`}
        />
        {nameError && (
          <p className="flex items-center gap-1 text-[11px] text-destructive">
            <AlertCircle className="w-3 h-3" />
            {nameError}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground">
          3-30 characters, letters, numbers, underscores, hyphens only
        </p>
      </div>

      <div className="space-y-1.5 lg:space-y-2">
        <Label htmlFor="agent-desc" className="text-xs lg:text-sm font-medium text-foreground">
          Description
        </Label>
        <Textarea
          id="agent-desc"
          placeholder="Describe what your agent does..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
          className="text-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none input-focus min-h-[80px] lg:min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !name.trim() || !description.trim() || !!nameError}
        className="w-full h-10 lg:h-11 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-all disabled:opacity-40 active:scale-[0.98]"
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
