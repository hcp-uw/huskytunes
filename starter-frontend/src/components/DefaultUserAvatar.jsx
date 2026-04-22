/**
 * Generic placeholder avatar (Facebook / Letterboxd–style: circle + silhouette).
 * Pass `size` (px) for fixed dimensions, or omit and size via the parent + `className="w-full h-full"`.
 */
export default function DefaultUserAvatar({ className = '', size }) {
  const dims =
    size != null
      ? { width: size, height: size }
      : { width: '100%', height: '100%' };

  return (
    <svg
      className={className}
      {...dims}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <circle cx="50" cy="50" r="50" fill="#E4E6EB" />
      <path
        d="M50 44c7.18 0 13-5.82 13-13s-5.82-13-13-13-13 5.82-13 13 5.82 13 13 13z"
        fill="#BCC0C4"
      />
      <path
        d="M24 86c0-14.36 11.64-26 26-26s26 11.64 26 26v2H24v-2z"
        fill="#BCC0C4"
      />
    </svg>
  );
}

