class CommentLikesRepository {
    async getCommentLikeIdByOwnerAndCommentId(owner, commentId) {
      throw new Error('COMMENTLIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
  
    async addCommentLike(owner, commentId) {
      throw new Error('COMMENTLIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
  
    async deleteCommentLikeById(likeId) {
      throw new Error('COMMENTLIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async getCommentLikeByCommentId(commentId) {
        throw new Error('COMMENTLIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
      }
  }
  
  module.exports = CommentLikesRepository;