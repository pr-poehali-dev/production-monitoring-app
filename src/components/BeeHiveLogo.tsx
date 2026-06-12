interface Props {
  size?: number;
  className?: string;
}

/**
 * Логотип «пчела в шестиугольнике» — только контур, цвет = currentColor.
 * Меняется автоматически при смене темы.
 */
const BeeHiveLogo = ({ size = 36, className = '' }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Шестиугольник-сота */}
    <path
      d="M68 8 L104 28 L104 80 L68 100 L32 80 L32 28 Z"
      stroke="currentColor"
      strokeWidth="7"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Брюшко пчелы (наклонный эллипс) */}
    <ellipse
      cx="44" cy="100" rx="16" ry="23"
      stroke="currentColor" strokeWidth="6.5" fill="none"
      transform="rotate(-20 44 100)"
    />
    {/* Голова */}
    <circle
      cx="72" cy="70" r="10"
      stroke="currentColor" strokeWidth="6.5" fill="none"
    />
    {/* Левое крыло */}
    <ellipse
      cx="42" cy="72" rx="17" ry="9"
      stroke="currentColor" strokeWidth="5.5" fill="none"
      transform="rotate(-30 42 72)"
    />
    {/* Правое крыло */}
    <ellipse
      cx="72" cy="92" rx="17" ry="9"
      stroke="currentColor" strokeWidth="5.5" fill="none"
      transform="rotate(20 72 92)"
    />
  </svg>
);

export default BeeHiveLogo;