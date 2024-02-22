const CommentRepliesRepository = require("../../../Domains/comment_replies/CommentRepliesRepository");
const DeleteRepliesUseCase = require("../DeleteRepliesUseCase");

describe("DeleteRepliesUseCase", () => {
  it("should orchestrating the delete comment reply", async () => {
    // Arrange
    const useCaseCommentReplyId = "reply-212";
    const useCaseCommentId = "comment-212";
    const useCaseThreadId = "thread-212";
    const useCaseCredential = "user-212";

    const commentAvailable = {
      id: useCaseCommentReplyId,
      owner: useCaseCredential,
    };

    /** creating dependency of use case */
    const mockCommentReplyRepository = new CommentRepliesRepository();

    /** mocking needed fucntion */
    mockCommentReplyRepository.verifyRepliesOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentReplyRepository.deleteCommentReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** create use case instance */
    const deleteCommentReplyUseCase = new DeleteRepliesUseCase({
      commentRepliesRepository: mockCommentReplyRepository,
    });

    // Action
    await deleteCommentReplyUseCase.execute(
      useCaseCommentReplyId,
      useCaseThreadId,
      useCaseCommentId,
      useCaseCredential
    );

    // Assert
    expect(mockCommentReplyRepository.verifyRepliesOwner).toBeCalledWith(
      useCaseCommentReplyId,
      useCaseCredential
    );
    expect(mockCommentReplyRepository.deleteCommentReply).toBeCalledWith(
      useCaseCommentReplyId,
      useCaseThreadId,
      useCaseCommentId,
      useCaseCredential
    );
  });
});
