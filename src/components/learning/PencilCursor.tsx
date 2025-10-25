export const PencilCursor = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: "absolute",
      pointerEvents: "none",
      zIndex: 9999,
      transform: "translate(-2px, -30px)",
    }}
  >
    <path
      d="M2 28L10 30L28 12L20 4L2 22V28Z"
      fill="#FFDE59"
      stroke="#333"
      strokeWidth="2"
    />
    <path d="M20 4L28 12" stroke="#333" strokeWidth="2" />
    <path d="M18 6L26 14" stroke="#FF6B6B" strokeWidth="1" />
    <path d="M2 28V22L20 4" stroke="#333" strokeWidth="2" />
    <path d="M2 28L10 30" stroke="#333" strokeWidth="2" />
  </svg>
);
