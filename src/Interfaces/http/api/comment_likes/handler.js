const LikeCommentUseCase = require("../../../../Applications/use_case/LikeCommentUseCase");

class CommentLikesHandler {
  constructor(container) {
    this._container = container;
    this.putCommentLikeHandler = this.putCommentLikeHandler.bind(this);
  }

  async putCommentLikeHandler(request, h) {
    const likeCommentUseCase = this._container.getInstance(
        LikeCommentUseCase.name
    );
    const { id: ownerId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    await likeCommentUseCase.execute(
      threadId,
      commentId,
      ownerId
    );

    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentLikesHandler;
