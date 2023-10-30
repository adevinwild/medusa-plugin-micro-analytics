import { Container } from "@medusajs/ui";

type Props = {
  icon: React.ElementType;
  title: string;
  value: string | number;
};

const SimpleCard = (props: Props) => {
  const { icon, title, value } = props;

  const Icon = icon;

  return (
    <Container className="flex flex-col gap-y-1.5 p-8">
      <div className="flex justify-between">
        <div className="p-2 rounded-lg text-grey-60 border border-grey-20">
          {Icon && <Icon className="w-4 h-4" />}
        </div>
      </div>
      <div className="flex flex-col gap-y-1.5">
        <h3 className="text-xs capitalize text-grey-40">{title}</h3>
        <span className="text-4xl font-black text-grey-80">{value}</span>
      </div>
    </Container>
  );
};

export default SimpleCard;
