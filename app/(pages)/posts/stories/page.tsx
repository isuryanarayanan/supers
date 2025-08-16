export default function StoriesPage() {
  if (typeof window !== "undefined") {
    window.location.replace("/posts/general");
  }
  return null;
}
