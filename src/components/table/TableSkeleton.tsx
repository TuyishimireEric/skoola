import { Avatar } from "@mui/material";
import React from "react";

const TableSkeleton = () => {
    return (
      <div className="overflow-x-auto" style={{ height: "calc(100vh - 280px)" }}>
        <table className=" min-w-full font-comic overflow-x-auto mb-12 border-separate border-spacing-1">
        <thead  className="border-b border-primary-500">
              <tr>
                <th
                  className="text-left py-2 px-4 font-semibold text-sm cursor-pointer"
                >
                  #
                </th>
                <th
                  className="text-left py-2 px-4 font-semibold text-sm cursor-pointer"
                >
                  Full Name
                </th>
                <th
                  className="text-left py-2 px-4 font-semibold text-sm cursor-pointer"
                
                >
                  LoginCode 
                </th>
                <th
                  className="text-left py-2 px-4 font-semibold text-sm cursor-pointer"
                
                >
                  Class
                </th>
                <th
                  className="text-left py-2 px-4 font-semibold text-sm cursor-pointer"
                
                >
                Organization
                </th>
                <th
                  className="text-left py-2 px-4 font-semibold text-sm cursor-pointer"
                >
                  Age 
                </th>
                <th
                  className="text-left py-2 px-4 font-semibold text-sm cursor-pointer"
                >
                  Parent Name 
                </th>
                <th
                  className="text-left py-2 px-4 font-semibold text-sm cursor-pointer"
                >
                  Parent Email
                </th>
                <th
                  className="text-left py-2 px-4 font-semibold text-sm cursor-pointer"
                >
                  Last Login 
                </th>
                {/* <th className="text-left py-2 px-4 font-semibold text-sm">
                  Action
                </th> */}
              </tr>
            </thead>
          <tbody>
            {Array.from({ length: 15 }).map((_, index) => (
              <tr key={index} className={` ${ index%2==0?"bg-primary-50":"bg-primary-200"}`}  >
                <td className=" rounded-md h-10 w-1/24"></td>
                <td className=" rounded-md h-10 w-1/6">
                <Avatar sx={{ width: 36, height: 36 }} className="bg-gray-300 skeleton rounded-full"  />
                </td>
                <td className="rounded-md h-10 w-1/24"></td>
                <td className="rounded-md h-10 w-1/8"></td>
                <td className="rounded-md h-10 w-1/8"></td>
                <td className="rounded-md h-10 w-1/8"></td>
                <td className="rounded-md h-10 w-1/8"></td>
                <td className="rounded-md h-10 w-1/8"></td>
                <td className="rounded-md h-10 w-1/8"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
export default TableSkeleton;

