import {getOrganizations } from "./services";
import { useQuery } from "@tanstack/react-query";
import { IgetOrganizations } from "./services";

export const useOrganizations= ({page,pageSize,searchText}:IgetOrganizations)=>{
    return useQuery({
        queryKey:["organizations",page,pageSize,searchText],
        queryFn:async()=>{
            const response=await getOrganizations({page,pageSize,searchText});
            return response
        },
        refetchOnMount:false,
        refetchOnWindowFocus:false,
        staleTime:60*60*1000
    })
}