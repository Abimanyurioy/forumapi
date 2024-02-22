const ThreadsTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const pool = require("../../database/postgres/pool");
const AddComment = require("../../../Domains/comments/entities/AddComment");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const InvariantError = require("../../../Commons/exceptions/InvariantError");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("CommentRepositoryPostgres", () => {
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
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("addComment function", () => {
    it("should persist added comment", async () => {
      // Arrange
      const addComment = new AddComment({
        content: "This is a comment",
      });

      const fakeIdGenerator = () => "222";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepositoryPostgres.addComment(
        addComment.content,
        threadId,
        userId
      );

      // Assert
      const comment = await CommentsTableTestHelper.getCommentById(
        "comment-222"
      );

      expect(comment).toHaveLength(1);
    });

    it("should return added comment correctly", async () => {
      // Arrange
      const addComment = new AddComment({
        content: "This is a comment",
      });

      const fakeIdGenerator = () => "222";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        addComment.content,
        threadId,
        userId
      );

      // Assert

      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: "comment-222",
          content: "This is a comment",
          owner: userId,
        })
      );
    });
  });

  describe("getCommentById", () => {
    it("should return NotFoundError when comment not found", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.getCommentById("wrong-comment")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should return comment correctly", async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: "comment-333",
        owner: userId,
        thread_id: threadId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getCommentById(
        "comment-333"
      );

      // Assert
      expect(comment.id).toEqual("comment-333");
      expect(comment.owner).toEqual(userId);
      expect(comment.thread_id).toEqual(threadId);
      expect(comment.content).toEqual("This is comment");
      expect(comment.is_delete).toEqual(false);
      expect(comment.created_at instanceof Date).toBeTruthy();
    });
  });

  describe("getCommentByThreadId", () => {
    it("should return comments correctly", async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: "comment-333",
        owner: userId,
        thread_id: threadId,
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-222",
        owner: userId,
        thread_id: threadId,
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-111",
        owner: userId,
        thread_id: threadId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentByThreadId(
        threadId
      );

      // Assert
      expect(comments).toHaveLength(3);
      expect(comments[0].id).toEqual("comment-333");
      expect(comments[0].owner).toEqual(userId);
      expect(comments[0].thread_id).toEqual(threadId);
      expect(comments[0].content).toEqual("This is comment");
      expect(comments[0].is_delete).toEqual(false);
      expect(comments[0].created_at instanceof Date).toBeTruthy();
      expect(comments[1].id).toEqual("comment-222");
      expect(comments[1].owner).toEqual(userId);
      expect(comments[1].thread_id).toEqual(threadId);
      expect(comments[1].content).toEqual("This is comment");
      expect(comments[1].is_delete).toEqual(false);
      expect(comments[1].created_at instanceof Date).toBeTruthy();
      expect(comments[2].id).toEqual("comment-111");
      expect(comments[2].owner).toEqual(userId);
      expect(comments[2].thread_id).toEqual(threadId);
      expect(comments[2].content).toEqual("This is comment");
      expect(comments[2].is_delete).toEqual(false);
      expect(comments[2].created_at instanceof Date).toBeTruthy();
      
    });

    it("should return empty array if there is no comment correctly", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentByThreadId(
        threadId
      );

      // Assert
      expect(Array.isArray(comments)).toBeTruthy;
      expect(comments).toHaveLength(0);
    });
  });

  describe("verifyOwnerComment", () => {
    it("should throw NotFoundError when comment is not found", async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(
        commentRepository.verifyCommentOwner("wrong-comment-id", userId)
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw AuthorizationError when user is not the owner of the comment", async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Arrange
      await CommentsTableTestHelper.addComment({
        id: "comment-444",
        owner: userId,
        thread_id: threadId,
      });

      // Act & Assert
      await expect(
        commentRepository.verifyCommentOwner("comment-444", "wrong-user-id")
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should not throw error when user is the owner of the comment", async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Arrange
      await CommentsTableTestHelper.addComment({
        id: "comment-555",
        owner: userId,
        thread_id: threadId,
      });

      // Act & Assert
      await expect(
        commentRepository.verifyCommentOwner("comment-555", userId)
      ).resolves.not.toThrowError(NotFoundError);

      await expect(
        commentRepository.verifyCommentOwner("comment-555", userId)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe("deleteComment", () => {
    it("should delete comment correctly and persist comment", async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: "comment-333",
        owner: userId,
        thread_id: threadId,
        is_delete: false,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment(
        "comment-333",
        threadId,
        userId
      );
      const deletedComment = await CommentsTableTestHelper.getCommentById(
        "comment-333"
      );

      // Assert
      expect(deletedComment[0].is_delete).toEqual(true);
    });

    it("should return InvariantError when failed to delete comment", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.deleteComment(
          "comment-111",
          "thread-121",
          "user-123"
        )
      ).rejects.toThrowError(InvariantError);
    });
  });

  describe("verifyCommentAvailability", () => {
    it("should throw NotFoundError when comment is not found", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability("wrong-comment-id")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw error when user is the owner of the comment", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Arrange
      await CommentsTableTestHelper.addComment({
        id: "comment-555",
        owner: userId,
        thread_id: threadId,
      });

      // Act & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability("comment-555")
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
});
