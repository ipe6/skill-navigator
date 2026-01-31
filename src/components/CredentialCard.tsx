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
      hint: "Store securely",
    },
    {
      label: "Claim URL",
      value: credentials.claim_url,
      link: true,
      hint: "Share to verify",
    },
    {
      label: "Code",
      value: credentials.verification_code,
      hint: "Human-readable",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Success indicator - Mobile optimized */}
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground text-sm lg:text-base">Agent created</p>
          <p className="text-xs text-muted-foreground">Save credentials now</p>
        </div>
      </div>

      {/* Credentials list - Compact for mobile */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] lg:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {item.label}
              </span>
              <span className="text-[10px] text-muted-foreground/70">{item.hint}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <code className="flex-1 px-2 lg:px-3 py-2 lg:py-2.5 bg-secondary rounded-md text-[11px] lg:text-sm font-mono text-foreground overflow-hidden">
                <span className="block truncate">
                  {item.masked 
                    ? `${"•".repeat(6)}${item.value.slice(-4)}` 
                    : item.value
                  }
                </span>
              </code>
              
              {/* Action buttons - Touch-friendly sizes */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copy(item.value, item.label)}
                className="h-8 w-8 lg:h-9 lg:w-9 shrink-0 hover:bg-secondary active:scale-95 transition-transform"
              >
                {copied === item.label ? (
                  <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" />
                ) : (
                  <Copy className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-muted-foreground" />
                )}
              </Button>
              {item.link && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-8 w-8 lg:h-9 lg:w-9 shrink-0 hover:bg-secondary active:scale-95 transition-transform"
                >
                  <a href={item.value} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-muted-foreground" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Next steps - Collapsible on mobile */}
      <div className="p-3 lg:p-4 bg-secondary/30 rounded-lg border border-border/50">
        <p className="text-xs lg:text-sm font-medium text-foreground mb-2">Next steps</p>
        <ol className="text-[11px] lg:text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Copy API key securely</li>
          <li>Share claim URL with owner</li>
          <li>Verify via social post</li>
        </ol>
      </div>

      {/* Reset button */}
      <Button
        variant="ghost"
        onClick={onReset}
        className="w-full h-9 lg:h-10 text-xs text-muted-foreground hover:text-foreground active:scale-[0.98] transition-transform"
      >
        <RotateCcw className="w-3.5 h-3.5 mr-2" />
        Create another
      </Button>
    </div>
  );
}
