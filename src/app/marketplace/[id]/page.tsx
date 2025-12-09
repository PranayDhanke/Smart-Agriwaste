import Singlemarketplace from "@/modules/marketplace/Singlemarketplace";

const page = ({ params }: { params: { id: string } }) => {
  return (
    <div>
      <Singlemarketplace id={params.id} />
    </div>
  );
};

export default page;
