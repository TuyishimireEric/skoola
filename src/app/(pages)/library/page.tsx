"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronRight,
  Sparkles,
  ChevronLeft,
  BookOpen,
  Headphones,
  Play,
  Pause,
  Volume2,
  Loader2,
} from "lucide-react";

// Type definitions
interface Book {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  isbn?: string[];
  subject?: string[];
  ia?: string[];
  language?: string[];
}

interface BookContent {
  title: string;
  author: string;
  content: string[];
  totalPages: number;
}

interface BookCardProps {
  book: Book;
  index: number;
  onReadClick: (book: Book) => void;
}

interface ReadingModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

interface AgeGroup {
  value: string;
  label: string;
  emoji: string;
  color: string;
}

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Age group configuration
const AGE_GROUPS: AgeGroup[] = [
  {
    value: "3-5",
    label: "Ages 3-5",
    emoji: "🧸",
    color: "from-pink-400 to-purple-400",
  },
  {
    value: "6-8",
    label: "Ages 6-8",
    emoji: "🦄",
    color: "from-blue-400 to-cyan-400",
  },
  {
    value: "9-11",
    label: "Ages 9-11",
    emoji: "🚀",
    color: "from-green-400 to-emerald-400",
  },
  {
    value: "12-14",
    label: "Ages 12-14",
    emoji: "🌟",
    color: "from-orange-400 to-red-400",
  },
];

// Genre configuration for kids
const GENRES = [
  "Adventure",
  "Fantasy",
  "Mystery",
  "Science",
  "Animals",
  "Fairy Tales",
  "Comics",
  "Poetry",
];

const GENRE_EMOJIS: Record<string, string> = {
  Adventure: "🏔️",
  Fantasy: "🧙‍♂️",
  Mystery: "🔍",
  Science: "🔬",
  Animals: "🐾",
  "Fairy Tales": "👑",
  Comics: "💭",
  Poetry: "✨",
};

// Book Card Component
const BookCard: React.FC<BookCardProps> = ({ book, index, onReadClick }) => {
  const coverUrl = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : "https://via.placeholder.com/200x300/4F46E5/FFFFFF?text=No+Cover";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-yellow-300 hover:border-orange-400 transition-all duration-300 group"
    >
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
        <img
          src={coverUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "https://via.placeholder.com/200x300/4F46E5/FFFFFF?text=No+Cover";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <h3 className="font-comic font-bold text-lg text-gray-800 mb-2 line-clamp-2">
          {book.title}
        </h3>
        {book.author_name && (
          <p className="font-comic text-sm text-gray-600 mb-3">
            by {book.author_name[0]}
          </p>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onReadClick(book)}
          className="w-full bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white py-3 rounded-xl font-comic font-bold flex items-center justify-center gap-2 shadow-lg"
        >
          <BookOpen size={20} />
          Read Now
        </motion.button>
      </div>
    </motion.div>
  );
};

// Reading Modal Component
const ReadingModal: React.FC<ReadingModalProps> = ({
  book,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookContent, setBookContent] = useState<BookContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch book content
  useEffect(() => {
    if (book && isOpen) {
      fetchBookContent(book);
    }
  }, [book, isOpen]);

  const fetchBookContent = async (book: Book) => {
    setIsLoadingContent(true);
    try {
      // Try to get book text from Internet Archive
      if (book.ia && book.ia.length > 0) {
        const iaId = book.ia[0];
        const textUrl = `https://archive.org/download/${iaId}/${iaId}_djvu.txt`;

        try {
          const response = await fetch(textUrl);
          if (response.ok) {
            const text = await response.text();
            const pages = splitIntoPages(text, 500); // 500 chars per page for kids
            setBookContent({
              title: book.title,
              author: book.author_name?.[0] || "Unknown Author",
              content: pages,
              totalPages: pages.length,
            });
            setIsLoadingContent(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching from Internet Archive:", error);
        }
      }

      // Fallback to excerpts from Open Library
      if (book.key) {
        const workId = book.key.replace("/works/", "");
        const excerptUrl = `https://openlibrary.org/works/${workId}.json`;

        try {
          const response = await fetch(excerptUrl);
          if (response.ok) {
            const data = await response.json();
            if (data.description) {
              const description =
                typeof data.description === "string"
                  ? data.description
                  : data.description.value || "No preview available";

              const pages = splitIntoPages(description, 300);
              setBookContent({
                title: book.title,
                author: book.author_name?.[0] || "Unknown Author",
                content:
                  pages.length > 0
                    ? pages
                    : ["This book preview is not available. Try another book!"],
                totalPages: pages.length || 1,
              });
              setIsLoadingContent(false);
              return;
            }
          }
        } catch (error) {
          console.error("Error fetching book description:", error);
        }
      }

      // Final fallback - use a message about the book
      setBookContent({
        title: book.title,
        author: book.author_name?.[0] || "Unknown Author",
        content: [
          `"${book.title}" by ${book.author_name?.[0] || "Unknown Author"}`,
          "This book's full text is not available for reading right now.",
          "But you can find this amazing book at your local library or bookstore!",
          "Reading books helps you learn new things and go on amazing adventures!",
        ],
        totalPages: 4,
      });
    } catch (error) {
      console.error("Error loading book content:", error);
      setBookContent({
        title: book.title,
        author: book.author_name?.[0] || "Unknown Author",
        content: ["Sorry, we couldn't load this book. Please try another one!"],
        totalPages: 1,
      });
    } finally {
      setIsLoadingContent(false);
    }
  };

  const splitIntoPages = (text: string, charsPerPage: number): string[] => {
    // Clean the text
    const cleanedText = text
      .replace(/\n\s*\n/g, "\n\n") // Normalize line breaks
      .replace(/\s+/g, " ") // Normalize spaces
      .trim();

    if (!cleanedText) return [];

    const words = cleanedText.split(" ");
    const pages: string[] = [];
    let currentPage = "";

    for (const word of words) {
      if ((currentPage + " " + word).length > charsPerPage) {
        if (currentPage) {
          pages.push(currentPage.trim());
          currentPage = word;
        }
      } else {
        currentPage += (currentPage ? " " : "") + word;
      }
    }

    if (currentPage) {
      pages.push(currentPage.trim());
    }

    return pages;
  };

  const handlePlayPause = useCallback(() => {
    if ("speechSynthesis" in window && bookContent) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const text = bookContent.content[currentPage];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slower for kids
        utterance.pitch = 1.1; // Slightly higher pitch
        utterance.onend = () => setIsPlaying(false);

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  }, [isPlaying, currentPage, bookContent]);

  const handlePageChange = (newPage: number) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
    setCurrentPage(newPage);
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen || !book) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border-4 border-yellow-400"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-yellow-300 bg-white/50">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-comic font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="text-blue-500" />
                {book.title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-8">
            {isLoadingContent ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <Loader2
                    className="animate-spin text-blue-500 mx-auto mb-4"
                    size={48}
                  />
                  <p className="font-comic text-lg text-gray-600">
                    Loading your book...
                  </p>
                </div>
              </div>
            ) : bookContent ? (
              <>
                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-200 min-h-[300px]">
                  <p className="font-comic text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {bookContent.content[currentPage]}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePlayPause}
                      className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                      <Headphones size={20} />
                    </motion.button>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Volume2 size={20} />
                      <span className="font-comic text-sm">
                        {isPlaying ? "Reading aloud..." : "Click to listen"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(0, currentPage - 1))
                      }
                      disabled={currentPage === 0}
                      className="px-4 py-2 bg-blue-400 hover:bg-blue-500 disabled:bg-gray-300 text-white rounded-lg font-comic font-bold transition-colors"
                    >
                      Previous
                    </button>
                    <span className="font-comic text-gray-600 mx-4">
                      Page {currentPage + 1} of {bookContent.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.min(bookContent.totalPages - 1, currentPage + 1)
                        )
                      }
                      disabled={currentPage === bookContent.totalPages - 1}
                      className="px-4 py-2 bg-blue-400 hover:bg-blue-500 disabled:bg-gray-300 text-white rounded-lg font-comic font-bold transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="font-comic text-lg text-gray-600">
                  Unable to load book content.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Library Component
const LibraryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch books from OpenLibrary
  const fetchBooks = useCallback(
    async (query: string = "children", page: number = 1) => {
      setIsLoading(true);
      try {
        // Add filters for children's books and available texts
        const searchParams = new URLSearchParams({
          q: query,
          has_fulltext: "true",
          language: "eng",
          limit: "20",
          page: page.toString(),
          fields:
            "key,title,author_name,cover_i,first_publish_year,isbn,subject,ia,language",
        });

        const response = await fetch(
          `https://openlibrary.org/search.json?${searchParams}`
        );
        const data = await response.json();

        const formattedBooks: Book[] = data.docs.map(
          (book: {
            key: string;
            title: string;
            author_name: string;
            cover_i: string;
            first_publish_year: string;
            isbn: string;
            subject: string;
            ia: string;
            language: string;
          }) => ({
            key: book.key,
            title: book.title,
            author_name: book.author_name,
            cover_i: book.cover_i,
            first_publish_year: book.first_publish_year,
            isbn: book.isbn,
            subject: book.subject,
            ia: book.ia,
            language: book.language,
          })
        );

        if (page === 1) {
          setBooks(formattedBooks);
        } else {
          setBooks((prev) => [...prev, ...formattedBooks]);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchBooks("children fiction", 1);
  }, [fetchBooks]);

  // Handle search
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        setCurrentPage(1);
        const baseQuery = value || "children";
        const fullQuery = selectedGenre
          ? `${baseQuery} ${selectedGenre}`
          : baseQuery;
        fetchBooks(fullQuery, 1);
      }, 500);
    },
    [fetchBooks, selectedGenre]
  );

  // Handle age group selection
  const handleAgeGroupSelect = (ageGroup: string) => {
    setSelectedAgeGroup(ageGroup);
    setShowFilters(true);
    setCurrentPage(1);

    // Map age groups to appropriate search terms
    const ageQueries: Record<string, string> = {
      "3-5": "picture books preschool",
      "6-8": "early readers children",
      "9-11": "middle grade fiction",
      "12-14": "young adult fiction",
    };

    fetchBooks(ageQueries[ageGroup] || "children books", 1);
  };

  // Handle genre selection
  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre === selectedGenre ? "" : genre);
    setCurrentPage(1);
    const baseQuery = searchQuery || "children";
    const ageQuery = selectedAgeGroup ? `age ${selectedAgeGroup}` : "";
    const query = `${baseQuery} ${
      genre === selectedGenre ? "" : genre
    } ${ageQuery}`.trim();
    fetchBooks(query, 1);
  };

  // Handle read click
  const handleReadClick = (book: Book) => {
    setSelectedBook(book);
    setIsReadingModalOpen(true);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedAgeGroup("");
    setSelectedGenre("");
    setSearchQuery("");
    setShowFilters(false);
    setCurrentPage(1);
    fetchBooks("children fiction", 1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() || selectedAgeGroup || selectedGenre;
  }, [searchQuery, selectedAgeGroup, selectedGenre]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Render age group selection
  const renderAgeGroupSelection = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border-4 border-blue-300 max-w-4xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-comic text-primary-700 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-400 to-pink-500">
              Pick Your Reading Level!
            </span>
            <span className="ml-2">📚</span>
          </h2>
          <p className="text-lg text-primary-600 font-comic">
            Choose your age group to find the perfect books! 🌈
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {AGE_GROUPS.map((group, index) => (
            <motion.button
              key={group.value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAgeGroupSelect(group.value)}
              className={`relative p-6 md:p-8 rounded-2xl bg-gradient-to-br ${group.color} text-white font-comic font-bold text-xl md:text-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-white/50 overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-4xl md:text-5xl mb-2">{group.emoji}</div>
                <div>{group.label}</div>
                <div className="mt-2 text-sm opacity-90">
                  <Sparkles size={16} className="inline mr-1" />
                  Start reading!
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => setShowFilters(true)}
            className="text-primary-500 hover:text-primary-600 font-comic text-sm underline"
          >
            Browse all books <ChevronRight size={16} className="inline" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <section className="relative w-full min-h-screen overflow-hidden font-comic bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Decorative Elements */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        aria-hidden="true"
      >
        <div className="relative w-full h-full max-w-[1600px] mx-auto">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-20 right-20 text-8xl opacity-10"
          >
            📚
          </motion.div>
          <motion.div
            animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="absolute top-40 left-20 text-7xl opacity-10"
          >
            🌟
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`relative z-30 min-h-screen ${
          selectedAgeGroup ? "pt-16" : "pt-28 md:pt-32"
        } pb-8 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto`}
      >
        <div className="w-full mx-auto">
          {/* Header Section */}
          {!selectedAgeGroup && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInVariants}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-block mb-6"
              >
                <div className="bg-gradient-to-r from-blue-300 to-purple-400 text-white px-6 py-3 rounded-full text-xl font-comic font-bold shadow-lg transform -rotate-2">
                  <span>📖</span> Magical Library for Kids! <span>✨</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl sm:text-5xl font-bold font-comic text-primary-700 mb-3"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-400 to-pink-500">
                  Discover Amazing Stories!
                </span>
                🦄
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-lg text-primary-600 font-comic mb-6"
              >
                Pick a book and start your reading adventure! 🚀
              </motion.p>
            </motion.div>
          )}

          {/* Show age group selection or filters */}
          {!showFilters && !selectedAgeGroup ? (
            renderAgeGroupSelection()
          ) : (
            <>
              {/* Back Button */}
              {selectedAgeGroup && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <button
                    onClick={() => {
                      setSelectedAgeGroup("");
                      setShowFilters(false);
                      fetchBooks("children fiction", 1);
                    }}
                    className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-comic font-bold transition-colors"
                  >
                    <ChevronLeft size={20} />
                    <span>Back to Age Groups</span>
                  </button>
                </motion.div>
              )}

              {/* Filters Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 ${
                  selectedAgeGroup
                    ? "bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-lg border-2 border-blue-300"
                    : ""
                }`}
              >
                <div
                  className={`${
                    selectedAgeGroup
                      ? ""
                      : "bg-white/30 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-white/40"
                  }`}
                >
                  {/* Age Badge */}
                  {selectedAgeGroup && (
                    <div className="mb-3 flex items-center justify-between">
                      <div className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-3 py-1.5 rounded-full font-comic font-bold flex items-center gap-2 shadow-md text-sm">
                        {
                          AGE_GROUPS.find((g) => g.value === selectedAgeGroup)
                            ?.emoji
                        }
                        <span>
                          {
                            AGE_GROUPS.find((g) => g.value === selectedAgeGroup)
                              ?.label
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Search Bar */}
                  <div className="relative mb-3">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search magical books... 📚✨"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/80 border-2 border-primary-200/60 rounded-2xl font-comic text-base text-gray-800 placeholder-primary-400/70 focus:outline-none focus:ring-4 focus:ring-primary-300/40"
                    />
                  </div>

                  {/* Genre Filter */}
                  <div className="space-y-2">
                    <h3 className="font-comic text-blue-700 text-xs font-bold flex items-center gap-2">
                      <span className="text-lg">📚</span> Book Types
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map((genre) => (
                        <motion.button
                          key={genre}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleGenreChange(genre)}
                          className={`px-2.5 py-1.5 rounded-lg font-comic font-bold text-xs transition-all duration-300 border-2 shadow-sm ${
                            selectedGenre === genre
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-400"
                              : "bg-white/90 text-blue-600 border-blue-200 hover:bg-blue-50"
                          }`}
                        >
                          {GENRE_EMOJIS[genre]} {genre}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Active Filters */}
                  <AnimatePresence>
                    {hasActiveFilters && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 mt-2 border-t border-blue-200/50"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={clearFilters}
                          className="bg-gradient-to-r from-red-400 to-pink-400 text-white px-3 py-1.5 rounded-lg font-comic font-bold text-xs"
                        >
                          <X size={12} className="inline mr-1" />
                          Clear All
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Books Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {isLoading && books.length === 0 ? (
                  <div className="col-span-full flex justify-center py-12">
                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-4 border-yellow-300">
                      <div className="text-center">
                        <div className="animate-bounce text-6xl mb-4">📚</div>
                        <p className="font-comic text-primary-600 text-xl">
                          Finding magical books for you...
                        </p>
                      </div>
                    </div>
                  </div>
                ) : books.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-4 border-yellow-300">
                      <div className="text-6xl mb-4">😢</div>
                      <p className="font-comic text-primary-600 text-xl">
                        No books found. Try a different search!
                      </p>
                    </div>
                  </div>
                ) : (
                  books.map((book, index) => (
                    <BookCard
                      key={`${book.key}-${index}`}
                      book={book}
                      index={index}
                      onReadClick={handleReadClick}
                    />
                  ))
                )}
              </motion.div>

              {/* Load More Button */}
              {books.length > 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const nextPage = currentPage + 1;
                      setCurrentPage(nextPage);
                      const baseQuery = searchQuery || "children";
                      const genreQuery = selectedGenre || "";
                      const ageQuery = selectedAgeGroup
                        ? `age ${selectedAgeGroup}`
                        : "";
                      const query =
                        `${baseQuery} ${genreQuery} ${ageQuery}`.trim();
                      fetchBooks(query, nextPage);
                    }}
                    className="bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-2xl font-comic font-bold text-lg shadow-lg border-2 border-blue-300"
                  >
                    Load More Books 📚
                  </motion.button>
                </motion.div>
              )}

              {/* Results Count */}
              {books.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-8"
                >
                  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border-4 border-yellow-300 inline-block">
                    <p className="font-comic text-purple-600 text-lg">
                      Found {books.length} amazing book
                      {books.length !== 1 ? "s" : ""} 🎉
                    </p>
                    {selectedAgeGroup && (
                      <p className="font-comic text-primary-500 text-sm mt-2">
                        📚{" "}
                        {
                          AGE_GROUPS.find((g) => g.value === selectedAgeGroup)
                            ?.label
                        }{" "}
                        books
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reading Modal */}
      <ReadingModal
        book={selectedBook}
        isOpen={isReadingModalOpen}
        onClose={() => {
          setIsReadingModalOpen(false);
          setSelectedBook(null);
        }}
      />
    </section>
  );
};

export default LibraryPage;
