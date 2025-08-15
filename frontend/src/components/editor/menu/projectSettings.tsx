export const ProjectSettings = () => {
  return (
    // TODO : gerer state et logique pour add / remove user
    <div>
      <p className="text-violet-50 font-bold text-xl mb-6">Project settings</p>
      <div className="bg-gray-700 rounded-xl p-4 w-2/3">
        <p className="text-violet-50 text-center mb-4">Authorized users</p>
        <div className="bg-gray-900 rounded-xl p-2">
          <p className="text-white">Alice</p>
        </div>
      </div>
    </div>
  );
};
