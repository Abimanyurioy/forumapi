const AddCommentReplyUseCase = require("../../../../Applications/use_case/AddRepliesUseCase");
const DeleteRepliesUseCase = require("../../../../Applications/use_case/DeleteRepliesUseCase");

class RepliesHandler {
  constructor(container) {
    this._container = container;
    this.postCommentReplyHandler = this.postCommentReplyHandler.bind(this);
    this.deleteCommentReplyHandler = this.deleteCommentReplyHandler.bind(this);
  }

  async postCommentReplyHandler(request, h) {
    const addCommentReplyUseCase = this._container.getInstance(
      AddCommentReplyUseCase.name
    );
    const { id: ownerId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addedCommentReply = await addCommentReplyUseCase.execute(
      request.payload,
      threadId,
      commentId,
      ownerId
    );

    const response = h.response({
      status: "success",
      data: {
        addedReply: addedCommentReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentReplyHandler(request, h) {
    const deleteRepliesUseCase = this._container.getInstance(
      DeleteRepliesUseCase.name
    );
    const { id: creadentialId } = request.auth.credentials;
    const { threadId, commentId, commentReplyId } = request.params;

    await deleteRepliesUseCase.execute(
      commentReplyId,
      threadId,
      commentId,
      creadentialId
    );

    return {
      status: "success",
    };
  }
  catch(error) {
    console.log(error);
  }
}

module.exports = RepliesHandler;
