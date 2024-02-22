const CommentRepliesRepository = require("../../../Domains/comment_replies/CommentRepliesRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const UserRepository = require("../../../Domains/users/UserRepository");
const GetThreadUseCase = require("../GetThreadUseCase");

describe("GetThreadUseCase", () => {
  it("should orchestrating get the details thread", async () => {
    // Arrange
    const userArnold = {
      id: "user-111",
      username: "Arnold Szechuan",
    };
    const mockUserArnold = "Arnold Szechuan";
    const userDhh = {
      id: "user-222",
      username: "DHH",
    };
    const mockUserDHH = "DHH";
    const mockThreadData = {
      id: "thread-123",
      title: "this is title thread",
      body: "this is body",
      created_at: "2023-07-18 20:38:31.448",
      owner: "user-111",
    };

    const commentData = [
      {
        id: "comment-123",
        content: "this is first",
        created_at: "2023-08-17 20:38:31.448",
        owner: "user-111",
        thread_id: "thread-123",
        is_delete: false,
      },
      {
        id: "comment-124",
        content: "this is second without reply",
        created_at: "2023-08-17 20:38:31.448",
        owner: "user-111",
        thread_id: "thread-123",
        is_delete: false,
      },
      {
        id: "comment-125",
        content: "this is third without reply",
        created_at: "2023-08-17 20:38:31.448",
        owner: "user-111",
        thread_id: "thread-123",
        is_delete: true,
      },
    ];

    const replyData = [
      {
        id: "reply-123",
        content: "this is first reply",
        created_at: "2023-08-18 20:38:31.448",
        owner: "user-222",
        comment_id: "comment-123",
        thread_id: "thread-123",
        is_delete: false,
      },
      {
        id: "reply-124",
        content: "this is second reply",
        created_at: "2023-08-18 20:38:31.448",
        owner: "user-111",
        comment_id: "comment-123",
        thread_id: "thread-123",
        is_delete: true,
      },
      {
        id: "reply-125",
        content: "this is third reply",
        created_at: "2023-08-18 20:38:31.448",
        owner: "user-111",
        comment_id: "comment-123",
        thread_id: "thread-123",
        is_delete: false,
      },
      {
        id: "reply-126",
        content: "this is fourth reply",
        created_at: "2023-08-18 20:38:31.448",
        owner: "user-111",
        comment_id: "comment-123",
        thread_id: "thread-123",
        is_delete: false,
      },
    ];

    /** creting dependency of use case */
    const mockCommentRepliesRepository = new CommentRepliesRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThreadData));
    mockUserRepository.getUsernameById = jest.fn().mockImplementation((userId) => {
      if (userId === "user-111") {
        return Promise.resolve(mockUserArnold);
      }
      if (userId === "user-222") {
        return Promise.resolve(mockUserDHH);
      }
    });
    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(commentData));
    mockCommentRepliesRepository.getCommentReplyByCommentId = jest
      .fn()
      .mockImplementation((commentId) => {
        if (commentId === "comment-123") {
          return Promise.resolve(replyData);
        }
        return Promise.resolve([]);
      });

    /** create use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      commentRepliesRepository: mockCommentRepliesRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const threadDetails = await getThreadUseCase.execute("thread-123");
    // Assert
    expect(threadDetails.comments).toHaveLength(3);
    expect(threadDetails.comments[0].content).toEqual("this is first");
    expect(threadDetails.comments[2].content).toEqual(
      "**komentar telah dihapus**"
    );
    expect(threadDetails.comments[0].replies).toHaveLength(4);
    expect(threadDetails.comments[0].replies[0].username).toBe(
      userDhh.username
    );
    expect(threadDetails.comments[0].replies[1].username).toBe(
      userArnold.username
    );
    expect(threadDetails.comments[0].replies[0].content).toEqual(
      "this is first reply"
    );
    expect(threadDetails.comments[0].replies[1].content).toEqual(
      "**balasan telah dihapus**"
    );

    // Assert thread details
    expect(threadDetails.id).toEqual(mockThreadData.id);
    expect(threadDetails.title).toEqual(mockThreadData.title);
    expect(threadDetails.body).toEqual(mockThreadData.body);
    expect(threadDetails.date).toEqual(mockThreadData.created_at.toString());
    expect(threadDetails.username).toEqual(userArnold.username);

    // Assert comments availability and details
    expect(threadDetails.comments[0].id).toEqual(commentData[0].id);
    expect(threadDetails.comments[0].content).toEqual(
      commentData[0].is_delete
        ? "**komentar telah dihapus**"
        : commentData[0].content
    );
    expect(threadDetails.comments[0].date).toEqual(
      commentData[0].created_at.toString()
    );
    expect(threadDetails.comments[0].username).toEqual(userArnold.username);

    // Assert replies availability and details
    expect(threadDetails.comments[0].replies[0].id).toEqual(replyData[0].id);
    expect(threadDetails.comments[0].replies[0].content).toEqual(
      replyData[0].is_delete
        ? "**balasan telah dihapus**"
        : replyData[0].content
    );
    expect(threadDetails.comments[0].replies[0].date).toEqual(
      replyData[0].created_at.toString()
    );
    expect(threadDetails.comments[0].replies[0].username).toEqual(
      userDhh.username
    );

    // Verify mock function calls
    expect(mockThreadRepository.getThreadById).toBeCalledWith("thread-123");
    expect(mockUserRepository.getUsernameById).toBeCalledWith("user-111");
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(
      "thread-123"
    );
    expect(
      mockCommentRepliesRepository.getCommentReplyByCommentId
    ).toBeCalledWith("comment-123");
  });

  it("should orchestrating get the details thread if there no comment", async () => {
    // Arrange
    const userArnold = {
      id: "user-111",
      username: "Arnold Szechuan",
    };
    const mockUserArnold = "Arnold Szechuan";
    const userDhh = {
      id: "user-222",
      username: "DHH",
    };
    const mockUserDHH = "DHH";
    const mockThreadData = {
      id: "thread-123",
      title: "this is title thread",
      body: "this is body",
      created_at: "2023-07-18 20:38:31.448",
      owner: "user-111",
    };

    const commentData = [];

    /** creting dependency of use case */
    const mockCommentRepliesRepository = new CommentRepliesRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThreadData));
    mockUserRepository.getUsernameById = jest.fn().mockImplementation((userId) => {
      if (userId === "user-111") {
        return Promise.resolve(mockUserArnold);
      }
      if (userId === "user-222") {
        return Promise.resolve(mockUserDHH);
      }
    });
    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(commentData));

    /** create use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      commentRepliesRepository: mockCommentRepliesRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const threadDetails = await getThreadUseCase.execute("thread-123");
    // Assert
    expect(threadDetails.comments).toHaveLength(0);
    // Assert thread details
    expect(threadDetails.id).toEqual(mockThreadData.id);
    expect(threadDetails.title).toEqual(mockThreadData.title);
    expect(threadDetails.body).toEqual(mockThreadData.body);
    expect(threadDetails.date).toEqual(mockThreadData.created_at.toString());
    expect(threadDetails.username).toEqual(userArnold.username);
    expect(threadDetails.comments).toEqual(commentData);

    // Verify mock function calls
    expect(mockThreadRepository.getThreadById).toBeCalledWith("thread-123");
    expect(mockUserRepository.getUsernameById).toBeCalledWith("user-111");
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(
      "thread-123"
    );
  });
});
