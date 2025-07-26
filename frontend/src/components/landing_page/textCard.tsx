export const TextCard = ({ children }) => {
  return (
    <div className="lg:text-lg xl:text-xl text-base font-regular text-violet-50 p-3 md:p-6">
      <p className="text-left">
        {children}
      </p>
    </div>
  )
}
