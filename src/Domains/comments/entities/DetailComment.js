class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, content, date, username, replies, likeCount } = payload;
    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
    this.replies = replies;
    this.likeCount = likeCount;
  }

  _verifyPayload({ id, content, date, username, replies, likeCount }) {
    if (!id || !content || !date || !username  || !replies || typeof likeCount === 'undefined' ) {
      throw new Error("COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY");
    }
    
    if (
      typeof id !== "string" ||
      typeof content !== "string" ||
      typeof date !== "string" ||
      typeof username !== "string" ||
      typeof likeCount !== "number" ||
      !Array.isArray(replies)
    ) {
      throw new Error("COMMENT_DETAILS.PROPERTY_HAVE_WRONG_DATA_TYPE");
    }
  }
}

module.exports = DetailComment;
