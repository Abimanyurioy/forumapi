const AddReplies = require("../../Domains/comment_replies/entities/AddReplies");

class AddRepliesUseCase {
  constructor({
    commentRepliesRepository,
    commentRepository,
    threadRepository,
    userRepository,
  }) {
    this._commentRepliesRepository = commentRepliesRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(
    useCasePayload,
    useCaseThreadId,
    useCaseCommentId,
    useCaseCredential
  ) {
    const { content } = new AddReplies(useCasePayload);
    // to verify it
    await this._commentRepository.verifyCommentAvailability(useCaseCommentId);
    // also to verify it
    await this._threadRepository.verifyThreadAvailability(useCaseThreadId);
    // to verify it
    await this._userRepository.verifyUserAvailability(useCaseCredential);

    return await this._commentRepliesRepository.addCommentReply(
      content,
      useCaseThreadId,
      useCaseCommentId,
      useCaseCredential
    );
  }
}

module.exports = AddRepliesUseCase;
