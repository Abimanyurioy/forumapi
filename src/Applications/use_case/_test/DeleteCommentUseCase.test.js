const CommentRepository = require("../../../Domains/comments/CommentRepository");
const DeleteCommentUseCase = require("../DeleteCommentUseCase");

describe("DeleteCommentUseCase", () => {
  it("should orchestrating the delete comment", async () => {
    // Arrange
    const useCaseCommentId = "comment-212";
    const useCaseThreadId = "thread-212";
    const useCaseCredential = "user-212";

    const commentAvailable = {
      id: useCaseCommentId,
      user_id: useCaseCredential,
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed fucntion */
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** create use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(
      useCaseCommentId,
      useCaseThreadId,
      useCaseCredential
    );

    // Assert
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      useCaseCommentId,
      useCaseCredential
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      useCaseCommentId,
      useCaseThreadId,
      useCaseCredential
    );
  });
});
