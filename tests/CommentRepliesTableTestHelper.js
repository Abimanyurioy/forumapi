/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentRepliesTableTestHelper = {
  async addCommentReplies({
    id = 'reply-123',
    content = 'This is reply',
    created_at = new Date(),
    owner = 'user-123',
    thread_id = 'thread-123',
    comment_id = 'comment-123',
    is_delete = false,
  }) {
    const query = {
      text: 'INSERT INTO comment_replies VALUES($1, $2, $3, $4, $5, $6, $7) Returning id, content, owner',
      values: [id, content, owner, thread_id, comment_id, created_at, is_delete],
    };

    await pool.query(query);
  },

  async getCommentRepliesById(commentId) {
    const query = {
      text: 'SELECT * FROM comment_replies WHERE id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_replies WHERE 1=1');
  },
};

module.exports = CommentRepliesTableTestHelper;