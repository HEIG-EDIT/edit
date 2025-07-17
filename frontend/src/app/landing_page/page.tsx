import { TitleBlock } from "../../components/landing_page/titleBlock";
import { QuickSummary } from "../../components/landing_page/quickSummary";
import { UiPreview } from "../../components/landing_page/uiPreview";

export default function LandingPage() {
  return (
    <main className="bg-gray-900 min-h-screen pt-1">
      <div className="sticky top-0">
        <TitleBlock />
      </div>
      <div className="mt-24 ml-12">
        <QuickSummary />
      </div>
      <div className="mt-40 flex justify-center">
        <UiPreview />
      </div>
    </main>
  );
}
