import Singlemarketplace from "@/modules/marketplace/Singlemarketplace";
import { connection } from "next/server";

const page = async () => {
  await connection();
  return (
    <div>
      <Singlemarketplace />
    </div>
  );
};

export default page;
