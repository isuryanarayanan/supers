export default function ArticlesPage() {
  if (typeof window !== "undefined") {
    window.location.replace("/posts/blog");
  }
  return null;
}
