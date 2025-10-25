import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { ChartSkeleton } from "./ChartSkeleton";
import { calculateNiceMaxValue, calculateOptimalTickCount } from "@/utils/functions";

interface ChartDataItem {
  [key: string]: string | number;
}

// Define the types explicitly to match Recharts' expectations
type ValueType = string | number;
type NameType = string;

// Create a custom tooltip component using Recharts' expected props type
const CustomTooltip = ({
  active,
  payload,
  label,
  valueLabel,
}: TooltipProps<ValueType, NameType> & { valueLabel?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-4 border-2 border-primary-400 shadow-lg rounded-lg">
        <p className="font-bold text-lg text-primary-300">{label}</p>
        <p className="text-primary-500 font-bold text-xl">
          {`${valueLabel || "Value"}: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

interface FunChartProps {
  type: "bar" | "column" | "line" | "area" | "pie";
  data: ChartDataItem[];
  xKey: string;
  yKey: string;
  color?: string;
  valueLabel?: string;
  height?: number | string;
  showGrid?: boolean;
  showLegend?: boolean;
  title?: string;
  isLoading?: boolean;
  maxXValue?: number;
  gap?: number;
  customConfig?: {
    barSize?: number;
    [key: string]: string | number | undefined;
  };
}

const FunChart: React.FC<FunChartProps> = ({
  type = "bar",
  data = [],
  xKey = "name",
  yKey = "value",
  color = "#FF5733",
  valueLabel = "",
  height = "100%",
  showGrid = true,
  showLegend = true,
  title = "",
  isLoading = false,
  maxXValue,
  gap,
  customConfig = {},
}) => {
  // Process height prop to ensure it's a valid value
  const processedHeight =
    typeof height === "number" ? height : height || "100%";

  // Default height for calculation when using percentage values
  const defaultCalculationHeight = 400;

  // Calculate effective numerical height for tick count calculation
  const effectiveNumericHeight = useMemo(() => {
    if (typeof processedHeight === "number") {
      return processedHeight;
    }
    // For percentage or other string values, use default
    return defaultCalculationHeight;
  }, [processedHeight]);

  // Calculate title height
  const titleHeight = title ? 40 : 0;

  // Calculate optimal number of ticks based on chart height
  const tickCount = useMemo(() => {
    return calculateOptimalTickCount(effectiveNumericHeight - titleHeight);
  }, [effectiveNumericHeight, titleHeight]);

  // Calculate chart parameters based on data and dimensions
  const { finalMaxValue, finalGap, barSize } = useMemo(() => {
    // Only proceed if we have data
    if (!data || data.length === 0) {
      return {
        finalMaxValue: maxXValue || 10,
        finalGap: gap || 8,
        barSize: customConfig.barSize || 40,
      };
    }

    // Find the maximum value in the data for the target key (yKey)
    let maxDataValue = 0;
    data.forEach((item) => {
      const value = Number(item[yKey]);
      if (!isNaN(value) && value > maxDataValue) {
        maxDataValue = value;
      }
    });

    // Calculate a nice max value for the chart
    const calculatedMax = calculateNiceMaxValue(maxDataValue);

    // Calculate appropriate gap based on the number of data points
    // and available width (estimated)
    const dataCount = data.length;

    // More sophisticated gap calculation that considers chart dimensions
    // The wider the chart and fewer data points, the larger the gap can be
    let calculatedGap;
    if (dataCount <= 2) {
      calculatedGap = 50;
    } else if (dataCount <= 4) {
      calculatedGap = 30;
    } else if (dataCount <= 8) {
      calculatedGap = 15;
    } else if (dataCount <= 16) {
      calculatedGap = 8;
    } else {
      calculatedGap = 4;
    }

    // Calculate optimal bar size based on data count and chart height
    // Taller charts can accommodate wider bars
    let calculatedBarSize;
    const heightFactor = effectiveNumericHeight / defaultCalculationHeight;

    if (dataCount <= 3) {
      calculatedBarSize = 60 * heightFactor;
    } else if (dataCount <= 6) {
      calculatedBarSize = 45 * heightFactor;
    } else if (dataCount <= 10) {
      calculatedBarSize = 35 * heightFactor;
    } else if (dataCount <= 15) {
      calculatedBarSize = 25 * heightFactor;
    } else {
      calculatedBarSize = 15 * heightFactor;
    }

    // Ensure bar size doesn't go below minimum or above maximum
    calculatedBarSize = Math.max(10, Math.min(80, calculatedBarSize));

    // Use provided values if available, otherwise use calculated ones
    return {
      finalMaxValue: maxXValue !== undefined ? maxXValue : calculatedMax,
      finalGap: gap !== undefined ? gap : calculatedGap,
      barSize: customConfig.barSize || calculatedBarSize,
    };
  }, [
    data,
    yKey,
    maxXValue,
    gap,
    customConfig.barSize,
    effectiveNumericHeight,
  ]);

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden font-comic py-4 rounded-3xl shadow-lg bg-primary-50 border-2 border-primary-300 h-96">
        {title && (
          <h2 className="text-center text-2xl font-bold mb-4">{title}</h2>
        )}
        <div className="h-full">
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center w-full border-4 border-dashed border-primary-400 rounded-lg p-8 bg-yellow-50 h-96">
        <p className="text-xl font-bold text-yellow-500">
          No data to show yet!
        </p>
      </div>
    );
  }

  // Common chart configuration
  const commonProps = {
    data,
    ...customConfig,
  };

  // Axis styling
  const axisProps = {
    tick: { fontSize: 16, fontWeight: "bold" },
    axisLine: { stroke: "#666666", strokeWidth: 2 },
    tickLine: false,
  };

  // Generate Y-axis domain based on finalMaxValue
  const getYAxisDomain = () => {
    return [0, finalMaxValue]; // Sets min to 0 and max to the calculated/provided value
  };

  // Create a custom tooltip renderer function that's compatible with Recharts
  const renderCustomTooltip = (props: TooltipProps<ValueType, NameType>) => {
    return <CustomTooltip {...props} valueLabel={valueLabel} />;
  };

  const renderChart = () => {
    switch (type.toLowerCase()) {
      case "bar":
      case "column":
        return (
          <BarChart {...commonProps} barGap={finalGap}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="5 5"
                stroke="#E0E0E0"
                vertical={false}
              />
            )}
            <XAxis dataKey={xKey} {...axisProps} height={50} />
            <YAxis
              {...axisProps}
              width={50}
              domain={getYAxisDomain()}
              tickCount={tickCount} // Use optimal tick count
            />
            <Tooltip content={renderCustomTooltip} />
            {showLegend && (
              <Legend wrapperStyle={{ fontSize: 16, fontWeight: "bold" }} />
            )}
            <Bar
              dataKey={yKey}
              fill={color}
              radius={[8, 8, 0, 0]}
              barSize={barSize}
              animationDuration={1500}
            />
          </BarChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="5 5"
                stroke="#E0E0E0"
                vertical={false}
              />
            )}
            <XAxis dataKey={xKey} {...axisProps} height={50} />
            <YAxis
              {...axisProps}
              width={50}
              domain={getYAxisDomain()}
              tickCount={tickCount} // Use optimal tick count
            />
            <Tooltip content={renderCustomTooltip} />
            {showLegend && (
              <Legend wrapperStyle={{ fontSize: 16, fontWeight: "bold" }} />
            )}
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={4}
              dot={{ fill: color, strokeWidth: 2, r: 8 }}
              activeDot={{ r: 12, fill: color }}
              animationDuration={1500}
            />
          </LineChart>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full w-full border-4 border-dashed border-red-400 rounded-lg p-8 bg-red-50">
            <p className="text-xl font-bold text-red-500">
              Oops! Chart type not found: {type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full overflow-hidden font-comic py-4 rounded-3xl shadow-lg bg-primary-50 border-2 border-primary-300 flex flex-col h-96">
      {title && (
        <h2 className="text-center text-2xl font-bold mb-2">{title}</h2>
      )}
      <div className="flex-grow pr-4">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FunChart;