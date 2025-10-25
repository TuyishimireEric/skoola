import React, { useState, useRef } from "react";
import { PencilCursor } from "../PencilCursor";

interface MatchingPair {
  left: string;
  right: string;
}

interface LineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  thickness: number;
  isDashed: boolean;
}

interface SelectedItem {
  id: string;
  side: "left" | "right";
  element: HTMLElement;
}
interface CanvasProps {
  pairs: MatchingPair[];
  onComplete: (connections: ConnectionsMap) => void;
}

interface Connection {
  leftId: string;
  rightId: string;
  line: LineProps;
}

interface ConnectionsMap {
  [key: string]: Connection;
}

export const MatchingCanvas: React.FC<CanvasProps> = ({
  pairs,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [connections, setConnections] = useState<ConnectionsMap>({});
  const [tempLine, setTempLine] = useState<LineProps | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showPencil, setShowPencil] = useState(false);

  const lineColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD166",
    "#06D6A0",
    "#118AB2",
    "#9966CC",
    "#FF9F1C",
  ];

  const getRandomColor = () => {
    return lineColors[Math.floor(Math.random() * lineColors.length)];
  };

  // Enhanced function to get connection points instead of centers
  const getItemConnectionPoint = (element: HTMLElement, side: "left" | "right") => {
    const rect = element.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect() || {
      left: 0,
      top: 0,
    };

    return {
      // For left items, connect from the right edge
      // For right items, connect from the left edge
      x: side === "left" 
          ? rect.right - canvasRect.left 
          : rect.left - canvasRect.left,
      // Y position remains at vertical center
      y: rect.top + rect.height / 2 - canvasRect.top,
    };
  };

  const handleMouseEnter = () => {
    setShowPencil(true);
  };

  const handleMouseLeave = () => {
    setShowPencil(false);
  };

  const handleItemClick = (
    id: string,
    side: "left" | "right",
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const element = e.currentTarget as HTMLElement;

    if (!selectedItem) {
      // First item selection
      setSelectedItem({ id, side, element });
    } else {
      // Second item selection - must be from opposite side
      if (selectedItem.side === side) {
        // If clicking on same side, change selection
        setSelectedItem({ id, side, element });
        setTempLine(null);
        return;
      }

      // Create a connection between the two items
      const leftId = side === "right" ? selectedItem.id : id;
      const rightId = side === "left" ? selectedItem.id : id;
      const leftElement = side === "right" ? selectedItem.element : element;
      const rightElement = side === "left" ? selectedItem.element : element;

      // Get proper connection points instead of centers
      const startPos = getItemConnectionPoint(leftElement, "left");
      const endPos = getItemConnectionPoint(rightElement, "right");

      const newLine: LineProps = {
        startX: startPos.x,
        startY: startPos.y,
        endX: endPos.x,
        endY: endPos.y,
        color: getRandomColor(),
        thickness: 6,
        isDashed: false,
      };

      // Remove any existing connections that use either of these items
      const updatedConnections = { ...connections };
      Object.keys(updatedConnections).forEach((key) => {
        if (
          updatedConnections[key].leftId === leftId ||
          updatedConnections[key].rightId === rightId
        ) {
          delete updatedConnections[key];
        }
      });

      // Add the new connection
      updatedConnections[`${leftId}-${rightId}`] = {
        leftId,
        rightId,
        line: newLine,
      };
      setConnections(updatedConnections);
      setSelectedItem(null);
      setTempLine(null);

      // Check if all items are connected
      const leftItems = pairs.map((p) => p.left);
      const connectedLeftItems = Object.values(updatedConnections).map(
        (c) => c.leftId
      );

      if (
        leftItems.length === connectedLeftItems.length &&
        leftItems.every((id) => connectedLeftItems.includes(id))
      ) {
        onComplete(updatedConnections);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect() || {
      left: 0,
      top: 0,
    };
    setMousePosition({
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top,
    });

    if (selectedItem) {
      // Use proper connection point for temporary line
      const startPos = getItemConnectionPoint(selectedItem.element, selectedItem.side);

      setTempLine({
        startX: startPos.x,
        startY: startPos.y,
        endX: e.clientX - canvasRect.left,
        endY: e.clientY - canvasRect.top,
        color: "#FF6B6B",
        thickness: 4,
        isDashed: true,
      });
    }
  };

  const CurvedLine: React.FC<LineProps> = ({
    startX,
    startY,
    endX,
    endY,
    color,
    thickness,
    isDashed,
  }) => {
    // Calculate horizontal distance between points
    const horizontalDistance = Math.abs(endX - startX);
    
    // Adjust control point based on distance between endpoints
    const curveOffset = Math.min(horizontalDistance * 0.3, 50);
    
    // Create a smooth curve with proportional control points
    const pathData = `M ${startX},${startY} 
                      C ${startX + curveOffset},${startY} 
                        ${endX - curveOffset},${endY} 
                        ${endX},${endY}`;
  
    // Calculate path length for animation (approximate)
    const pathLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) * 1.5;
  
    return (
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          filter: isDashed ? "none" : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
        }}
      >
        <style>
          {`
            @keyframes drawLine {
              from {
                stroke-dashoffset: ${pathLength};
              }
              to {
                stroke-dashoffset: 0;
              }
            }
            .line-animation {
              stroke-dasharray: ${pathLength};
              animation: drawLine 1.5s ease-in-out forwards;
            }
          `}
        </style>
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={isDashed ? "5,5" : `${pathLength}`}
          strokeDashoffset={isDashed ? "0" : "0"}
          // className={isDashed ? "" : "line-animation"}
        />
        {!isDashed && (
          <>
            {/* Add a crayon/pencil texture effect */}
            <path
              d={pathData}
              fill="none"
              stroke="white"
              strokeWidth={thickness / 4}
              strokeLinecap="round"
              strokeDasharray="1,8"
              strokeOpacity="0.5"
            />
            {/* Add connector points at both ends */}
            <circle cx={startX} cy={startY} r={thickness / 1.5} fill={color} />
            <circle cx={endX} cy={endY} r={thickness / 1.5} fill={color} />
          </>
        )}
      </svg>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full flex-1 flex flex-row justify-between px-8 cursor-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col gap-4 justify-center w-1/3">
        {pairs.map((pair) => (
          <div
            key={`left-${pair.left}`}
            className={`bg-white p-6 rounded-l-xl shadow-md text-2xl font-bold text-center cursor-none relative overflow-hidden
              ${
                selectedItem?.id === pair.left && selectedItem?.side === "left"
                  ? "border-4 border-primary-400"
                  : "border-2 border-gray-200"
              }
              ${
                Object.values(connections).some((c) => c.leftId === pair.left)
                  ? "bg-yellow-100"
                  : ""
              }
            `}
            onClick={(e) => handleItemClick(pair.left, "left", e)}
            style={{
              boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
            }}
          >
            <div className="item-content">{pair.left}</div>
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-blue-500 opacity-70 rounded-l"></div>
          </div>
        ))}
      </div>

      {/* Connection lines */}
      {Object.values(connections).map(({ line }) => (
        <CurvedLine
          key={`${line.startX}-${line.startY}-${line.endX}-${line.endY}`}
          {...line}
        />
      ))}

      {tempLine && <CurvedLine {...tempLine} />}

      <div className="flex flex-col gap-4 justify-center w-1/3">
        {pairs.map((pair) => (
          <div
            key={`right-${pair.right}`}
            className={`bg-white p-6 rounded-r-xl shadow-md text-2xl font-bold text-center cursor-none relative overflow-hidden
              ${
                selectedItem?.id === pair.right &&
                selectedItem?.side === "right"
                  ? "border-4 border-primary-400"
                  : "border-2 border-gray-200"
              }
              ${
                Object.values(connections).some((c) => c.rightId === pair.right)
                  ? "bg-green-100"
                  : ""
              }
            `}
            onClick={(e) => handleItemClick(pair.right, "right", e)}
            style={{
              boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
            }}
          >
            <div className="item-content">{pair.right}</div>
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-pink-500 opacity-70 rounded-r"></div>
          </div>
        ))}
      </div>

      {showPencil && (
        <div
          style={{
            position: "absolute",
            left: mousePosition.x,
            top: mousePosition.y,
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          <PencilCursor />
        </div>
      )}
    </div>
  );
};