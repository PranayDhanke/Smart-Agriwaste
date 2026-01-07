import EditWaste from "@/modules/waste/EditWaste";
import { connection } from "next/server";
import React from "react";

const page = async () => {
  await connection();
  return (
    <div>
      <EditWaste />
    </div>
  );
};

export default page;
