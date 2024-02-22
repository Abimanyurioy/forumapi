const InvariantError = require("../../Commons/exceptions/InvariantError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const CommentRepliesRepository = require("../../Domains/comment_replies/CommentRepliesRepository");
const AddedReplies = require("../../Domains/comment_replies/entities/AddedReplies");

class CommentRepliesRepositoryPostgres extends CommentRepliesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addCommentReply(commentReplyContent, threadId, commentId, ownerId) {
    const id = `reply-${this._idGenerator()}`;
    const created_at = new Date();
    const is_delete = false;

    const query = {
      text: "INSERT INTO comment_replies VALUES($1, $2, $3, $4, $5, $6, $7) Returning id, content, owner",
      values: [
        id,
        commentReplyContent,
        ownerId,
        threadId,
        commentId,
        created_at,
        is_delete,
      ],
    };

    const result = await this._pool.query(query);

    return new AddedReplies({
      id: result.rows[0].id,
      content: result.rows[0].content,
      owner: result.rows[0].owner,
    });
  }

  async getCommentReplyById(commentReplyId) {
    const query = {
      text: "SELECT * FROM comment_replies WHERE id = $1",
      values: [commentReplyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("replies comment not found");
    }

    const comment = result.rows[0];

    return comment;
  }

  async getCommentReplyByCommentId(commentId) {
    const query = {
      text: `
            SELECT 
              cr.id,
              cr.content,
              cr.owner,
              cr.thread_id,
              cr.comment_id,
              cr.created_at,
              cr.is_delete
            FROM comment_replies cr
            WHERE cr.comment_id = $1 
            ORDER BY cr.created_at ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return [];
    }

    return result.rows;
  }

  async deleteCommentReply(repliesId, threadId, commentId, ownerId) {
    const query = {
      text: "UPDATE comment_replies SET is_delete = true WHERE id = $1 AND thread_id = $2 AND owner = $3 AND comment_id = $4 RETURNING id",
      values: [repliesId, threadId, ownerId, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("failed to delete replies comment");
    }
  }

  async verifyRepliesOwner(repliesId, ownerId) {
    const query = {
      text: "SELECT * FROM comment_replies WHERE id = $1",
      values: [repliesId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("comment replies not found");
    }

    if (result.rows[0].owner !== ownerId) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }
}

module.exports = CommentRepliesRepositoryPostgres;
