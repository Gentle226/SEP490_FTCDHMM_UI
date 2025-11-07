import { Comment, CreateCommentRequest } from '../types/comment.types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7116').replace(
  /\/$/,
  '',
);

/**
 * CommentService sử dụng fetch trực tiếp (KHÔNG dùng HttpClient wrapper)
 * để tránh timeout/AbortController ảnh hưởng đến request
 */
class CommentService {
  private readonly TIMEOUT_MS = 60000; // 60 seconds timeout

  async getComments(recipeId: string): Promise<Comment[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/comments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Gửi cookies/credentials
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('[CommentService] getComments error:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack',
      });
      throw err;
    }
  }

  async createComment(
    recipeId: string,
    request: CreateCommentRequest,
    token: string,
  ): Promise<Comment> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/comments`, {
        method: 'POST',
        headers,
        credentials: 'include', // Gửi cookies/credentials
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to create comment: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('[CommentService] createComment error:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack',
      });
      throw err;
    }
  }

  async deleteComment(recipeId: string, commentId: string, token: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/recipes/${recipeId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers,
          credentials: 'include',
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to delete comment: ${response.statusText}`);
      }
    } catch (err) {
      console.error('[CommentService] deleteComment error:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack',
      });
      throw err;
    }
  }

  async deleteCommentAsAuthor(recipeId: string, commentId: string, token: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/recipes/${recipeId}/comments/${commentId}/by-author`,
        {
          method: 'DELETE',
          headers,
          credentials: 'include',
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to delete comment: ${response.statusText}`);
      }
    } catch (err) {
      console.error('[CommentService] deleteCommentAsAuthor error:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack',
      });
      throw err;
    }
  }

  async deleteCommentAsAdmin(recipeId: string, commentId: string, token: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/recipes/${recipeId}/comments/${commentId}/manage`,
        {
          method: 'DELETE',
          headers,
          credentials: 'include',
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to delete comment: ${response.statusText}`);
      }
    } catch (err) {
      console.error('[CommentService] deleteCommentAsAdmin error:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack',
      });
      throw err;
    }
  }
}

export const commentService = new CommentService();
