import { MOVE_TOOL } from "@/components/editor/tools/move";
import { CROP_TOOL } from "@/components/editor/tools/crop";
import { SELECT_CURSOR_TOOL } from "@/components/editor/tools/select-cursor";
import { PAINT_TOOL } from "@/components/editor/tools/paint";
import { ERASE_TOOL } from "@/components/editor/tools/erase";
import { PAINT_BUCKET_TOOL } from "@/components/editor/tools/paint-bucket";
import { ADJUST_TOOL } from "@/components/editor/tools/adjust";
import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "../tools/toolConfiguration";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TOOLS: Record<string, Tool<any>> = {
  [MOVE_TOOL.name]: MOVE_TOOL,
  [CROP_TOOL.name]: CROP_TOOL,
  [SELECT_CURSOR_TOOL.name]: SELECT_CURSOR_TOOL,
  [PAINT_TOOL.name]: PAINT_TOOL,
  [ERASE_TOOL.name]: ERASE_TOOL,
  [PAINT_BUCKET_TOOL.name]: PAINT_BUCKET_TOOL,
  [ADJUST_TOOL.name]: ADJUST_TOOL,
};

export const TOOLS_INITIAL_STATE: Record<string, ToolConfiguration> = {};
