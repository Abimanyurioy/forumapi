/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const ThreadTableTestHelper = {
  async addThread({
    id = "thread-123",
    title = "Thread helper",
    body = "This is helper thread",
    owner = "user-123",
    created_at = new Date(),
  }) {
    const query = {
      text: "INSERT INTO threads VALUES($1, $2, $3, $4, $5) Returning id, title, owner",
      values: [id, title, body, owner, created_at],
    };

    await pool.query(query);
  },

  async findThreadById(threadId) {
    const query = {
      text: "SELECT * FROM threads WHERE id = $1",
      values: [threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM threads WHERE 1=1");
  },
};

module.exports = ThreadTableTestHelper;
