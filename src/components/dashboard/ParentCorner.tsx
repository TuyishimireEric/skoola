import {
  Award,
  BookOpen,
  Calendar,
  FileText,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

export const ParentCorner = () => {
  return (
    <div className="mt-4 bg-primary-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border-2 sm:border-4 border-primary-200 font-comic">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-primary-700 mb-2 flex items-center">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-primary-600" />
            Admin Parents Corner
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            Monitor parent communications and manage parent representatives.
          </p>

          {/* Quick stats summary */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
            <div className="bg-white rounded-xl p-2 sm:p-3 shadow-sm border border-primary-200 flex flex-col items-center">
              <div className="text-lg sm:text-xl font-bold text-primary-700">
                43
              </div>
              <div className="text-xs text-gray-500 text-center">
                Active Parents
              </div>
            </div>

            <div className="bg-white rounded-xl p-2 sm:p-3 shadow-sm border border-primary-200 flex flex-col items-center">
              <div className="text-lg sm:text-xl font-bold text-primary-700">
                12
              </div>
              <div className="text-xs text-gray-500 text-center">
                Unread Messages
              </div>
            </div>

            <div className="bg-white rounded-xl p-2 sm:p-3 shadow-sm border border-primary-200 flex flex-col items-center">
              <div className="text-lg sm:text-xl font-bold text-primary-700">
                5
              </div>
              <div className="text-xs text-gray-500 text-center">
                Parent Representatives
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-100 overflow-hidden border-2 sm:border-4 border-white shadow-md flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-primary-700 mt-2 text-center">
            Admin Dashboard
          </span>
          <span className="text-xs text-gray-500 text-center">
            School Management
          </span>
        </div>
      </div>

      {/* Parent Representatives */}
      <div className="mt-4 sm:mt-6 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-primary-200 shadow-sm">
        <h3 className="font-bold text-primary-700 text-sm mb-3 flex items-center">
          <Star className="w-4 h-4 mr-1 text-primary-500" />
          Parent Representatives
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {[
            {
              name: "Sarah Johnson",
              grade: "Grade 1 Rep",
              avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            },
            {
              name: "Michael Chen",
              grade: "Grade 2 Rep",
              avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            },
            {
              name: "Lisa Wong",
              grade: "Grade 3 Rep",
              avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            },
            {
              name: "James Peterson",
              grade: "Grade 4 Rep",
              avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            },
            {
              name: "Fatima Ali",
              grade: "Grade 5 Rep",
              avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            },
          ].map((rep, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 overflow-hidden border-2 border-primary-200">
                <img
                  src={rep.avatar}
                  alt="Parent Rep"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-medium text-primary-700 mt-1 text-center truncate w-full">
                {rep.name}
              </span>
              <span className="text-xs text-gray-500 text-center">
                {rep.grade}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent parent messages */}
      <div className="mt-4 sm:mt-6 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-primary-200 shadow-sm">
        <h3 className="font-bold text-primary-700 text-sm mb-3 flex items-center">
          <MessageCircle className="w-4 h-4 mr-1 text-primary-500" />
          Recent Parent Messages
        </h3>

        <div className="space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
          {[
            {
              name: "Sarah Johnson (Emma's Mom)",
              time: "Today, 9:45 AM",
              message:
                "Could we please address the cafeteria menu options? My daughter has dietary restrictions.",
              avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            },
            {
              name: "Robert Smith (Jacob's Dad)",
              time: "Yesterday, 3:22 PM",
              message:
                "I'd like to volunteer for the upcoming science fair. Please let me know how I can help.",
              avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            },
            {
              name: "Lisa Wong (Tyler's Mom)",
              time: "April 12, 2:18 PM",
              message:
                "When will the next PTA meeting be held? I have some fundraising ideas to discuss.",
              avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            },
          ].map((msg, index) => (
            <div
              key={index}
              className="flex items-start space-x-2 sm:space-x-3 border-b border-gray-100 pb-3"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                <img
                  src={msg.avatar}
                  alt="Parent"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <p className="text-xs font-medium text-primary-700 truncate">
                    {msg.name}
                  </p>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {msg.time}
                  </span>
                </div>
                <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                  {msg.message}
                </p>
                <div className="flex mt-2 gap-1 sm:gap-2">
                  <button className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded hover:bg-primary-200 transition-colors">
                    Reply
                  </button>
                  <button className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-200 transition-colors">
                    Archive
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2">
        <button className="bg-primary-400 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-primary-300 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-bold shadow-md border-2 border-primary-200">
          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Send Broadcast</span>
        </button>

        <button className="bg-primary-400 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-primary-300 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-bold shadow-md border-2 border-primary-200">
          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Manage Representatives</span>
        </button>

        <button className="bg-primary-400 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-primary-300 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-bold shadow-md border-2 border-primary-200">
          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Upcoming parent events */}
      <div className="mt-4 bg-primary-50 border border-primary-200 rounded-xl p-3">
        <h3 className="font-bold text-primary-700 text-sm mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-1 text-primary-500" />
          Upcoming Parent Events
        </h3>

        <div className="space-y-3 pt-4">
          {[
            {
              title: "PTA Meeting",
              date: "April 18, 2025 at 6:00 PM",
              icon: Users,
            },
            {
              title: "Parent-Teacher Conferences",
              date: "April 20-21, 2025",
              icon: BookOpen,
            },
            {
              title: "Science Fair",
              date: "April 25, 2025 at 3:00 PM",
              icon: Award,
            },
          ].map((event, index) => (
            <div key={index} className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0">
                <event.icon className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary-700 truncate">
                  {event.title}
                </p>
                <p className="text-xs text-gray-600">{event.date}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button className="bg-white text-primary-600 border border-primary-300 rounded-lg px-2 py-1 text-xs font-medium hover:bg-primary-100 transition-colors">
                  Edit
                </button>
                <button className="bg-white text-red-600 border border-red-300 rounded-lg px-2 py-1 text-xs font-medium hover:bg-red-100 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
