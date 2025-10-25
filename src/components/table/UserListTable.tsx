import { ChangeEvent, useEffect, useState } from "react";
import { useUsers } from "@/hooks/user/useUsers";
import Loading from "../loader/Loading";
import { FaEdit } from "react-icons/fa";
import Avatar from "@mui/material/Avatar/Avatar";
import { UserInterface } from "@/types";
import SearchInput from "./SearchInput";
import PaginationTab from "./PaginationTab";

const UserListTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "CreatedOn",
    direction: "desc",
  });

  const { data, isPending, isLoading } = useUsers({
    page,
    pageSize,
    searchText,
    sort: sortConfig.key,
    order: sortConfig.direction,
  });

  useEffect(() => {
    if (data) {
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / pageSize));
    }
  }, [data, pageSize]);

  const showPagination =
    totalPages > 1 &&
    !isPending &&
    Array.isArray(data?.users) &&
    data.users.length > 0;

  const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    setSearchText(e.target.value);
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key)
        return {
          ...prev,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      return { key, direction: "desc" };
    });
  };
  const renderSortArrow = (key: string) => {
    return sortConfig.key === key
      ? sortConfig.direction === "asc"
        ? "▲"
        : "▼"
      : "↕";
  };

  const onPageChange = (e: ChangeEvent<unknown>, page: number) => {
    e.preventDefault();
    setPage(page);
  };

  return (
    <div className="relative h-full">
      <div className="flex items-center justify-between max-h-20">
        <SearchInput
          placeHolder="Search user ..."
          onChange={handleSearch}
          disabled={false}
          value={searchText}
        />
      </div>
      <div
        className=" overflow-auto "
        style={{ height: "calc(100vh - 260px)" }}
      >
        {isLoading ? (
          <Loading overlay={true} fullScreen={false} />
        ) : (
          <table className="min-w-full font-comic">
            <thead className="border-b border-primary-500">
              <tr>
                <th className="text-left py-2 px-4 font-semibold text-sm">#</th>
                <th
                  className="text-left py-2 px-4 font-semibold text-sm"
                  onClick={() => handleSort("FullName")}
                >
                  Full Name {renderSortArrow("FullName")}
                </th>
                <th
                  className="text-left py-2 px-4 font-semibold text-sm"
                  onClick={() => handleSort("Email")}
                >
                  Email {renderSortArrow("Email")}
                </th>
                <th className="text-left py-2 px-4 font-semibold text-sm">
                  Class
                </th>
                <th className="text-left py-2 px-4 font-semibold text-sm">
                  Role
                </th>
                <th className="text-left py-2 px-4 font-semibold text-sm">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {users &&
                users.map((user, index) => (
                  <tr
                    key={user.Id}
                    className={`${
                      index % 2 == 0 ? "" : "bg-primary-100"
                    } text-sm hover:bg-primary-200 rounded-full`}
                  >
                    <td className="text-left py-2 px-4  w-max">
                      {(page - 1) * pageSize + (index + 1)}
                    </td>

                    <td className="text-left py-2 px-4 pl-1 w-max">
                      <div className="flex items-center w-max">
                        <Avatar
                          alt={user.FullName}
                          src={user.ImageUrl}
                          sx={{ width: 36, height: 36 }}
                        />
                        <div className="flex flex-col gap-1 ml-2">
                          <span className="font-semibold">{user.FullName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-left py-2 px-4">{user.Email}</td>
                    <td className="text-left py-2 px-4">
                      {/* {user.CurrentClass} */}
                    </td>
                    <td className="text-left py-2 px-4">{user.Role}</td>

                    <td className="text-left py-2 px-4 space-x-2">
                      <button
                        // onClick={() => openUserDetailsModal(user)}
                        className="bg-primary-400 text-white px-4 py-1 rounded-full flex items-center gap-2 hover:bg-primary-500 transition-colors"
                      >
                        <FaEdit />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
        {showPagination && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <PaginationTab
              count={totalPages}
              ActivePage={page}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListTable;
