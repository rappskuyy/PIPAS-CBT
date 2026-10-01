// Ikon Google (Material Symbols). Pakai: <Icon name="school" />
export default function Icon({ name, className = '' }) {
  return <span className={`material-symbols-outlined align-middle ${className}`} style={{ fontSize: 20 }}>{name}</span>
}
