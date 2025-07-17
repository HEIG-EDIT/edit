export const ProjectSelection = () => {
  return (
    <div className=" bg-gray-800 rounded-lg w-[1000px] overflow-hidden">
      <div>
        <p className="text-violet-50 font-bold text-2xl flex justify-center p-4">
          Store your projects securely and work from anywhere
        </p>
      </div>
      <div className="m-6">
        <img
          className="rounded-lg border-3 border-violet-300"
          src="/landing_page/project_selection.jpg"
        ></img>
      </div>
      <div className="bg-gray-600 rounded-lg mb-7 w-[550px] mx-auto">
        <div className="flex divide-x divide-violet-50 items-center p-4">
          <p className="text-violet-50 text-xs basis-1/2 pr-4">
            Create new projects anytime. Change the sorting behavior to easily
            find your work.
          </p>
          <p className="text-violet-50 text-xs basis-1/2 pl-4">
            Share projects with your team for easy collaboration. Give edition
            access to all authorized users.
          </p>
        </div>
      </div>
    </div>
  );
};
