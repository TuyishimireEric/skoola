"use client";

import React, { useState } from "react";
import { Users, Send, MessageSquare, Loader2 } from "lucide-react";
import {
    useRecommendations,
    useCreateRecommendation,
    useCreateReplyMutation,
    Recommendation,
} from "@/hooks/recommendations/useStudentRecommendations";
import { getInitials, getTimeAgo } from "@/utils/functions";

interface StudentRecommendationsProps {
    studentId: string;
}

const StudentRecommendations: React.FC<StudentRecommendationsProps> = ({
    studentId,
}) => {
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");

    const { data: recommendations, isLoading } = useRecommendations(studentId);
    const createRecommendation = useCreateRecommendation(studentId);
    const createReply = useCreateReplyMutation(studentId);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;

        await createRecommendation.mutateAsync(newComment);
        setNewComment("");
    };

    const handlePostReply = async (recommendationId: string) => {
        if (!replyContent.trim()) return;

        await createReply.mutateAsync({
            recommendationId,
            content: replyContent,
        });

        setReplyContent("");
        setReplyingTo(null);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            {/* ... rest of your component stays the same ... */}
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                        Recommendations & Comments
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                        Teachers and parents can share feedback and recommendations
                    </p>
                </div>
            </div>

            {/* New Comment Input */}
            <div className="mb-4 sm:mb-6">
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your feedback, recommendations, or observations about the student..."
                        className="w-full min-h-[80px] sm:min-h-[100px] p-2 sm:p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3">
                        <p className="text-xs text-gray-500 text-center sm:text-left">
                            Your comment will be visible to teachers and parents
                        </p>
                        <button
                            onClick={handlePostComment}
                            disabled={!newComment.trim() || createRecommendation.isPending}
                            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm w-full sm:w-auto justify-center"
                        >
                            {createRecommendation.isPending ? (
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                            ) : (
                                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                            Post Comment
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 sm:space-y-4">
                {!recommendations || recommendations.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                        <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                        <p className="text-gray-500 text-xs sm:text-sm">
                            No recommendations yet. Be the first to share feedback!
                        </p>
                    </div>
                ) : (
                    recommendations.map((rec: Recommendation) => (
                        <div
                            key={rec.id}
                            className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start gap-2 sm:gap-3">
                                {rec.author.avatar ? (
                                    <img
                                        src={rec.author.avatar}
                                        alt={rec.author.name}
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                                        {getInitials(rec.author.name)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                        <h4 className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                                            {rec.author.name}
                                        </h4>
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <span className="text-xs text-gray-500 hidden xs:inline">
                                                • {rec.author.role}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                • {getTimeAgo(rec.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">
                                        {rec.content}
                                    </p>

                                    {/* Replies */}
                                    {rec.replies && rec.replies.length > 0 && (
                                        <div className="space-y-2 sm:space-y-3 ml-2 sm:ml-4 border-l-2 border-gray-200 pl-2 sm:pl-4 mb-2 sm:mb-3">
                                            {rec.replies.map((reply) => (
                                                <div key={reply.id} className="flex items-start gap-2">
                                                    {reply.author.avatar ? (
                                                        <img
                                                            src={reply.author.avatar}
                                                            alt={reply.author.name}
                                                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                            {getInitials(reply.author.name)}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                                            <h5 className="font-medium text-xs text-gray-900 truncate">
                                                                {reply.author.name}
                                                            </h5>
                                                            <div className="flex items-center gap-1 sm:gap-2">
                                                                <span className="text-xs text-gray-500 hidden xs:inline">
                                                                    • {reply.author.role}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    • {getTimeAgo(reply.createdAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-gray-700">
                                                            {reply.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Input */}
                                    {replyingTo === rec.id ? (
                                        <div className="ml-2 sm:ml-4 mt-2 sm:mt-3">
                                            <textarea
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="Write your reply..."
                                                className="w-full min-h-[60px] sm:min-h-[80px] p-2 border border-gray-300 rounded-lg resize-none text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => handlePostReply(rec.id)}
                                                    disabled={!replyContent.trim() || createReply.isPending}
                                                    className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                >
                                                    {createReply.isPending ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Send className="w-3 h-3" />
                                                    )}
                                                    Reply
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(null);
                                                        setReplyContent("");
                                                    }}
                                                    className="px-2 sm:px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setReplyingTo(rec.id)}
                                            className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium"
                                        >
                                            Reply
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentRecommendations;