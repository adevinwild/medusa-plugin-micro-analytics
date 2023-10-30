import { Select } from "@medusajs/ui";
import { Period } from "../../../../services/micro-analytics";

type Props = {
  period: Period;
  setPeriod: (period: Period) => void;
};

const SelectPeriod = ({ period, setPeriod }: Props) => {
  return (
    <div className="max-w-[10rem] w-full flex items-center justify-end">
      <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
        <Select.Trigger className="bg-white">
          <Select.Value placeholder="Select a timestamp" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value={"day"}>Today</Select.Item>
          <Select.Item value={"week"}>This week</Select.Item>
          <Select.Item value={"month"}>This month</Select.Item>
          <Select.Item value={"year"}>This year</Select.Item>
          <Select.Item value={"all"}>All time</Select.Item>
        </Select.Content>
      </Select>
    </div>
  );
};

export default SelectPeriod;
