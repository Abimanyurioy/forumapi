/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async addCommentLike({
    id = 'commentlike-123',
    owner = 'user-123',
    comment_id = 'comment-123',
  }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, comment_id, owner],
    };

    await pool.query(query);
  },

  async getCommentLikeById(commentId) {
    const query = {
        text: 'SELECT * FROM comment_likes WHERE id = $1',
        values: [commentId],
      };
  
      const result = await pool.query(query);
      return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;