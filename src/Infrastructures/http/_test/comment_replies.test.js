const pool = require("../../database/postgres/pool");
const CommentRepliesTableTestHelper = require("../../../../tests/CommentRepliesTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("/threads/{threadId}/comments/{commentId}/replies endpoint", () => {
  // Pre-requisite payload
  const commentPayload = {
    content: "This is comment",
  };

  const threadPayload = {
    title: "First Thread",
    body: "This is first thread",
  };

  const userPayload = {
    username: "dicoding",
    password: "secret",
    fullname: "Dicoding Indonesia",
  };

  const notOwnerPayload = {
    username: "abimanyu",
    password: "secret",
    fullname: "Abimanyu RY",
  };

  const loginPayload = {
    username: "dicoding",
    password: "secret",
  };

  const notOwnerLoginPayload = {
    username: "abimanyu",
    password: "secret",
  };

  const requestPayload = {
    content: "This is reply",
  };

  afterEach(async () => {
    await CommentRepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("when POST /replies", () => {
    it("should response 201 and return correct added comment reply", async () => {
      // Arrange
      const server = await createServer(container);

      // Add account
      await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload,
      });

      // login
      const auth = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: loginPayload,
      });
      const authToken = JSON.parse(auth.payload)?.data?.accessToken;

      // add thread
      const thread = await server.inject({
        method: "POST",
        url: "/threads",
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const threadId = JSON.parse(thread.payload)?.data?.addedThread.id;

      // add comment
      const comment = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const commentId = JSON.parse(comment.payload)?.data?.addedComment.id;

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });

  describe("when delete /replies/{commentReplyId}", () => {
    it("should response 200 with status success", async () => {
      // Arrange
      const server = await createServer(container);

      // Add account
      await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload,
      });
      // login
      const auth = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: loginPayload,
      });
      const authToken = JSON.parse(auth.payload)?.data?.accessToken;

      // add thread
      const thread = await server.inject({
        method: "POST",
        url: "/threads",
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const threadId = JSON.parse(thread.payload)?.data?.addedThread.id;

      // add comment
      const comment = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const commentId = JSON.parse(comment.payload)?.data?.addedComment.id;

      // add comment replies
      const commentReply = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const commentReplyId = JSON.parse(commentReply.payload)?.data?.addedReply
        .id;

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/${commentReplyId}`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it("should throw 403 if user not the owner", async () => {
      // Arrange
      const server = await createServer(container);

      // Add account
      await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload,
      });
      await server.inject({
        method: "POST",
        url: "/users",
        payload: notOwnerPayload,
      });

      // login
      const authOwner = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: loginPayload,
      });
      const authNotOwner = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: notOwnerLoginPayload,
      });

      const ownerToken = JSON.parse(authOwner.payload).data.accessToken;
      const notOwnerToken = JSON.parse(authNotOwner.payload).data.accessToken;

      // add thread
      const thread = await server.inject({
        method: "POST",
        url: "/threads",
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      });
      const threadId = JSON.parse(thread.payload).data.addedThread.id;

      // add comment
      const commentAdded = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      });
      const commentId = JSON.parse(commentAdded.payload).data.addedComment.id;

      // add comment replies
      const commentReply = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      });
      const commentReplyId = JSON.parse(commentReply.payload)?.data?.addedReply
        .id;

      // Action && Assert
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/${commentReplyId}`,
        headers: {
          Authorization: `Bearer ${notOwnerToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
    });
  });
});
