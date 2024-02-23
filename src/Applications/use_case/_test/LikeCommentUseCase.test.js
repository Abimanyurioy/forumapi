const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const UserRepository = require("../../../Domains/users/UserRepository");
const LikeCommentUseCase = require("../LikeCommentUseCase");
const CommentLikesRepository = require("../../../Domains/comment_likes/CommentLikesRepository");

describe("LikeCommentUseCase", () => {
  /**
   * Testing the comment use case
   * can orchestra step by step
   * for adding the new comment correctly
   */

  it("should orchestrating the add comment like", async () => {
    // Arrange
    const useCaseCredential = {
      id: "user-123",
    };

    const useCaseThreadId = {
      id: "thread-123",
    };

    const useCaseCommentId = {
      id: "comment-123",
    };

    /** creting dependency of use case */
    const mockCommentLikesRepository = new CommentLikesRepository();
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
    mockCommentLikesRepository.getCommentLikeIdByOwnerAndCommentId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(null));
    mockCommentLikesRepository.addCommentLike = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** create use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      commentLikesRepository: mockCommentLikesRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    await likeCommentUseCase.execute(
      useCaseThreadId.id,
      useCaseCommentId.id,
      useCaseCredential.id
    );

    // Assert
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(
      useCaseCommentId.id
    );
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(
      useCaseThreadId.id
    );
    expect(mockUserRepository.verifyUserAvailability).toBeCalledWith(
        useCaseCredential.id
    );
    expect(mockCommentLikesRepository.getCommentLikeIdByOwnerAndCommentId)
      .toHaveBeenCalledWith(useCaseCredential.id, useCaseCommentId.id);
    expect(mockCommentLikesRepository.addCommentLike)
      .toHaveBeenCalledWith(useCaseCredential.id, useCaseCommentId.id);
  });

  it("should orchestrating the remove comment like", async () => {
    // Arrange
    const useCaseCredential = {
      id: "user-123",
    };

    const useCaseThreadId = {
      id: "thread-123",
    };

    const useCaseCommentId = {
      id: "comment-123",
    };

    const mockCommentLike = {
      id: "commentlike-123",
    };

    /** creting dependency of use case */
    const mockCommentLikesRepository = new CommentLikesRepository();
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
    mockCommentLikesRepository.getCommentLikeIdByOwnerAndCommentId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockCommentLike.id));
    mockCommentLikesRepository.deleteCommentLikeById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** create use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      commentLikesRepository: mockCommentLikesRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    await likeCommentUseCase.execute(
      useCaseThreadId.id,
      useCaseCommentId.id,
      useCaseCredential.id
    );

    // Assert
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(
      useCaseCommentId.id
    );
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(
      useCaseThreadId.id
    );
    expect(mockUserRepository.verifyUserAvailability).toBeCalledWith(
        useCaseCredential.id
    );
    expect(mockCommentLikesRepository.getCommentLikeIdByOwnerAndCommentId)
      .toHaveBeenCalledWith(useCaseCredential.id, useCaseCommentId.id);
    expect(mockCommentLikesRepository.deleteCommentLikeById)
      .toHaveBeenCalledWith(mockCommentLike.id);
  });
});
