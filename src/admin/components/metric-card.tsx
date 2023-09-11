import { Button, Container, DropdownMenu } from "@medusajs/ui";
import { Menu, MoreVertical } from "lucide-react";

type Props = {
  icon: React.ElementType;
  title: string;
  value: string;
};

const MetricCard = (props: Props) => {
  const { icon, title, value } = props;

  const Icon = icon;

  return (
    <Container className="w-full h-full flex flex-col gap-y-3">
      <div className="flex justify-between">
        <div className="p-2 rounded-lg text-grey-60 border border-grey-20">
          {Icon && <Icon className="w-4 h-4" />}
        </div>

        <DropdownMenu>
          <DropdownMenu.Trigger>
            <MoreVertical size={16} />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Edit</DropdownMenu.Item>
            <DropdownMenu.Item>Add</DropdownMenu.Item>
            <DropdownMenu.Item>Delete</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
      <div className="flex flex-col gap-y-1.5">
        <h3 className="text-xs capitalize text-grey-40">{title}</h3>
        <span className="text-2xl font-medium text-grey-80">{value}</span>
      </div>
    </Container>
  );
};

export default MetricCard;
