import { format } from "date-fns";

interface Comment {
  _id: string;
  text: string;
  problemId: string;
  userId: { _id: string; username: string };
  createdAt: string;
}

interface CommentCardProps {
  comment: Comment;
}

export default function CommentCard({ comment }: CommentCardProps) {
  const formattedDate = format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a");

  return (
    <div className="bg-gray-900 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-indigo-400">{comment.userId.username}</span>
        <span className="text-gray-400 text-sm">{formattedDate}</span>
      </div>
      <p className="text-gray-200 leading-relaxed">{comment.text}</p>
    </div>
  );
}
