const ThreadsTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const CommentRepliesTableTestHelper = require("../../../../tests/CommentRepliesTableTestHelper");
const pool = require("../../database/postgres/pool");
const AddReplies = require("../../../Domains/comment_replies/entities/AddReplies");
const CommentRepliesRepositoryPostgres = require("../CommentRepliesRepositoryPostgres");
const AddedReplies = require("../../../Domains/comment_replies/entities/AddedReplies");
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
    await CommentRepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("addCommentReply function", () => {
    it("should persist added comment reply", async () => {
      // Arrange
      const addReplies = new AddReplies({
        content: "This is a reply",
      });

      const fakeIdGenerator = () => "222";
      const commentReplyRepositoryPostgres =
        new CommentRepliesRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentReplyRepositoryPostgres.addCommentReply(
        addReplies.content,
        threadId,
        commentId,
        userId
      );

      // Assert
      const comment = await CommentRepliesTableTestHelper.getCommentRepliesById(
        "reply-222"
      );

      expect(comment).toHaveLength(1);
    });

    it("should return added comment reply correctly", async () => {
      // Arrange
      const addReplies = new AddReplies({
        content: "This is a reply",
      });

      const fakeIdGenerator = () => "222";
      const commentReplyRepositoryPostgres =
        new CommentRepliesRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedCommentReply =
        await commentReplyRepositoryPostgres.addCommentReply(
          addReplies.content,
          threadId,
          commentId,
          userId
        );

      // Assert

      expect(addedCommentReply).toStrictEqual(
        new AddedReplies({
          id: "reply-222",
          content: "This is a reply",
          owner: userId,
        })
      );
    });
  });

  describe("getCommentReplyById", () => {
    it("should return NotFoundError when comment not found", async () => {
      // Arrange
      const commentReplyRepositoryPostgres =
        new CommentRepliesRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentReplyRepositoryPostgres.getCommentReplyById("wrong-comment")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should return comment correctly", async () => {
      // Arrange
      await CommentRepliesTableTestHelper.addCommentReplies({
        id: "reply-333",
        owner: userId,
        thread_id: threadId,
        comment_id: commentId,
      });
      const commentReplyRepositoryPostgres =
        new CommentRepliesRepositoryPostgres(pool, {});

      // Action
      const comment = await commentReplyRepositoryPostgres.getCommentReplyById(
        "reply-333"
      );

      // Assert
      expect(comment.id).toEqual("reply-333");
      expect(comment.owner).toEqual(userId);
      expect(comment.thread_id).toEqual(threadId);
      expect(comment.comment_id).toEqual(commentId);
      expect(comment.content).toEqual("This is reply");
      expect(comment.is_delete).toEqual(false);
      expect(comment.created_at instanceof Date).toBeTruthy();
    });
  });

  describe("getCommentReplyByCommentId", () => {
    it("should return empty array when comment not found", async () => {
      // Arrange
      const commentReplyRepositoryPostgres =
        new CommentRepliesRepositoryPostgres(pool, {});

      // Action
      const commentReplies =
        await commentReplyRepositoryPostgres.getCommentReplyByCommentId(
          commentId
        );

      // Assert
      expect(Array.isArray(commentReplies)).toBeTruthy();
      expect(commentReplies).toHaveLength(0);
    });

    it("should return comment correctly", async () => {
      // Arrange
      await CommentRepliesTableTestHelper.addCommentReplies({
        id: "reply-333",
        comment_id: commentId,
      });
      await CommentRepliesTableTestHelper.addCommentReplies({
        id: "reply-222",
        comment_id: commentId,
      });
      await CommentRepliesTableTestHelper.addCommentReplies({
        id: "reply-111",
        comment_id: commentId,
      });

      const commentReplyRepositoryPostgres =
        new CommentRepliesRepositoryPostgres(pool, {});

      // Action
      const replies =
        await commentReplyRepositoryPostgres.getCommentReplyByCommentId(
          commentId
        );

      // Assert
      expect(replies).toHaveLength(3);
      expect(replies[0].id).toEqual("reply-333");
      expect(replies[0].comment_id).toEqual(commentId);
      expect(replies[0].owner).toEqual(userId);
      expect(replies[0].thread_id).toEqual(threadId);
      expect(replies[0].content).toEqual("This is reply");
      expect(replies[0].is_delete).toEqual(false);
      expect(replies[0].created_at instanceof Date).toBeTruthy();
      expect(replies[1].id).toEqual("reply-222");
      expect(replies[1].comment_id).toEqual(commentId);
      expect(replies[1].owner).toEqual(userId);
      expect(replies[1].thread_id).toEqual(threadId);
      expect(replies[1].content).toEqual("This is reply");
      expect(replies[1].is_delete).toEqual(false);
      expect(replies[1].created_at instanceof Date).toBeTruthy();
      expect(replies[2].id).toEqual("reply-111");
      expect(replies[2].comment_id).toEqual(commentId);
      expect(replies[2].owner).toEqual(userId);
      expect(replies[2].thread_id).toEqual(threadId);
      expect(replies[2].content).toEqual("This is reply");
      expect(replies[2].is_delete).toEqual(false);
      expect(replies[2].created_at instanceof Date).toBeTruthy();
      
    });
  });

  describe("deleteComment", () => {
    it("should delete comment correctly and persist comment", async () => {
      // Arrange
      await CommentRepliesTableTestHelper.addCommentReplies({
        id: "reply-333",
        owner: userId,
        thread_id: threadId,
        comment_id: commentId,
        is_delete: false,
      });
      const commentReplyRepositoryPostgres =
        new CommentRepliesRepositoryPostgres(pool, {});

      // Action
      await commentReplyRepositoryPostgres.deleteCommentReply(
        "reply-333",
        threadId,
        commentId,
        userId
      );
      const deletedCommentReply =
        await CommentRepliesTableTestHelper.getCommentRepliesById("reply-333");

      // Assert
      expect(deletedCommentReply[0].is_delete).toEqual(true);
    });

    it("should return InvariantError when failed to delete comment", async () => {
      // Arrange
      const commentReplyRepositoryPostgres =
        new CommentRepliesRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentReplyRepositoryPostgres.deleteCommentReply(
          "reply-333",
          "thread-121",
          "comment-111",
          "user-123"
        )
      ).rejects.toThrowError(InvariantError);
    });
  });

  describe("verifyOwnerCommentReplies", () => {
    it("should throw NotFoundError when replies is not found", async () => {
      // Arrange
      const commentRepliesRepository = new CommentRepliesRepositoryPostgres(
        pool,
        {}
      );

      // Act & Assert
      await expect(
        commentRepliesRepository.verifyRepliesOwner("wrong-replies-id", userId)
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw AuthorizationError when user is not the owner of the replies", async () => {
      // Arrange
      const commentRepliesRepository = new CommentRepliesRepositoryPostgres(
        pool,
        {}
      );

      await CommentRepliesTableTestHelper.addCommentReplies({
        id: "reply-444",
        owner: userId,
        thread_id: threadId,
        comment_id: commentId,
        is_delete: false,
      });

      // Act & Assert
      await expect(
        commentRepliesRepository.verifyRepliesOwner(
          "reply-444",
          "wrong-user-id"
        )
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should not throw error when user is the owner of the replies", async () => {
      // Arrange
      const commentRepliesRepository = new CommentRepliesRepositoryPostgres(
        pool,
        {}
      );
      await CommentRepliesTableTestHelper.addCommentReplies({
        id: "reply-555",
        owner: userId,
        thread_id: threadId,
        comment_id: commentId,
        is_delete: false,
      });
      // Act & Assert
      await expect(
        commentRepliesRepository.verifyRepliesOwner("reply-555", userId)
      ).resolves.not.toThrowError(NotFoundError);

      await expect(
        commentRepliesRepository.verifyRepliesOwner("reply-555", userId)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });
});
