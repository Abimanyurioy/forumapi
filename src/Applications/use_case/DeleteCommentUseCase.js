class DeleteCommentUseCase {
    constructor({ commentRepository }) {
      this._commentRepository = commentRepository;
    }
  
    async execute(useCaseCommentId, useCaseThreadId, useCaseCredential) {
      
      // verify the owner of the comment
      await this._commentRepository.verifyCommentOwner(useCaseCommentId, useCaseCredential);

      // delete comment
      return await this._commentRepository.deleteComment(useCaseCommentId, useCaseThreadId, useCaseCredential);
    }
  }
  
  module.exports = DeleteCommentUseCase;