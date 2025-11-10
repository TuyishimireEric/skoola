interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  color,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div
        className={`bg-primary-50 rounded-3xl p-4 shadow-lg border-2 ${color} overflow-hidden relative font-comic animate-pulse`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-3 rounded-full ${color
              .replace("border", "bg")
              .replace("-300", "-100")}`}
          >
            <Icon className={`w-6 h-6 ${color.replace("border", "text")}`} />
          </div>
          <div className="w-full">
            <h3 className="text-primary-500 text-sm">{label}</h3>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-primary-50 rounded-2xl p-4 shadow-lg border-2 ${color} overflow-hidden relative font-comic`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`p-3 rounded-full ${color
            .replace("border", "bg")
            .replace("-300", "-100")}`}
        >
          <Icon className={`w-6 h-6 ${color.replace("border", "text")}`} />
        </div>
        <div>
          <h3 className="text-primary-500 text-sm">{label}</h3>
          <p className="text-2xl font-bold text-primary-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
