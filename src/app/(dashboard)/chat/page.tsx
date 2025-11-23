// @/app/(dashboard)/chat/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    MessageCircle,
    Send,
    Search,
    Plus,
    MoreVertical,
    Smile,
    Paperclip,
    X,
    Check,
    CheckCheck,
    Edit2,
    Trash2,
    Reply,
    Users,
    Loader2,
} from "lucide-react";
import {
    useConversations,
    useCreateConversation,
} from "@/hooks/chat/useConversations";
import {
    useMessages,
    useSendMessage,
    useMarkAsRead,
    useDeleteMessage,
    useUpdateMessage,
    useAddReaction,
} from "@/hooks/chat/useMessages";
import { useClientSession } from "@/hooks/user/useClientSession";
import TopMenu from "@/components/menu/TopMenu";
import { MessageDataI, ConversationDataI } from "@/types/Chat";

const ChatPage: React.FC = () => {
    const { userId, isLoading: sessionLoading } = useClientSession();
    const [selectedConversation, setSelectedConversation] =
        useState<ConversationDataI | null>(null);
    const [messageText, setMessageText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState("");
    const [replyingTo, setReplyingTo] = useState<MessageDataI | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLTextAreaElement>(null);

    // Queries - Use isLoading for initial load, isFetching for background updates
    const { 
        data: conversations, 
        isLoading: conversationsLoading,
        isFetching: conversationsFetching 
    } = useConversations();
    
    const { 
        data: messages, 
        isLoading: messagesLoading,
        isFetching: messagesFetching 
    } = useMessages(selectedConversation?.Id || null);

    // Mutations
    const sendMessageMutation = useSendMessage();
    const markAsReadMutation = useMarkAsRead();
    const deleteMessageMutation = useDeleteMessage();
    const updateMessageMutation = useUpdateMessage();
    const addReactionMutation = useAddReaction();

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Mark messages as read when conversation is selected
    useEffect(() => {
        if (selectedConversation?.Id && selectedConversation.unreadCount! > 0) {
            markAsReadMutation.mutate(selectedConversation.Id);
        }
    }, [selectedConversation?.Id]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedConversation) return;

        try {
            await sendMessageMutation.mutateAsync({
                ConversationId: selectedConversation.Id,
                Content: messageText,
                ReplyToId: replyingTo?.Id,
            });

            setMessageText("");
            setReplyingTo(null);
            messageInputRef.current?.focus();
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleUpdateMessage = async (messageId: string, content: string) => {
        try {
            await updateMessageMutation.mutateAsync({
                messageId,
                content,
            });
            setEditingMessageId(null);
            setEditingContent("");
        } catch (error) {
            console.error("Failed to update message:", error);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;

        try {
            await deleteMessageMutation.mutate(messageId);
        } catch (error) {
            console.error("Failed to delete message:", error);
        }
    };

    const handleAddReaction = async (messageId: string, emoji: string) => {
        try {
            await addReactionMutation.mutateAsync({ messageId, emoji });
            setShowEmojiPicker(null);
        } catch (error) {
            console.error("Failed to add reaction:", error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const formatMessageTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const filteredConversations = conversations?.filter((conv) =>
        conv.Name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const commonEmojis = ["👍", "❤️", "😊", "😂", "🎉", "🔥", "👏", "✅"];

    // Show full loading only on initial session load
    if (sessionLoading) {
        return (
            <div className="flex flex-col h-full">
                <TopMenu
                    title="Messages"
                    subTitle="Chat with teachers, students, and parents"
                    searchInput={false}
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading messages...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <TopMenu
                title="Messages"
                subTitle="Chat with teachers, students, and parents"
                searchInput={false}
            />

            <div className="flex-1 flex overflow-hidden">
                {/* Conversations Sidebar */}
                <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
                    {/* Search and New Chat */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <button
                                onClick={() => setShowNewChatModal(true)}
                                className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Show loading only on initial load */}
                        {conversationsLoading && !conversations ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                            </div>
                        ) : filteredConversations?.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No conversations yet</p>
                                <button
                                    onClick={() => setShowNewChatModal(true)}
                                    className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    Start a conversation
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {/* Show subtle loading indicator during background refresh */}
                                {conversationsFetching && conversations && (
                                    <div className="px-4 py-2 bg-green-50 border-b border-green-100">
                                        <div className="flex items-center gap-2 text-xs text-green-600">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            <span>Updating...</span>
                                        </div>
                                    </div>
                                )}
                                {filteredConversations?.map((conversation) => (
                                    <button
                                        key={conversation.Id}
                                        onClick={() => setSelectedConversation(conversation)}
                                        className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                                            selectedConversation?.Id === conversation.Id
                                                ? "bg-green-50 border-r-4 border-green-500"
                                                : ""
                                        }`}
                                    >
                                        {/* Avatar */}
                                        {conversation.ImageUrl ? (
                                            <img
                                                src={conversation.ImageUrl}
                                                alt={conversation.Name || ""}
                                                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {conversation.Type === "group" ? (
                                                    <Users className="w-6 h-6" />
                                                ) : (
                                                    getInitials(conversation.Name || "U")
                                                )}
                                            </div>
                                        )}

                                        {/* Conversation Info */}
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3
                                                    className={`font-semibold text-sm truncate ${
                                                        conversation.unreadCount! > 0
                                                            ? "text-gray-900"
                                                            : "text-gray-700"
                                                    }`}
                                                >
                                                    {conversation.Name}
                                                </h3>
                                                {conversation.LastMessageAt && (
                                                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                        {formatTime(conversation.LastMessageAt)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-600 truncate flex-1">
                                                    {conversation.lastMessage?.Content ||
                                                        "No messages yet"}
                                                </p>
                                                {conversation.unreadCount! > 0 && (
                                                    <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                                                        {conversation.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-gray-50">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {selectedConversation.ImageUrl ? (
                                        <img
                                            src={selectedConversation.ImageUrl}
                                            alt={selectedConversation.Name || ""}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                                            {selectedConversation.Type === "group" ? (
                                                <Users className="w-5 h-5" />
                                            ) : (
                                                getInitials(selectedConversation.Name || "U")
                                            )}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="font-bold text-gray-900">
                                            {selectedConversation.Name}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-gray-500">
                                                {selectedConversation.Type === "group"
                                                    ? `${selectedConversation.participants?.length || 0} participants`
                                                    : "Active now"}
                                            </p>
                                            {/* Show subtle loading indicator during message refresh */}
                                            {messagesFetching && messages && (
                                                <Loader2 className="w-3 h-3 text-green-500 animate-spin" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Show loading only on initial load */}
                                {messagesLoading && !messages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                                    </div>
                                ) : messages?.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-sm text-gray-500">
                                                No messages yet. Start the conversation!
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {messages
                                            ?.slice()
                                            .reverse()
                                            .map((message) => {
                                                const isOwnMessage = message.SenderId === userId;

                                                return (
                                                    <div
                                                        key={message.Id}
                                                        className={`flex ${
                                                            isOwnMessage ? "justify-end" : "justify-start"
                                                        } group`}
                                                    >
                                                        <div
                                                            className={`flex gap-2 max-w-[70%] ${
                                                                isOwnMessage ? "flex-row-reverse" : "flex-row"
                                                            }`}
                                                        >
                                                            {/* Avatar */}
                                                            {!isOwnMessage && (
                                                                <div className="flex-shrink-0">
                                                                    {message.senderAvatar ? (
                                                                        <img
                                                                            src={message.senderAvatar}
                                                                            alt={message.senderName || ""}
                                                                            className="w-8 h-8 rounded-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                                                                            {getInitials(message.senderName || "U")}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Message Content */}
                                                            <div className="flex flex-col">
                                                                {!isOwnMessage && (
                                                                    <span className="text-xs text-gray-600 mb-1 px-1">
                                                                        {message.senderName}
                                                                    </span>
                                                                )}

                                                                {/* Reply Preview */}
                                                                {message.replyToMessage && (
                                                                    <div className="mb-1 px-3 py-2 bg-gray-100 rounded-lg text-xs border-l-2 border-green-500">
                                                                        <p className="font-medium text-gray-700">
                                                                            {message.replyToMessage.senderName}
                                                                        </p>
                                                                        <p className="text-gray-600 truncate">
                                                                            {message.replyToMessage.Content}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {editingMessageId === message.Id ? (
                                                                    // Edit Mode
                                                                    <div className="flex flex-col gap-2">
                                                                        <textarea
                                                                            value={editingContent}
                                                                            onChange={(e) =>
                                                                                setEditingContent(e.target.value)
                                                                            }
                                                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                                                            rows={2}
                                                                        />
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleUpdateMessage(
                                                                                        message.Id,
                                                                                        editingContent
                                                                                    )
                                                                                }
                                                                                className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                                                                            >
                                                                                Save
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingMessageId(null);
                                                                                    setEditingContent("");
                                                                                }}
                                                                                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    // Normal Message
                                                                    <div
                                                                        className={`relative px-4 py-2 rounded-2xl ${
                                                                            isOwnMessage
                                                                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                                                                : "bg-white text-gray-900 border border-gray-200"
                                                                        }`}
                                                                    >
                                                                        <p className="text-sm whitespace-pre-wrap break-words">
                                                                            {message.Content}
                                                                        </p>

                                                                        {/* Message Actions */}
                                                                        <div
                                                                            className={`absolute ${
                                                                                isOwnMessage ? "left-0" : "right-0"
                                                                            } top-1/2 -translate-y-1/2 ${
                                                                                isOwnMessage
                                                                                    ? "-translate-x-full pr-2"
                                                                                    : "translate-x-full pl-2"
                                                                            } opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}
                                                                        >
                                                                            <button
                                                                                onClick={() =>
                                                                                    setShowEmojiPicker(
                                                                                        showEmojiPicker === message.Id
                                                                                            ? null
                                                                                            : message.Id
                                                                                    )
                                                                                }
                                                                                className="p-1 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                                                                                title="Add reaction"
                                                                            >
                                                                                <Smile className="w-4 h-4 text-gray-600" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setReplyingTo(message)}
                                                                                className="p-1 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                                                                                title="Reply"
                                                                            >
                                                                                <Reply className="w-4 h-4 text-gray-600" />
                                                                            </button>
                                                                            {isOwnMessage && (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setEditingMessageId(message.Id);
                                                                                            setEditingContent(
                                                                                                message.Content
                                                                                            );
                                                                                        }}
                                                                                        className="p-1 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                                                                                        title="Edit"
                                                                                    >
                                                                                        <Edit2 className="w-4 h-4 text-gray-600" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleDeleteMessage(message.Id)
                                                                                        }
                                                                                        className="p-1 bg-white border border-gray-200 rounded-full hover:bg-red-50 transition-colors"
                                                                                        title="Delete"
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>

                                                                        {/* Emoji Picker */}
                                                                        {showEmojiPicker === message.Id && (
                                                                            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-10">
                                                                                {commonEmojis.map((emoji) => (
                                                                                    <button
                                                                                        key={emoji}
                                                                                        onClick={() =>
                                                                                            handleAddReaction(
                                                                                                message.Id,
                                                                                                emoji
                                                                                            )
                                                                                        }
                                                                                        className="p-2 hover:bg-gray-100 rounded transition-colors text-lg"
                                                                                    >
                                                                                        {emoji}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        {/* Reactions */}
                                                                        {message.reactions &&
                                                                            message.reactions.length > 0 && (
                                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                                    {Object.entries(
                                                                                        message.reactions.reduce(
                                                                                            (acc, r) => {
                                                                                                acc[r.Emoji] =
                                                                                                    (acc[r.Emoji] || 0) + 1;
                                                                                                return acc;
                                                                                            },
                                                                                            {} as Record<string, number>
                                                                                        )
                                                                                    ).map(([emoji, count]) => (
                                                                                        <button
                                                                                            key={emoji}
                                                                                            onClick={() =>
                                                                                                handleAddReaction(
                                                                                                    message.Id,
                                                                                                    emoji
                                                                                                )
                                                                                            }
                                                                                            className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                                                                                                isOwnMessage
                                                                                                    ? "bg-white bg-opacity-20 text-white"
                                                                                                    : "bg-gray-100 text-gray-700"
                                                                                            } hover:scale-110 transition-transform`}
                                                                                        >
                                                                                            <span>{emoji}</span>
                                                                                            <span className="font-medium">
                                                                                                {count}
                                                                                            </span>
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                )}

                                                                {/* Message Footer */}
                                                                <div
                                                                    className={`flex items-center gap-2 mt-1 px-1 ${
                                                                        isOwnMessage
                                                                            ? "justify-end"
                                                                            : "justify-start"
                                                                    }`}
                                                                >
                                                                    <span className="text-xs text-gray-500">
                                                                        {formatMessageTime(message.CreatedOn)}
                                                                    </span>
                                                                    {message.IsEdited && (
                                                                        <span className="text-xs text-gray-500 italic">
                                                                            (edited)
                                                                        </span>
                                                                    )}
                                                                    {isOwnMessage && (
                                                                        <span>
                                                                            {message.Status === "read" ? (
                                                                                <CheckCheck className="w-3 h-3 text-blue-500" />
                                                                            ) : message.Status === "delivered" ? (
                                                                                <CheckCheck className="w-3 h-3 text-gray-400" />
                                                                            ) : (
                                                                                <Check className="w-3 h-3 text-gray-400" />
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="bg-white border-t border-gray-200 p-4">
                                {/* Reply Preview */}
                                {replyingTo && (
                                    <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-700 mb-1">
                                                Replying to {replyingTo.senderName}
                                            </p>
                                            <p className="text-xs text-gray-600 truncate">
                                                {replyingTo.Content}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-end gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <Paperclip className="w-5 h-5 text-gray-600" />
                                    </button>

                                    <div className="flex-1 relative">
                                        <textarea
                                            ref={messageInputRef}
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            placeholder="Type a message..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            rows={1}
                                            style={{
                                                minHeight: "44px",
                                                maxHeight: "120px",
                                            }}
                                        />
                                    </div>

                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <Smile className="w-5 h-5 text-gray-600" />
                                    </button>

                                    <button
                                        onClick={handleSendMessage}
                                        disabled={
                                            !messageText.trim() || sendMessageMutation.isPending
                                        }
                                        className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sendMessageMutation.isPending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 mt-2">
                                    Press Enter to send, Shift + Enter for new line
                                </p>
                            </div>
                        </>
                    ) : (
                        // No Conversation Selected
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Select a conversation
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Choose a conversation from the list to start messaging
                                </p>
                                <button
                                    onClick={() => setShowNewChatModal(true)}
                                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
                                >
                                    Start New Chat
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <NewChatModal
                    onClose={() => setShowNewChatModal(false)}
                    onSuccess={(conversation) => {
                        setSelectedConversation(conversation);
                        setShowNewChatModal(false);
                    }}
                />
            )}
        </div>
    );
};


// New Chat Modal Component
interface NewChatModalProps {
    onClose: () => void;
    onSuccess: (conversation: ConversationDataI) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onSuccess }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [chatName, setChatName] = useState("");
    const [chatType, setChatType] = useState<"direct" | "group">("direct");

    const createConversationMutation = useCreateConversation();

    // TODO: Implement user search - this should fetch from your users API
    const availableUsers = [
        {
            id: "1",
            name: "John Doe",
            role: "Teacher",
            avatar: "",
        },
        {
            id: "2",
            name: "Jane Smith",
            role: "Student",
            avatar: "",
        },
    ];

    const handleCreateConversation = async () => {
        if (selectedUsers.length === 0) return;

        try {
            const result = await createConversationMutation.mutateAsync({
                Name: chatType === "group" ? chatName : undefined,
                Type: chatType,
                participantIds: selectedUsers,
            });

            onSuccess(result.data);
        } catch (error) {
            console.error("Failed to create conversation:", error);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">New Conversation</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Chat Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Conversation Type
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setChatType("direct")}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${chatType === "direct"
                                        ? "border-green-500 bg-green-50 text-green-700"
                                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                                    }`}
                            >
                                Direct Message
                            </button>
                            <button
                                onClick={() => setChatType("group")}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${chatType === "group"
                                        ? "border-green-500 bg-green-50 text-green-700"
                                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                                    }`}
                            >
                                Group Chat
                            </button>
                        </div>
                    </div>

                    {/* Group Name (only for group chats) */}
                    {chatType === "group" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Group Name
                            </label>
                            <input
                                type="text"
                                value={chatName}
                                onChange={(e) => setChatName(e.target.value)}
                                placeholder="Enter group name..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    )}

                    {/* User Search */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select {chatType === "direct" ? "User" : "Users"}
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {selectedUsers.map((userId) => {
                                const user = availableUsers.find((u) => u.id === userId);
                                if (!user) return null;

                                return (
                                    <div
                                        key={userId}
                                        className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full"
                                    >
                                        <span className="text-sm font-medium">{user.name}</span>
                                        <button
                                            onClick={() =>
                                                setSelectedUsers(selectedUsers.filter((id) => id !== userId))
                                            }
                                            className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* User List */}
                    <div className="space-y-2">
                        {availableUsers
                            .filter((user) =>
                                user.name.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((user) => {
                                const isSelected = selectedUsers.includes(user.id);

                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => {
                                            if (chatType === "direct") {
                                                setSelectedUsers([user.id]);
                                            } else {
                                                if (isSelected) {
                                                    setSelectedUsers(
                                                        selectedUsers.filter((id) => id !== user.id)
                                                    );
                                                } else {
                                                    setSelectedUsers([...selectedUsers, user.id]);
                                                }
                                            }
                                        }}
                                        className={`w-full p-3 flex items-center gap-3 rounded-lg border-2 transition-colors ${isSelected
                                                ? "border-green-500 bg-green-50"
                                                : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                            {getInitials(user.name)}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-600">{user.role}</p>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-5 h-5 text-green-600" />
                                        )}
                                    </button>
                                );
                            })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateConversation}
                        disabled={
                            selectedUsers.length === 0 ||
                            (chatType === "group" && !chatName.trim()) ||
                            createConversationMutation.isPending
                        }
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {createConversationMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Conversation"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;