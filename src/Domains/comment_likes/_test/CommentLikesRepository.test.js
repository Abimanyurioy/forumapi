const CommentLikesRepository = require("../CommentLikesRepository");

describe("CommentRepliesRepository interface", () => {
  it("should throw error when invoke abstract behaviot", async () => {
    // Arrange
    const commentLikesRepository = new CommentLikesRepository();
    // Action and Assert

    await expect(
        commentLikesRepository.getCommentLikeIdByOwnerAndCommentId("", "")
    ).rejects.toThrowError("COMMENTLIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
        commentLikesRepository.addCommentLike("","")
    ).rejects.toThrowError("COMMENTLIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
        commentLikesRepository.deleteCommentLikeById("")
    ).rejects.toThrowError("COMMENTLIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
        commentLikesRepository.getCommentLikeByCommentId("")
    ).rejects.toThrowError("COMMENTLIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
});
