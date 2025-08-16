"use client";

import { Post } from "@/types/post";
import { BlogPostCard } from "./blog-post-card";
import { ProjectPostCard } from "./project-post-card";
// Legacy types are routed to BlogPostCard; announcement gets BlogPostCard styling

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
    case "announcement":
      return <BlogPostCard post={post} />;
    case "general":
      // Use BlogPostCard for general writings
      return <BlogPostCard post={post} />;
    default:
      // Fallback for unknown post types
      return <BlogPostCard post={post} />;
  }
}
