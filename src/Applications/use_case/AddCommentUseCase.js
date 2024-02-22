const AddComment = require("../../Domains/comments/entities/AddComment");

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository, userRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload, useCaseThreadId, useCaseCredential) {
    const { content } = new AddComment(useCasePayload);
    // to verify it
    await this._threadRepository.verifyThreadAvailability(useCaseThreadId);
    // to verify it
    await this._userRepository.verifyUserAvailability(useCaseCredential);

    return await this._commentRepository.addComment(
      content,
      useCaseThreadId,
      useCaseCredential
    );
  }
}

module.exports = AddCommentUseCase;
