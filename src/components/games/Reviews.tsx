import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, MessageCircle, Plus, Loader2 } from "lucide-react";
import { SortOption } from "@/types/Reviews";
import { useClientSession } from "@/hooks/user/useClientSession";
import { useAddReview, useGameReviews } from "@/hooks/reviews/useGameReviews";
import { timeFromNow } from "@/utils/functions";
import { useLikeReview } from "@/hooks/reviews/useLikes";

interface ReviewsProps {
  gameId: string;
}

export const Reviews: React.FC<ReviewsProps> = ({ gameId }) => {
  const { userRoleId } = useClientSession();
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showAddReview, setShowAddReview] = useState(false);
  const [animatingReviewId, setAnimatingReviewId] = useState<string | null>(
    null
  );
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  });

  // Fetch reviews
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    error: reviewsError,
  } = useGameReviews({
    gameId,
    page: 1,
    limit: 10,
    sortBy,
  });

  // Add review mutation
  const addReviewMutation = useAddReview();
  const likeReviewMutation = useLikeReview();

  const handleAddReview = async () => {
    if (!newReview.comment.trim()) return;

    try {
      await addReviewMutation.mutateAsync({
        gameId,
        rating: newReview.rating,
        comment: newReview.comment,
      });

      // Reset form
      setNewReview({ rating: 5, comment: "" });
      setShowAddReview(false);
    } catch (error) {
      console.error("Failed to add review:", error);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    if (!userRoleId) return;

    setAnimatingReviewId(reviewId);

    try {
      await likeReviewMutation.mutateAsync({ reviewId, gameId });

      // Clear animation after completion
      setTimeout(() => {
        setAnimatingReviewId(null);
      }, 800);
    } catch (error) {
      console.error("Failed to like review:", error);
      setAnimatingReviewId(null);
    }
  };

  const getAvatarEmoji = (userId: string) => {
    // Simple hash to consistently assign avatar based on user ID
    const avatars = ["👧🏿", "👦🏿", "👩🏿", "👨🏿", "👶🏿", "👴🏿", "👵🏿"];
    const hash = userId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatars[hash % avatars.length];
  };

  if (isLoadingReviews) {
    return (
      <motion.div
        key="reviews-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400 mx-auto mb-4" />
          <p className="text-gray-600 font-bold">Loading reviews...</p>
        </div>
      </motion.div>
    );
  }

  if (reviewsError || !reviewsData) {
    return (
      <motion.div
        key="reviews-error"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-6xl mb-4">😞</div>
        <p className="text-gray-600 font-bold">Failed to load reviews</p>
      </motion.div>
    );
  }

  const { reviews, averageRating, pagination } = reviewsData;

  return (
    <motion.div
      key="reviews"
      role="tabpanel"
      id="reviews-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Header with rating and controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <h3 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
            <span className="text-3xl" aria-hidden="true">
              ⭐
            </span>
            Player Reviews
          </h3>
          <div
            className="flex items-center gap-2"
            aria-label={`Average rating: ${averageRating.score} stars`}
          >
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < Math.floor(parseFloat(averageRating.score))
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="font-bold text-gray-700">
              {averageRating.score}
            </span>
            <span className="text-gray-500">
              ({averageRating.totalReviews} reviews)
            </span>
          </div>
        </div>

        {/* Sort and Add Review Controls */}
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-white border-2 border-orange-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating_high">Highest Rating</option>
            <option value="rating_low">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>

          {userRoleId && (
            <button
              onClick={() => setShowAddReview(!showAddReview)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 shadow-lg"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Review</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Review Form */}
      <AnimatePresence>
        {showAddReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200 mb-6"
          >
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle size={20} />
              Share Your Experience
            </h4>

            {/* Rating Selection */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setNewReview((prev) => ({ ...prev, rating: star }))
                    }
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={24}
                      className={
                        star <= newReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                      }
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({newReview.rating} star{newReview.rating !== 1 ? "s" : ""})
                </span>
              </div>
            </div>

            {/* Comment Input */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder="Share your thoughts about this game..."
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {newReview.comment.length}/500
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddReview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                disabled={addReviewMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleAddReview}
                disabled={
                  !newReview.comment.trim() || addReviewMutation.isPending
                }
                className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2 rounded-lg font-bold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addReviewMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Post Review</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📝</div>
          <h4 className="text-xl font-bold text-gray-600 mb-2">
            No Reviews Yet
          </h4>
          <p className="text-gray-500">
            Be the first to share your experience!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.article
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-orange-50 to-yellow-50 p-5 rounded-2xl border-2 border-orange-200"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl" aria-hidden="true">
                  {getAvatarEmoji(review.user.id)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-800">
                      {review.user.fullName || "Anonymous Player"}
                    </h4>
                    <time className="text-sm text-gray-500">
                      {timeFromNow(new Date(review.createdOn))}
                    </time>
                  </div>
                  <div
                    className="flex items-center gap-1 mb-2"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                  )}
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLikeReview(review.id)}
                      disabled={!userRoleId || likeReviewMutation.isPending}
                      className={`relative flex items-center gap-1 text-sm transition-colors focus:ring-2 focus:ring-blue-300 rounded p-1 ${
                        review.isLikedByCurrentUser
                          ? "text-yellow-600"
                          : "text-gray-500 hover:text-yellow-600"
                      } ${!userRoleId ? "opacity-50 cursor-not-allowed" : ""}`}
                      aria-label={`Mark review by ${
                        review.user.fullName || "Anonymous Player"
                      } as helpful`}
                    >
                      <motion.div
                        animate={
                          animatingReviewId === review.id
                            ? {
                                scale: [1, 1.2, 1],
                                rotate: [0, -10, 10, 0],
                              }
                            : {}
                        }
                        transition={{ duration: 0.3 }}
                      >
                        <ThumbsUp
                          size={16}
                          className={
                            review.isLikedByCurrentUser ? "fill-current" : ""
                          }
                        />
                      </motion.div>
                      <span>Helpful ({review.helpfulCount})</span>
                      {animatingReviewId === review.id && <ThumbsUpParticles />}
                    </motion.button>
                    {!review.isApproved && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Pending Approval
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {pagination.hasNextPage && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 py-3 rounded-2xl font-bold border-2 border-orange-300 hover:from-orange-200 hover:to-yellow-200 transition-all duration-300 focus:ring-4 focus:ring-orange-300"
          aria-label="Load more reviews"
        >
          Load More Reviews ({pagination.totalCount - reviews.length} remaining)
        </motion.button>
      )}

      {/* Error state for add review */}
      {addReviewMutation.isError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center"
        >
          <p className="text-red-600 font-medium">
            Failed to add review. Please try again.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

const ThumbsUpParticles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: [0, (Math.random() - 0.5) * 60],
            y: [0, -Math.random() * 40 - 10],
            scale: [0, 0.8, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.05,
            ease: "easeOut",
          }}
        >
          <ThumbsUp
            size={16}
            className="fill-yellow-500 text-yellow-500"
            style={{
              transform: `rotate(${(Math.random() - 0.5) * 30}deg)`,
            }}
          />
        </motion.div>
      ))}
      <motion.div
        className="absolute inset-0 rounded-full bg-yellow-400"
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
};
