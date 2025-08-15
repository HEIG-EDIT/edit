import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import { EntryButton } from "@/components/editor/menu/entryButton";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { useRouter } from "next/navigation";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import { MenuEntry } from "@/models/editor/menu/menuEntry";
import { UserSettings } from "./userSettings";
import { EditorSettings } from "./editorSettings";
import { ProjectSettings } from "./projectSettings";
import useOnClickOutside from "@/hooks/useOnClickOutside";

export const Menu = ({
  setMenuDisplay,
}: {
  setMenuDisplay: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = useCallback(() => {
    setMenuDisplay(false);
  }, [setMenuDisplay]);

  useOnClickOutside(containerRef, handleClickOutside);

  const MENU_ENTRIES: Record<string, MenuEntry> = {
    user: {
      name: "user",
      button: {
        icon: <AccountCircleRoundedIcon />,
        text: "User",
        onClick: () => setNameSelectedMenuEntry(MENU_ENTRIES["user"].name),
      },
      associatedComponent: UserSettings,
    },
    editorSettings: {
      name: "editorSettings",
      button: {
        icon: <SettingsRoundedIcon />,
        text: "Editor settings",
        onClick: () =>
          setNameSelectedMenuEntry(MENU_ENTRIES["editorSettings"].name),
      },
      associatedComponent: EditorSettings,
    },
    projectSettings: {
      name: "projectSettings",
      button: {
        icon: <TuneRoundedIcon />,
        text: "Project settings",
        onClick: () =>
          setNameSelectedMenuEntry(MENU_ENTRIES["projectSettings"].name),
      },
      associatedComponent: ProjectSettings,
    },
  };

  const [nameSelectedMenuEntry, setNameSelectedMenuEntry] = useState<string>(
    MENU_ENTRIES["user"].name,
  );

  const MenuEntryConfigurationComponent =
    MENU_ENTRIES[nameSelectedMenuEntry].associatedComponent;

  return (
    <div>
      <div className="fixed inset-0 bg-black opacity-80 z-50" />
      <div className="fixed inset-0 flex justify-center items-center z-100">
        <div
          className="relative bg-gray-600 rounded-2xl border border-violet-300 p-2 w-2/3 h-2/3"
          ref={containerRef}
        >
          <div className="flex flex-row gap-6 p-4 h-full">
            <div className="rounded-2xl bg-gray-900 w-1/3 p-6 flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                {Object.keys(MENU_ENTRIES).map((key) => {
                  const isSelected =
                    MENU_ENTRIES[key].name === nameSelectedMenuEntry;
                  const style = isSelected
                    ? "bg-violet-50 border-2 border-violet-500"
                    : "bg-gray-300";
                  return (
                    <div key={MENU_ENTRIES[key].name}>
                      <EntryButton
                        icon={MENU_ENTRIES[key].button.icon}
                        text={MENU_ENTRIES[key].button.text}
                        onClick={MENU_ENTRIES[key].button.onClick}
                        style={style}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end">
                {/* TODO : comportement du bouton (composant a droite = ? et nouvel onglet ?) pour aller sur la page principale, qui est ? */}
                <EntryButton
                  icon={<HomeRoundedIcon />}
                  text="Home"
                  onClick={() => router.push("./landing_page")}
                  style={"bg-violet-50 border-2 border-violet-500"}
                />
              </div>
            </div>
            <div className="w-2/3">
              <MenuEntryConfigurationComponent />
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <button onClick={() => setMenuDisplay(false)}>
              <CloseRoundedIcon style={{ color: "white", fontSize: "large" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
