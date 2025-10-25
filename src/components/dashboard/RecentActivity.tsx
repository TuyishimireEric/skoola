import { Book, Star } from "lucide-react";

interface Activity {
  GameTitle: string;
  completedOn: string;
  score: number;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => (
  <div className="w-2/5 rounded-3xl p-4 shadow-lg border-4 border-primary-200">
    <h2 className="text-2xl font-bold text-primary-500 mb-4">My Adventures</h2>
    <div className="space-y-2">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 rounded-xl bg-primary-200 border-2 border-white border-opacity-30"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary-300">
              <Book className="w-4 h-4 text-primary-500" />
            </div>
            <div>
              <p className="font-bold text-primary-500">
                {activity.GameTitle}
              </p>
              <p className="text-sm text-primary-500 text-opacity-80">
                {new Date(activity.completedOn).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-primary-400 rounded-lg">
            <Star className="w-5 h-5 text-yellow-300" />
            <span className="font-bold text-white">{activity.score}%</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RecentActivity;
