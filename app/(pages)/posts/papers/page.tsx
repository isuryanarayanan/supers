export default function PapersPage() {
  if (typeof window !== "undefined") {
    window.location.replace("/posts/blog");
  }
  return null;
}
