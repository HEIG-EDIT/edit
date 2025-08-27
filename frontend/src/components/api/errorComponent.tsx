export const ErrorComponent = ({ subject }: { subject: string }) => {
  return (
    <p className="text-violet-50 font-bold text-xl">
      Error while fetching {subject}
    </p>
  );
};
