import axios from "axios";
import { ContactFormData } from "@/types";


export const contactUs = async (formData: ContactFormData) => {
  const response = await axios.post("/api/contact", formData);
  return response.data.data;
};
