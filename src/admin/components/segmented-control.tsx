import { clx } from "@medusajs/ui";
export type SegmentedControlItem = {
  label: string;
  value: string;
};

type Props = {
  className?: string;
  data: SegmentedControlItem[];
  value?: string;
  onChange?: (value: string) => void;
};

const SegmentedControl = (props: Props) => {
  return (
    <div
      className={clx(
        "bg-grey-10 rounded-lg flex items-center gap-x-1.5 p-1.5",
        props.className && props.className
      )}
    >
      {props.data.map((control, idx) => (
        <button
          className={clx(
            "rounded flex items-center transition-all duration-200 justify-center text-sm font-medium text-grey-80 px-3 py-1.5",
            props.value === control.value && "bg-white ring-1 ring-grey-20"
          )}
          key={idx}
          onClick={() => props.onChange && props.onChange(control.value)}
        >
          {control.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
