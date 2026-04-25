type LogoMarkProps = {
  compact?: boolean;
  className?: string;
};

function LogoMark({ compact = false, className = "" }: LogoMarkProps) {
  const sizeClass = compact ? "h-5 w-5" : "h-6 w-6";

  return (
    <svg
      className={`${sizeClass} shrink-0 ${className}`.trim()}
      viewBox="0 0 32 32"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="7" fill="#0B1120" />
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="6.25" fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="1.5" />
      <path
        d="M8.2 23.7V8.5h5.4l2.5 9.2 2.6-9.2h5.1v15.2h-3.7V14l-2.9 9.7H15L12 14v9.7H8.2Z"
        fill="#FFFFFF"
      />
      <path
        d="M5.2 9.8h6.2v4.3c0 2.1-.3 3.9-1 5.2-.7 1.4-2 2.5-3.9 3.3L5.2 19c1-.4 1.7-.9 2.1-1.5.4-.6.7-1.4.7-2.4H5.2V9.8Z"
        fill="#F15A54"
      />
      <path d="M23.1 6.2h2.5v2.5h-2.5V6.2Zm0 4.1h2.5v2.5h-2.5v-2.5Zm-4.1-4.1h2.5v2.5H19V6.2Z" fill="#A1C4FD" />
      <path d="M19 10.3h2.5v2.5H19v-2.5Z" fill="#C2E9FB" />
    </svg>
  );
}

export default LogoMark;
