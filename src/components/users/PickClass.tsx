interface PickClassProps {
  selectedClass: number | null;
  setSelectedClass: (selectedClass: number) => void;
  label?: string;
}

export const userClasses = [1, 2, 3, 4, 5, 6];

export const PickClass: React.FC<PickClassProps> = ({
  selectedClass,
  setSelectedClass,
  label = "Pick Your Class! 🎓",
}) => {
  return (
    <div className="w-full rounded-3xl bg-white/50 p-4 border-4 border-primary-300 shadow-sm mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-primary-600">{label}</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {userClasses
          ?.sort((a, b) => a - b)
          .map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`
            relative overflow-hidden rounded-xl
            transition-all duration-300 ease-in-out
            transform hover:-translate-y-1 hover:shadow-lg
            ${
              selectedClass === cls
                ? "bg-primary-100 border-2 border-primary-400 shadow-md"
                : "bg-white/80 border-2 border-primary-100 hover:border-primary-300"
            }
          `}
            >
              <div className="p-4 flex flex-col items-center justify-center gap-2">
                <span
                  className={`
              text-base font-bold
              ${selectedClass === cls ? "text-primary-600" : "text-primary-500"}
            `}
                >
                  {cls}
                </span>

                {/* Decorative elements for kid-friendly feel */}
                <div
                  className={`
              absolute top-0 left-0 w-full h-1 rounded-t-xl
              bg-gradient-to-r from-primary-300 to-primary-400
              transform transition-transform duration-300
              ${selectedClass === cls ? "scale-100" : "scale-0"}
            `}
                />

                <div
                  className={`
              absolute bottom-0 right-0 w-3 h-3
              bg-primary-400 rounded-full
              transform translate-x-1/2 translate-y-1/2
              ${selectedClass === cls ? "scale-100" : "scale-0"}
              transition-transform duration-300
            `}
                />
              </div>
            </button>
          ))}
      </div>
    </div>
  );
};
