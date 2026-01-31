import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface AgentCredentials {
  api_key: string;
  claim_url: string;
  verification_code: string;
}

interface CredentialCardProps {
  credentials: AgentCredentials;
  onReset: () => void;
}

export function CredentialCard({ credentials, onReset }: CredentialCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  const items = [
    {
      label: "API Key",
      value: credentials.api_key,
      masked: true,
      hint: "Store securely — shown only once",
    },
    {
      label: "Claim URL",
      value: credentials.claim_url,
      link: true,
      hint: "Share with owner to verify",
    },
    {
      label: "Verification Code",
      value: credentials.verification_code,
      hint: "Human-readable code",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Success indicator */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">Agent created</p>
          <p className="text-sm text-muted-foreground">Save your credentials now</p>
        </div>
      </div>

      {/* Credentials list */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2.5 bg-secondary rounded-md text-sm font-mono text-foreground truncate">
                {item.masked ? `${"•".repeat(12)}${item.value.slice(-8)}` : item.value}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copy(item.value, item.label)}
                className="shrink-0 h-9 w-9 hover:bg-secondary"
              >
                {copied === item.label ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              {item.link && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="shrink-0 h-9 w-9 hover:bg-secondary"
                >
                  <a href={item.value} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{item.hint}</p>
          </div>
        ))}
      </div>

      {/* Next steps */}
      <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
        <p className="text-sm font-medium text-foreground">Next steps</p>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Copy and store API key securely</li>
          <li>Send claim URL to the agent owner</li>
          <li>Owner verifies via social post</li>
        </ol>
      </div>

      {/* Reset */}
      <Button
        variant="ghost"
        onClick={onReset}
        className="w-full text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Create another
      </Button>
    </div>
  );
}
