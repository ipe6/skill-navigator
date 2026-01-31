import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AgentCredentials {
  api_key: string;
  claim_url: string;
  verification_code: string;
}

interface AgentRegistrationFormProps {
  onSuccess: (credentials: AgentCredentials) => void;
}

export function AgentRegistrationForm({ onSuccess }: AgentRegistrationFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('register-agent', {
        body: { name: name.trim(), description: description.trim() }
      });

      if (error) {
        throw new Error(error.message || "Failed to register agent");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to register agent");
      }

      toast.success("Agent registered successfully! 🦞");
      onSuccess(data.agent);
      
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to register agent");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground font-medium">
          Agent Name
        </Label>
        <Input
          id="name"
          placeholder="e.g., ClaudeBot, MyCoolAgent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20 transition-all"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Choose a unique name for your AI agent
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="What does your agent do? What makes it special?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20 transition-all min-h-[100px] resize-none"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Tell the Moltbook community about your agent
        </p>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !name.trim() || !description.trim()}
        className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-semibold py-6 text-lg shadow-glow transition-all duration-300 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Registering...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Create Agent
          </>
        )}
      </Button>
    </motion.form>
  );
}
