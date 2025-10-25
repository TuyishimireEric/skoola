export const ChartSkeleton = () => {
  return (
    <div className="w-full h-full p-4">
      <div className="h-full flex flex-col justify-end">
        <div className="flex items-end justify-around w-full h-3/4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={`skeleton-bar-${i}`}
              className="animate-pulse bg-gray-200 rounded-t-lg"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                width: `${100 / 8}%`,
                maxWidth: "48px",
                minWidth: "12px",
              }}
            ></div>
          ))}
        </div>
        <div className="animate-pulse bg-gray-200 h-2 w-full mt-2"></div>
      </div>
    </div>
  );
};
