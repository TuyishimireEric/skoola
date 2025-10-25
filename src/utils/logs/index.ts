// import { UserLog } from "@";
// import client from "../client";

// export const getLogActivity = async (log: UserLog, facilityId: string) => {
//   // const rootPath: AppRouterPaths = log.path.split(".")?.[0] as AppRouterPaths;
//   // switch (rootPath) {
//   //   case "auth":
//   //     return authLogMessage(log);
//   //   case "encounter":
//   //     return await encounterLogMessage(log, facilityId);
//   //   case "carePlan":
//   //     return careplanLogMessage(log, facilityId);
//   //   case "patient":
//   //     return await patientLogMessage(log);
//   //   default:
//   //     return {
//   //       message: log.path,
//   //       links: [],
//   //     };
//   // }

//   return {
//     message: log.path,
//     links: [],
//   };
// };

// export const getPatientInfo = async (id: string, currentFacilityId: string) => {
//   let data = null;
//   try {
//     // const res = await client.getPatientById({
//     //   id,
//     //   facilityId: currentFacilityId,
//     // });
//     data = {
//       name: res.FullName,
//     };
//   } catch (error) {
//     data = null;
//   }
//   return data;
// };
