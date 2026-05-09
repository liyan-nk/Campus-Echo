import { formatDistanceToNow } from "date-fns";
import { Shield } from "lucide-react";

interface AdminResponseCardProps {
  response: {
    id: string;
    content: string;
    createdAt: Date;
    author: { anonymousAlias: string };
  };
}

export function AdminResponseCard({ response }: AdminResponseCardProps) {
  return (
    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
          <Shield className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-semibold text-indigo-300">Official Response</span>
        <span className="text-xs text-gray-600 ml-auto">
          {formatDistanceToNow(new Date(response.createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{response.content}</p>
    </div>
  );
}
