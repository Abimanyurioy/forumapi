const InvariantError = require("../../Commons/exceptions/InvariantError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const CommentRepository = require("../../Domains/comments/CommentRepository");
const AddedComment = require("../../Domains/comments/entities/AddedComment");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(content, threadId, ownerId) {
    const id = `comment-${this._idGenerator()}`;
    const created_at = new Date();
    const is_delete = false;

    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) Returning id, content, owner",
      values: [id, content, ownerId, threadId, created_at, is_delete],
    };

    const result = await this._pool.query(query);

    return new AddedComment({
      id: result.rows[0].id,
      content: result.rows[0].content,
      owner: result.rows[0].owner,
    });
  }

  async getCommentById(commentId) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("comment not found");
    }

    return result.rows[0];
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `
            SELECT 
              c.id,
              c.content,
              c.owner,
              c.thread_id,
              c.created_at,
              c.is_delete
            FROM comments c
            WHERE c.thread_id = $1 
            ORDER BY c.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return [];
    }

    return result.rows;
  }

  async verifyCommentOwner(commentId, ownerId) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("comment not found");
    }

    if (result.rows[0].owner !== ownerId) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async deleteComment(commentId, threadId, ownerId) {
    const query = {
      text: "UPDATE comments SET is_delete = true WHERE id = $1 AND thread_id = $2 AND owner = $3 RETURNING id",
      values: [commentId, threadId, ownerId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("failed to delete comment");
    }
  }

  async verifyCommentAvailability(commentId) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("comment not found");
    }
  }
}

module.exports = CommentRepositoryPostgres;
