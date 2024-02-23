const pool = require("../../database/postgres/pool");
const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("/threads/{threadId}/comments/{commentId}/likes endpoint", () => {
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

  const loginPayload = {
    username: "dicoding",
    password: "secret",
  };


  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("when PUT /likes", () => {
    it("should response 201 and return correct added comment like", async () => {
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
        method: "PUT",
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });
  });

  describe("when remove /likes", () => {
    it("should response 201 with status success", async () => {
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

      // add comment likes
      await server.inject({
        method: "PUT",
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Action remove comment likes
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });
  });
});
