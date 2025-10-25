import { CreateSubscriptionData, SubscriptionPlanI } from "@/types";
import axios from "axios";

export const getSubscriptions = async (): Promise<SubscriptionPlanI[]> => {
  const response = await axios.get("/api/subscriptions");
  return response.data.data;
};

export const FC_Subscribe = async (data: CreateSubscriptionData) => {
  const response = await axios.post("/api/subscriptions", data);
  return response.data.data;
};
