export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center text-gray-500 py-10">
      <p>{message}</p>
    </div>
  );
}
