import { CustomButton } from "../../components/customButton";

export default function ProjectSelection() {
  return (
    <main className="bg-gray-900 min-h-screen">
      <div className="pl-4 pb-4">
        <p className="text-violet-50 text-3xl">EDIT</p>
      </div>
      <div className="container mx-auto p-4">
        <div className="bg-gray-700 rounded-lg">
          <div className="bg-gray-600 rounded-lg p-2 flex">
            <div className="w-1/3 flex flex-row items-center justify-start">
              <div className="px-4">
                <p className="text-violet-50 font-bold text-xl">Projects</p>
              </div>
              <div className="px-4">
                <CustomButton link="/" text="+" />
              </div>
            </div>

            <div className="w-2/3 flex flex-row items-center justify-end">
              <div className="px-4">
                <div className="pl-2">
                  <p className="text-violet-50">Sort by</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-black text-sm">
                    Last modified TODO : ajouter bouton pour fleche
                  </p>
                </div>
              </div>
              <div className="px-4">
                <button className="bg-violet-300 rounded-lg p-2 flex flex-col gap-[0.2rem]">
                  <div className="bg-black block w-[1rem] h-[0.1rem]" />
                  <div className="bg-black block w-[1rem] h-[0.1rem]" />
                  <div className="bg-black block w-[1rem] h-[0.1rem]" />
                </button>
              </div>
            </div>
          </div>

          <div>
            TODO : boucler sur les projets et afficher component "projet" (a
            creer)
          </div>
        </div>
      </div>
    </main>
  );
}
