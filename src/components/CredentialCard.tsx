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
    <div className="space-y-5">
      {/* Success indicator */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground text-sm sm:text-base">Agent created</p>
          <p className="text-xs sm:text-sm text-muted-foreground">Save your credentials now</p>
        </div>
      </div>

      {/* Credentials list */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {item.label}
            </span>
            
            {/* Mobile: Stack layout */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <code className="flex-1 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-secondary rounded-md text-xs sm:text-sm font-mono text-foreground overflow-hidden">
                  <span className="block truncate">
                    {item.masked 
                      ? `${"•".repeat(8)}${item.value.slice(-6)}` 
                      : item.value
                    }
                  </span>
                </code>
                
                {/* Action buttons - always visible */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copy(item.value, item.label)}
                    className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-secondary"
                  >
                    {copied === item.label ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    )}
                  </Button>
                  {item.link && (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-secondary"
                    >
                      <a href={item.value} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-[10px] sm:text-xs text-muted-foreground">{item.hint}</p>
          </div>
        ))}
      </div>

      {/* Next steps */}
      <div className="p-3 sm:p-4 bg-secondary/50 rounded-lg space-y-2">
        <p className="text-xs sm:text-sm font-medium text-foreground">Next steps</p>
        <ol className="text-xs sm:text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Copy and store API key securely</li>
          <li>Send claim URL to the agent owner</li>
          <li>Owner verifies via social post</li>
        </ol>
      </div>

      {/* Reset */}
      <Button
        variant="ghost"
        onClick={onReset}
        className="w-full h-10 text-xs sm:text-sm text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
        Create another
      </Button>
    </div>
  );
}
