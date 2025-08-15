export const EditorSettings = () => {
  return (
    // TODO : gerer state et logique pour update canvas
    <div>
      <p className="text-violet-50 font-bold text-xl mb-6">Editor settings</p>
      <div className="bg-gray-700 flex items-center justify-between rounded-xl p-4 w-2/3">
        <p className="text-violet-50">Show canvas outline</p>
        <input type="checkbox" checked={true} onChange={() => {}} />
      </div>
    </div>
  );
};
