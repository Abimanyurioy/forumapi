const ThreadDetails = require("../../Domains/threads/entities/DetailThread");
const CommentDetails = require("../../Domains/comments/entities/DetailComment");
const CommentReplyDetails = require("../../Domains/comment_replies/entities/DetailReplies");

class GetThreadUseCase {
  constructor({
    userRepository,
    threadRepository,
    commentRepository,
    commentRepliesRepository,
  }) {
    this._userRepository = userRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentRepliesRepository = commentRepliesRepository;
  }

  async execute(useCaseThreadId) {
    // get thread
    const threadFromDb = await this._threadRepository.getThreadById(
      useCaseThreadId
    );

    const threadUsername = await this._userRepository.getUsernameById(
      threadFromDb.owner
    );
    const thread = new ThreadDetails({
      id: threadFromDb.id,
      title: threadFromDb.title,
      body: threadFromDb.body,
      date: threadFromDb.created_at.toString(),
      username: threadUsername,
      comments: [],
    });
    // get comments by thread
    const commentsInThread = await this._commentRepository.getCommentByThreadId(
      thread.id
    );
    // get comment replies by comment
    if (commentsInThread.length > 0) {
      for (const commentData of commentsInThread) {
        const commentUsername =
          await this._userRepository.getUsernameById(commentData.owner);
        const commentDetails = new CommentDetails({
          id: commentData.id,
          content: commentData.is_delete ? '**komentar telah dihapus**' : commentData.content,
          date: commentData.created_at.toString(),
          username: commentUsername,
          replies: [],
        });

        const repliesInComment =
          await this._commentRepliesRepository.getCommentReplyByCommentId(
            commentData.id
          );

        if (repliesInComment.length > 0) {
          for (const replyData of repliesInComment) {
            const replyUsername =
              await this._userRepository.getUsernameById(replyData.owner);
            const commentReplyDetails = new CommentReplyDetails({
              id: replyData.id,
              content: replyData.is_delete ? '**balasan telah dihapus**' :replyData.content,
              date: replyData.created_at.toString(),
              username: replyUsername,
            });

            commentDetails.replies.push(commentReplyDetails);
          }
        }

        thread.comments.push(commentDetails);
      }
    }
    return thread;
  }
}

module.exports = GetThreadUseCase;
