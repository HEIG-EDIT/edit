export const TextCard = ({ children }) => {
  return (
    <div className="text-xl font-medium text-violet-50 p-6">
      <p className="text-left">
        {children}
      </p>
    </div>
  )
}
