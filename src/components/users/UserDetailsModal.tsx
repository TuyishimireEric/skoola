// import { useEffect, useState } from "react";
// import Modal from "../Modal/Modal";
// import { PickClass } from "./PickClass";
// import { timestampToDate } from "@/utils/functions";
// import { IoClose } from "react-icons/io5";
// import Avatar from "@mui/material/Avatar/Avatar";
// import { UserInterface } from "@/types/User";
// import { useAssignClass } from "@/hooks/user/useAssignClass";
// import Alert, { AlertType } from "../alerts/Alert";

// const DetailRow: React.FC<{ label: string; value: string }> = ({
//   label,
//   value,
// }) => (
//   <div className="bg-primary-100 p-3 rounded-lg">
//     <span className="text-sm text-gray-500 block">{label}</span>
//     <span className="text-primary-600 font-semibold">{value}</span>
//   </div>
// );

// interface UserDetailsModalProps {
//   user: UserInterface;
//   isOpen: boolean;
//   onClose: () => void;
// }

// const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
//   user,
//   isOpen,
//   onClose,
// }) => {
//   const [activeTab, setActiveTab] = useState<"details" | "classes">("details");
//   const [error, setError] = useState<string | null>(null);
//   const [selectedClass, setSelectedClass] = useState<string | null>(null);
//   const { mutate: assign, isPending, isSuccess } = useAssignClass();

//   useEffect(() => {
//     if (isSuccess) {
//       onClose();
//     }
//   }, [isSuccess]);

//   // useEffect(() => {
//   //   if (user.AssignedClasses.length > 0) {
//   //     const findClass = PrimaryClasses.find(
//   //       (clas) => clas.Name == user.AssignedClasses[0]
//   //     );
//   //     if (findClass) {
//   //       setSelectedClass(findClass.Id);
//   //     }
//   //   }
//   // }, [user]);

//   const handleAssign = () => {
//     if (!selectedClass) {
//       setError("Please select a class to assign");
//       return;
//     }
//     assign({ UserId: user.Id, ClassId: selectedClass });
//   };

//   if (!isOpen || !user) return null;

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} size="xl">
//       <div className="p-6">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center space-x-4">
//             <Avatar
//               alt={user.FullName}
//               src={user.ImageUrl}
//               sx={{ width: 64, height: 64 }}
//             />
//             <div>
//               <h2 className="text-2xl font-bold text-primary-600 font-comic">
//                 {user.FullName}
//               </h2>
//               <p className="text-gray-500">{user.Email}</p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={onClose}
//               className="text-gray-500 hover:text-primary-600"
//             >
//               <IoClose size={32} />
//             </button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="flex mb-6 border-b border-primary-200">
//           <button
//             onClick={() => setActiveTab("details")}
//             className={`px-4 py-2 ${
//               activeTab === "details"
//                 ? "border-b-2 border-primary-600 text-primary-600"
//                 : "text-gray-500"
//             }`}
//           >
//             User Details
//           </button>
//           {user.Role === "teacher" && (
//             <button
//               onClick={() => setActiveTab("classes")}
//               className={`px-4 py-2 ${
//                 activeTab === "classes"
//                   ? "border-b-2 border-primary-600 text-primary-600"
//                   : "text-gray-500"
//               }`}
//             >
//               Classes
//             </button>
//           )}
//         </div>

//         {activeTab === "details" && (
//           <div className="grid grid-cols-2 gap-4">
//             <DetailRow label="Phone" value={user.Phone} />
//             <DetailRow label="Role" value={user.Role} />
//             <DetailRow
//               label="Created On"
//               value={timestampToDate(user.CreatedOn).date}
//             />
//             <DetailRow
//               label="Last Login"
//               value={timestampToDate(user.LastLogin).date}
//             />
//             <DetailRow
//               label="Status"
//               value={user.IsVerified ? "Verified" : "Pending"}
//             />
//             <DetailRow
//               label="Account"
//               value={user.IsVerified ? "Active" : "Inactive"}
//             />
//           </div>
//         )}
// {/* 
//         {activeTab === "classes" && user.Role === "teacher" && (
//           <div className="space-y-4">
//             <PickClass
//               label="Pick a class to assign"
//               selectedClass={selectedClass ?? ""}
//               setSelectedClass={setSelectedClass}
//             />

//             {error && (
//               <div className=" w-full mt-2">
//                 <Alert
//                   alertType={AlertType.DANGER}
//                   title={error}
//                   close={() => setError(null)}
//                   timeOut={2000}
//                 />
//               </div>
//             )} */}
//             <button
//               onClick={handleAssign}
//               disabled={isPending}
//               className="bg-primary-400 w-full text-white p-3 rounded-full hover:bg-primary-300 cursor-pointer font-comic text-lg"
//             >
//               {isPending ? "Assigning ... " : "Assign Class"}
//             </button>
//           </div>
//         )}
//       </div>
//     </Modal>
//   );
// };

// export default UserDetailsModal;
