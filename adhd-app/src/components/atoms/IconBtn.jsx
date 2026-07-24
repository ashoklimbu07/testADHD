export default function IconBtn({ onClick, children, style, ...rest }) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontFamily: 'inherit', ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
