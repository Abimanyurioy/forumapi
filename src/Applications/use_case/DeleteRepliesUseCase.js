class DeleteRepliesUseCase {
  constructor({ commentRepliesRepository }) {
    this._commentRepliesRepository = commentRepliesRepository;
  }

  async execute(
    useCaseRepliesId,
    useCaseThreadId,
    useCaseCommentId,
    useCaseCredential
  ) {
    // verify the owner of the comment
    await this._commentRepliesRepository.verifyRepliesOwner(
      useCaseRepliesId,
      useCaseCredential
    );
    // delete comment
    return await this._commentRepliesRepository.deleteCommentReply(
      useCaseRepliesId,
      useCaseThreadId,
      useCaseCommentId,
      useCaseCredential
    );
  }
}

module.exports = DeleteRepliesUseCase;
