import { LayerReorderingButtonProps } from "@/models/editor/layers/layerReorderingButtonProps";
import colors from "tailwindcss/colors";

export const LayerReorderingButton = ({
  onClick,
  icon: Icon,
  canUse,
}: LayerReorderingButtonProps) => {
  const getIconColor = (canUse: boolean) =>
    canUse ? colors.violet[500] : colors.gray[400];

  const getCursorStyle = (canUse: boolean) => (canUse ? "cursor-pointer" : "");

  return (
    <button className={getCursorStyle(canUse)} onClick={onClick}>
      <Icon fontSize="large" style={{ color: getIconColor(canUse) }} />
    </button>
  );
};
