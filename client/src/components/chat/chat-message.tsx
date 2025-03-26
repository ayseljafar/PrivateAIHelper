import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState<string | null>(null);
  
  // Function to detect if content has code blocks
  const hasCodeBlock = (content: string): boolean => {
    return content.includes("```");
  };

  // Function to format code blocks with syntax highlighting
  const formatContent = (content: string): React.ReactNode => {
    if (!hasCodeBlock(content)) {
      return <p className="text-neutral-800">{content}</p>;
    }

    // Split on code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith("```") && part.endsWith("```")) {
            // Extract language if specified (e.g., ```javascript)
            let language = "plain";
            let code = part.slice(3, -3);
            const firstLineBreak = code.indexOf("\n");
            
            if (firstLineBreak > 0) {
              const possibleLang = code.substring(0, firstLineBreak).trim();
              if (possibleLang && !possibleLang.includes(" ")) {
                language = possibleLang;
                code = code.substring(firstLineBreak + 1);
              }
            }

            // Extract filename if present in a comment at top of code block
            let filename = "";
            const filenameMatch = code.match(/^\s*(?:\/\/|#|<!--)\s*(.+?\.[\w]+)\s*(?:-->)?\s*\n/);
            if (filenameMatch) {
              filename = filenameMatch[1];
              code = code.replace(filenameMatch[0], '');
            }

            const handleCopyCode = () => {
              navigator.clipboard.writeText(code);
              setCopied(`code-${index}`);
              setTimeout(() => setCopied(null), 2000);
            };

            return (
              <div key={index} className="bg-neutral-800 rounded-md overflow-hidden my-3">
                <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700">
                  <span className="text-neutral-400 text-sm">
                    {filename || language}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-neutral-400 hover:text-white transition-colors h-8 w-8 p-0"
                    onClick={handleCopyCode}
                  >
                    {copied === `code-${index}` ? 
                      <i className="ri-check-line"></i> : 
                      <i className="ri-clipboard-line"></i>
                    }
                  </Button>
                </div>
                <pre className="p-4 overflow-x-auto text-neutral-200 text-sm font-mono code-editor scrollbar-thin">
                  {code}
                </pre>
              </div>
            );
          } else {
            return part && <p key={index} className="text-neutral-800 mb-3">{part}</p>;
          }
        })}
      </>
    );
  };

  const formattedTimestamp = message.timestamp ? 
    format(new Date(message.timestamp), 'p') : 
    '';

  return (
    <div className="flex items-start space-x-3">
      {message.role === "user" ? (
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
          <i className="ri-user-line"></i>
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
          R
        </div>
      )}
      
      <div className={cn(
        "rounded-lg p-3 max-w-[80%]",
        message.role === "user" 
          ? "bg-neutral-100" 
          : "bg-white shadow-sm border border-neutral-200"
      )}>
        {formatContent(message.content)}
        
        {formattedTimestamp && (
          <div className="text-xs text-neutral-400 mt-2 text-right">
            {formattedTimestamp}
          </div>
        )}
      </div>
    </div>
  );
}
