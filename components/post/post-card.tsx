"use client";

import { Post } from "@/types/post";
import { BlogPostCard } from "./blog-post-card";
import { ProjectPostCard } from "./project-post-card";

interface PostCardProps {
  post: Post;
  variant?: "default" | "compact";
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  // Route to the appropriate component based on post type
  switch (post.type) {
    case "blog":
      return <BlogPostCard post={post} />;
    case "project":
      return <ProjectPostCard post={post} variant={variant} />;
    default:
      // Fallback for unknown post types (use BlogPostCard as default)
      return <BlogPostCard post={post} />;
  }
}
