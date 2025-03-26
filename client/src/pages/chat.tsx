import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ChatMessage from "@/components/chat/chat-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch existing messages
  const { data: chatMessages, isLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
  });

  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
    }
  }, [chatMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", { content });
      return await res.json();
    },
    onSuccess: (newMessage: Message) => {
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
    },
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Optimistically add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to API
      sendMessageMutation.mutate(message);
    }
  };

  const handleResetConversation = async () => {
    try {
      await apiRequest("POST", "/api/messages/reset");
      setMessages([]);
    } catch (error) {
      console.error("Failed to reset conversation:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-neutral-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">Chat with Rashed</h1>
            <p className="text-neutral-500 text-sm">Ask me to write code, deploy projects, or integrate services</p>
          </div>
          <div>
            <Button variant="ghost" size="icon" onClick={handleResetConversation}>
              <i className="ri-delete-bin-line text-neutral-500"></i>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-4">
              <i className="ri-robot-line text-2xl text-primary"></i>
            </div>
            <h2 className="text-xl font-semibold mb-2">Start a conversation with Rashed</h2>
            <p className="text-neutral-500 max-w-md mb-6">
              Ask me anything about coding, project deployments, or integrations. I can write code, explain concepts, and help with your development tasks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg">
              <div className="bg-white p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                "Create a React component for a product card"
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                "Help me integrate with the OpenAI API"
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                "Write an Express API endpoint for user authentication"
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                "How do I deploy my app to AWS?"
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-neutral-200 p-4 bg-white">
        <form onSubmit={handleSendMessage}>
          <div className="flex items-center space-x-2">
            <Textarea 
              ref={textareaRef}
              className="flex-1 min-h-[50px] max-h-[200px] resize-none"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button 
              type="submit" 
              className="p-3 rounded-lg"
              disabled={sendMessageMutation.isPending || !message.trim()}
            >
              <i className="ri-send-plane-fill"></i>
            </Button>
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center space-x-4 flex-wrap">
            <Button variant="link" size="sm" className="h-auto p-0 flex items-center">
              <i className="ri-file-upload-line mr-1"></i>
              <span>Upload file</span>
            </Button>
            <Button variant="link" size="sm" className="h-auto p-0 flex items-center">
              <i className="ri-code-line mr-1"></i>
              <span>Format as code</span>
            </Button>
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 flex items-center"
              onClick={handleResetConversation}
            >
              <i className="ri-arrow-go-back-line mr-1"></i>
              <span>Reset conversation</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
