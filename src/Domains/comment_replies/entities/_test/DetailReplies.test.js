const CommentReplyDetails = require("../DetailReplies");

describe("a CommentReplyDetails", () => {
  it("should throw error when payload did not contain right property", () => {
    // Arrange
    const payload = {
      content: "something",
      date: "something",
      username: "something",
    };

    // Action and Assert
    expect(() => new CommentReplyDetails(payload)).toThrowError(
      "COMMENT_REPLY_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload contain wrong data type", () => {
    // Arrange
    const payload = {
      id: "something",
      content: "something",
      date: 123,
      username: "something",
    };

    // Action and Assert
    expect(() => new CommentReplyDetails(payload)).toThrowError(
      "COMMENT_REPLY_DETAILS.PROPERTY_HAVE_WRONG_DATA_TYPE"
    );
  });

  it("should throw error when payload contain wrong data type", () => {
    // Arrange
    const payload = {
      id: "something",
      content: "something",
      date: "something",
      username: "something",
    };

    // Action and Assert
    const commentReplyDetails = new CommentReplyDetails(payload);
    expect(commentReplyDetails).toBeDefined();
    expect(commentReplyDetails).toBeInstanceOf(CommentReplyDetails);
    expect(commentReplyDetails.id).toEqual(payload.id);
    expect(commentReplyDetails.content).toEqual(payload.content);
    expect(commentReplyDetails.date).toEqual(payload.date);
    expect(commentReplyDetails.username).toEqual(payload.username);
  });
});
