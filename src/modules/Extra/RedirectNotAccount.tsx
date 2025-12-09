"use client";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RedirectNotAccount = () => {
  const { user } = useUser();

  const router = useRouter();

  const role = user?.unsafeMetadata.role;

  useEffect(() => {
    const checkAccount = async () => {
      if (role === "farmer") {
        const userId = user?.id.replace("user_", "fam_");
        const response = await axios.get(`/api/profile/farmer/get/${userId}`);
        const account = response.data?.accountdata;
        if (!account) {
          router.push("/create-account/farmer");
          return;
        }
      }

      if (role === "buyer") {
        const userId = user?.id.replace("user_", "buy_");
        const response = await axios.get(`/api/profile/buyer/get/${userId}`);
        const account = response.data?.accountdata;
        if (!account) {
          router.push("/create-account/buyer");
          return;
        }
      }
    };

    checkAccount();
  }, [role , router , user]);
  return "";
};

export default RedirectNotAccount;
