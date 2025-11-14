import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Award,
  BookOpen,
  MessageSquare,
  Bell,
  Download,
  Edit,
  MoreVertical,
  Loader2,
  Send,
  Sparkles,
  Bot,
  Users,
  RefreshCw,
} from "lucide-react";

export const QuickActions = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
                    <MessageSquare className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                        Send Message
                    </span>
                </button>
                    <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
                        <Phone className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                            Call Parent
                        </span>
                    </button>
                <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
                    <BookOpen className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                        View Courses
                    </span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
                    <Download className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                        Generate Report
                    </span>
                </button>
            </div>
        </div>
    );
};