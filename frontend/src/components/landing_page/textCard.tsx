export const TextCard = ({ children }) => {
  return (
    <div className="text-xl font-medium text-violet-50 p-6 rounded-xl ">
      <p className="text-left">
        {children}
      </p>
    </div>
  )
}
