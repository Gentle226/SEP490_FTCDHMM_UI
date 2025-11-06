import { Comment, CreateCommentRequest } from '../types/comment.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class CommentService {
  async getComments(recipeId: string): Promise<Comment[]> {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    return response.json();
  }

  async createComment(
    recipeId: string,
    request: CreateCommentRequest,
    token: string,
  ): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create comment: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteComment(recipeId: string, commentId: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete comment: ${response.statusText}`);
    }
  }

  async deleteCommentAsAuthor(recipeId: string, commentId: string, token: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/recipes/${recipeId}/comments/${commentId}/by-author`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to delete comment: ${response.statusText}`);
    }
  }

  async deleteCommentAsAdmin(recipeId: string, commentId: string, token: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/recipes/${recipeId}/comments/${commentId}/manage`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to delete comment: ${response.statusText}`);
    }
  }
}

export const commentService = new CommentService();
