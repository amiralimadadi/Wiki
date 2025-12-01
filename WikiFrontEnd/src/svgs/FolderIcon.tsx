// MyCloseIcon.tsx
interface Props {
  className?: string;
  isActive?: boolean;
}

const FolderIcon = ({ className = "", isActive = false }: Props) => {
  return (
    <svg
      className={`${className} transition-colors duration-200`}
      stroke="currentColor"
      fill={isActive ? "white" : "black"}
      strokeWidth="0"
      viewBox="0 0 512 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M113.5 281.2v85.3L256 448l142.5-81.5v-85.3L256 362.7l-142.5-81.5zM256 64L32 192l224 128 183.3-104.7v147.4H480V192L256 64z" />
    </svg>
  );
};

export default FolderIcon;
