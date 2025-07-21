import { NavBar } from "../../components/landing_page/navBar";
import { QuickSummary } from "../../components/landing_page/quickSummary";
import { Emojis } from "../../components/landing_page/emojis";
import { UiPreview } from "../../components/landing_page/uiPreview";
import { ProjectSelection } from "../../components/landing_page/projectSelection";

export default function LandingPage() {
  return (
    <main className="bg-gray-900 min-h-screen">
      <div className="sticky top-0 px-4 z-30">
        <NavBar />
      </div>
      <div className="container mx-auto p-4">
        <div className="pt-20 flex flex-col lg:flex-row items-center">
          <div>
            <QuickSummary />
          </div>
          <div className="pl-0 pt-4 lg:pl-20">
            <Emojis />
          </div>
        </div>
        <div className="pt-20">
          <UiPreview />
        </div>
        <div className="pt-20 pb-20">
          <ProjectSelection />
        </div>
      </div>
    </main>
  );
}
