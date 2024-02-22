const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const UserRepository = require("../../../Domains/users/UserRepository");
const AddReplies = require("../../../Domains/comment_replies/entities/AddReplies");
const AddedReplies = require("../../../Domains/comment_replies/entities/AddedReplies");
const AddRepliesUseCase = require("../AddRepliesUseCase");
const CommentRepliesRepository = require("../../../Domains/comment_replies/CommentRepliesRepository");

describe("AddRepliesUseCase", () => {
  /**
   * Testing the comment use case
   * can orchestra step by step
   * for adding the new comment correctly
   */

  it("should orchestrating the add comment reply", async () => {
    // Arrange
    const useCasePayload = {
      content: "This is comment",
    };

    const useCaseCredential = {
      id: "user-123",
    };

    const useCaseThreadId = {
      id: "thread-123",
    };

    const useCaseCommentId = {
      id: "comment-123",
    };

    const mockAddedReplies = new AddedReplies({
      id: "reply-123",
      content: useCasePayload.content,
      owner: useCaseCredential.id,
    });

    /** creting dependency of use case */
    const mockCommentRepliesRepository = new CommentRepliesRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockCommentRepository.verifyCommentAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThreadAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockUserRepository.verifyUserAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepliesRepository.addCommentReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedReplies));

    /** create use case instance */
    const addRepliesUseCase = new AddRepliesUseCase({
      commentRepliesRepository: mockCommentRepliesRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const addedReplies = await addRepliesUseCase.execute(
      useCasePayload,
      useCaseThreadId.id,
      useCaseCommentId.id,
      useCaseCredential.id
    );

    // Assert
    expect(addedReplies).toStrictEqual(
      new AddedReplies({
        id: "reply-123",
        content: useCasePayload.content,
        owner: useCaseCredential.id,
      })
    );

    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(
      useCaseCommentId.id
    );
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(
      useCaseThreadId.id
    );
    expect(mockUserRepository.verifyUserAvailability).toBeCalledWith(
      useCaseCredential.id
    );
    expect(mockCommentRepliesRepository.addCommentReply).toBeCalledWith(
      new AddReplies({
        content: useCasePayload.content,
      }).content,
      useCaseThreadId.id,
      useCaseCommentId.id,
      useCaseCredential.id
    );
  });
});
