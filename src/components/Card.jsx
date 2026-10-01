export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow p-5 ${className}`}>
      {title && <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>}
      {children}
    </div>
  )
}
