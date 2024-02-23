const CommentLikeRepository = require('../../Domains/comment_likes/CommentLikesRepository');

class CommentLikesRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async getCommentLikeIdByOwnerAndCommentId(owner, commentId) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE owner = $1 AND comment_id = $2',
      values: [owner, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return null;
    }

    return result.rows[0].id;
  }

  async addCommentLike(owner, commentId) {
    const id = `commentlike-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3)',
      values: [id, commentId, owner],
    };

    await this._pool.query(query);
  }

  async deleteCommentLikeById(likeId) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE id = $1',
      values: [likeId],
    };

    await this._pool.query(query);
  }

  async getCommentLikeByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(id) AS likes FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return 0;
    }

    return Number(result.rows[0].likes);
  }
  
}

module.exports = CommentLikesRepositoryPostgres;