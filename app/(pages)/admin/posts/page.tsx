"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { PostsDashboard } from "@/components/admin/posts-dashboard";

export default function AdminPostsPage() {
  return (
    <ProtectedRoute>
      <PostsDashboard />
    </ProtectedRoute>
  );
}
