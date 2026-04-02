export function LogoMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-full w-full">
      <defs>
        <linearGradient id="learnlore-pages" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#d8ebc4" />
          <stop offset="100%" stopColor="#8db580" />
        </linearGradient>
        <linearGradient id="learnlore-spine" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#5b7a4a" />
          <stop offset="100%" stopColor="#31442a" />
        </linearGradient>
        <linearGradient id="learnlore-star" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#f2ffb9" />
          <stop offset="100%" stopColor="#87d569" />
        </linearGradient>
      </defs>

      <path
        d="M11 41.5c0-3.9 3.4-7.1 7.6-7.1h11.1c1.2 0 2 .8 2 2v12.9c-1.5-1.2-3.8-2-6.4-2H15.9c-2.7 0-4.9-2.6-4.9-5.8Z"
        fill="url(#learnlore-pages)"
        stroke="#5b7a4a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M53 41.5c0-3.9-3.4-7.1-7.6-7.1H34.3c-1.2 0-2 .8-2 2v12.9c1.5-1.2 3.8-2 6.4-2h9.4c2.7 0 4.9-2.6 4.9-5.8Z"
        fill="url(#learnlore-pages)"
        stroke="#5b7a4a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M32 21.5c-4.7 0-8.5 3.9-8.5 8.6v3.8H17c0-9.5 6.5-17 15-18.5 8.5 1.5 15 9 15 18.5h-6.5v-3.8c0-4.7-3.8-8.6-8.5-8.6Z"
        fill="#cfe4c1"
        stroke="#5b7a4a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M32 17.5 34.7 23h5.9l-4.8 3.5 1.8 5.8L32 28.9l-5.6 3.4 1.8-5.8L23.4 23h5.9L32 17.5Z"
        fill="url(#learnlore-star)"
        stroke="#5b7a4a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M32 34v16.5"
        stroke="url(#learnlore-spine)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M25 39.5c2.4-.8 4.7-.8 7 0"
        stroke="#6d9360"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M32 39.5c2.3-.8 4.6-.8 7 0"
        stroke="#6d9360"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M23.5 51.5c2.9-1.3 5.8-1.9 8.5-1.9s5.6.6 8.5 1.9"
        stroke="#5b7a4a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="17" cy="19" r="2.1" fill="#8db580" />
      <circle cx="47" cy="16" r="1.8" fill="#8db580" />
      <circle cx="50" cy="24" r="1.4" fill="#5b7a4a" />
      <circle cx="14.5" cy="26" r="1.4" fill="#5b7a4a" />
      <path
        d="M45.8 27.4 47 30l2.6 1.2-2.6 1.2-1.2 2.6-1.2-2.6-2.6-1.2 2.6-1.2 1.2-2.6Z"
        fill="#d8ebc4"
        stroke="#5b7a4a"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
