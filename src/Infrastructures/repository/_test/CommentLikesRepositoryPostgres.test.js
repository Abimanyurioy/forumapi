const ThreadsTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");
const pool = require("../../database/postgres/pool");
const CommentLikesRepositoryPostgres = require("../CommentLikesRepositoryPostgres");
const InvariantError = require("../../../Commons/exceptions/InvariantError");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("CommentReplyRepositoryPostgres", () => {
  // Pre-requisite
  const userId = "user-123";
  const threadId = "thread-123";
  const commentId = "comment-123";

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: userId });
    await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
    await CommentsTableTestHelper.addComment({
      id: commentId,
      owner: userId,
      thread_id: threadId,
    });
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("addCommentLikes function", () => {
    it("should persist added comment likes", async () => {
      // Arrange
      const fakeIdGenerator = () => "222";
      const commentLikesRepositoryPostgres =
        new CommentLikesRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentLikesRepositoryPostgres.addCommentLike(
        userId,
        commentId
      );

      // Assert
      const like = await CommentLikesTableTestHelper.getCommentLikeById(
        "commentlike-222"
      );

      expect(like).toHaveLength(1);
    });
  });

  describe('deleteCommentLikeById', () => {
    it('should delete like by id from database', async () => {
      // Arrange
      await CommentLikesTableTestHelper.addCommentLike({
        id: 'commentlike-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const commentLikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool, {});

      // Action
      await commentLikesRepositoryPostgres.deleteCommentLikeById('commentlike-123');

      // Assert
      const likes = await CommentLikesTableTestHelper.getCommentLikeById('commentlike-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('getCommentLikeIdByOwnerAndCommentId', () => {
    it('should return null when not available', async () => {
      // Arrange
      const commentlikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentlikesRepositoryPostgres.getCommentLikeIdByOwnerAndCommentId('user-123', 'comment-456'))
        .resolves.toEqual(null);
    });

    it('should return like id when available', async () => {
      // Arrange
      await CommentLikesTableTestHelper.addCommentLike({
        id: 'commentlike-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const commentlikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentlikesRepositoryPostgres.getCommentLikeIdByOwnerAndCommentId('user-123', 'comment-123'))
        .resolves.toEqual('commentlike-123');
    });
  });

  describe('getCommentLikeByCommentId', () => {
    it('should return 0 when not available', async () => {
      // Arrange
      const commentlikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentlikesRepositoryPostgres.getCommentLikeByCommentId('comment-456'))
        .resolves.toEqual(0);
    });

    it('should return like id when available', async () => {
      // Arrange
      await CommentLikesTableTestHelper.addCommentLike({
        id: 'commentlike-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const commentlikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentlikesRepositoryPostgres.getCommentLikeByCommentId('comment-123'))
        .resolves.toEqual(1);
    });
  });
});
