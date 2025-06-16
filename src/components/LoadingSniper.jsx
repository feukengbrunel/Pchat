export function LoadingSpinner({ text }) {
  return (
    <div className="d-flex align-items-center justify-content-center">
      <div 
        className="spinner-border spinner-border-sm me-2" 
        role="status"
        aria-hidden="true"
      ></div>
      <span>{text}</span>
    </div>
  );
}