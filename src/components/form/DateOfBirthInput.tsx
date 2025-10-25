import { useEffect, useState } from "react";

interface DateOfBirthInputProps {
  setDateOfBirth: (date: string) => void;
  dateOfBirth: string;
}

export const DateOfBirthInput = ({
  setDateOfBirth,
  dateOfBirth,
}: DateOfBirthInputProps) => {
  const [dateParts, setDateParts] = useState({
    day: "",
    month: "",
    year: "",
  });

  const handleDateChange = (part: "day" | "month" | "year", value: string) => {
    const newDateParts = { ...dateParts, [part]: value };
    setDateParts(newDateParts);

    // Only update formData.dateOfBirth if all parts are selected
    if (newDateParts.day && newDateParts.month && newDateParts.year) {
      const formattedDate = `${newDateParts.year}-${newDateParts.month}-${newDateParts.day}`;
      setDateOfBirth(formattedDate);
      //   setFormData({ ...formData, dateOfBirth: formattedDate });
    } else {
      setDateOfBirth("");
      //   setFormData({ ...formData, dateOfBirth: "" });
    }
  };

  // Update dateParts when formData.dateOfBirth changes
  useEffect(() => {
    if (dateOfBirth) {
      const [year, month, day] = dateOfBirth.split("-");
      setDateParts({
        day: day || "",
        month: month || "",
        year: year || "",
      });
    }
  }, [dateOfBirth]);

  return (
    <div className="flex space-x-2">
      {/* Day Selector */}
      <div className="flex-1">
        <select
          value={dateParts.day}
          onChange={(e) => handleDateChange("day", e.target.value)}
          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 text-gray-700 bg-white appearance-none cursor-pointer text-sm"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.7rem center",
            backgroundSize: "1rem",
          }}
        >
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
            <option key={day} value={day.toString().padStart(2, "0")}>
              {day}
            </option>
          ))}
        </select>
      </div>

      {/* Month Selector */}
      <div className="flex-1">
        <select
          value={dateParts.month}
          onChange={(e) => handleDateChange("month", e.target.value)}
          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 text-gray-700 bg-white appearance-none cursor-pointer text-sm"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.7rem center",
            backgroundSize: "1rem",
          }}
        >
          <option value="">Month</option>
          {[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].map((month, index) => (
            <option key={month} value={(index + 1).toString().padStart(2, "0")}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Year Selector */}
      <div className="flex-1">
        <select
          value={dateParts.year}
          onChange={(e) => handleDateChange("year", e.target.value)}
          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 text-gray-700 bg-white appearance-none cursor-pointer text-sm"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.7rem center",
            backgroundSize: "1rem",
          }}
        >
          <option value="">Year</option>
          {(() => {
            const currentYear = new Date().getFullYear();
            const minYear = currentYear - 13; // 13 years old (oldest allowed)
            const maxYear = currentYear - 5; // 5 years old (youngest allowed)
            const years = [];
            for (let year = maxYear; year >= minYear; year--) {
              years.push(year);
            }
            return years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ));
          })()}
        </select>
      </div>
    </div>
  );
};
