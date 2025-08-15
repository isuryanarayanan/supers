"use client";

import { useEffect, useState, useCallback } from "react";
import { postsApi } from "@/lib/posts-api";
import { Post } from "@/types/post";
import { POST_FILTER_TYPES } from "@/lib/constants";
import { PostCard } from "@/components/post/post-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { toast } from "sonner";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const filters: Record<string, unknown> = {};

      if (selectedType && selectedType !== "all") filters.type = selectedType;
      if (showFeaturedOnly) filters.featured = true;

      const response = await postsApi.getPublishedPosts();

      if (response.success && response.data) {
        let filteredPosts = Array.isArray(response.data) ? response.data : [];

        // Apply search filter
        if (searchTerm) {
          filteredPosts = filteredPosts.filter(
            (post: Post) =>
              post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (post.excerpt &&
                post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        setPosts(filteredPosts);
      } else {
        toast.error(response.error || "Failed to load posts");
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [selectedType, showFeaturedOnly, searchTerm]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadPosts();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [loadPosts]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Posts</h1>
        <p className="text-muted-foreground">
          Explore our latest blog posts, projects, and articles.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {POST_FILTER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button
                variant={showFeaturedOnly ? "default" : "outline"}
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFeaturedOnly ? "Show All" : "Featured Only"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                <div className="h-3 bg-muted rounded mb-1"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No posts found.</p>
            {(searchTerm || selectedType !== "all" || showFeaturedOnly) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setShowFeaturedOnly(false);
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {posts.length} post{posts.length !== 1 ? "s" : ""} found
              </span>
              {selectedType && selectedType !== "all" && (
                <Badge variant="secondary">
                  {
                    POST_FILTER_TYPES.find((t) => t.value === selectedType)
                      ?.label
                  }
                </Badge>
              )}
              {showFeaturedOnly && <Badge variant="secondary">Featured</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
