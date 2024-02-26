class LikeCommentUseCase {
  constructor({ commentLikesRepository, commentRepository, threadRepository, userRepository }) {
    this._commentLikesRepository = commentLikesRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCaseThreadId, useCaseCommentId, useCaseCredential) {
    // to verify it
    await this._threadRepository.verifyThreadAvailability(useCaseThreadId);
    // to verify it
    await this._commentRepository.verifyCommentAvailability(useCaseCommentId);
    // to verify it
    await this._userRepository.verifyUserAvailability(useCaseCredential);

    const likeId = await this._commentLikesRepository.getCommentLikeIdByOwnerAndCommentId(useCaseCredential, useCaseCommentId);
    if (!likeId) {
      return this._commentLikesRepository.addCommentLike(useCaseCredential, useCaseCommentId);
    }
    return this._commentLikesRepository.deleteCommentLikeById(likeId);
  }
}

module.exports = LikeCommentUseCase;
