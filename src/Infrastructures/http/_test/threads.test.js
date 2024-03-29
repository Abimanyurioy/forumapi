const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const container = require("../../container");
const createServer = require("../createServer");

describe("/threads endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /threads", () => {
    it("should response 201 and return correct added thread", async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: "First Thread",
        body: "This is first thread",
      };

      // Add account
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      const login = {
        username: "dicoding",
        password: "secret",
      };
      // login
      const auth = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: login,
      });

      const {
        data: { accessToken },
      } = JSON.parse(auth.payload);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it("should response 401 if no authorization", async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: "First Thread",
        body: "This is first thread",
      };
      const accessToken = "wrongtoken";

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual("Unauthorized");
    });

    it("should response 400 if bad payload", async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: "First Thread",
      };
      // Add account
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      const login = {
        username: "dicoding",
        password: "secret",
      };
      // login
      const auth = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: login,
      });

      const {
        data: { accessToken },
      } = JSON.parse(auth.payload);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak bisa membuat thread, payload tidak valid"
      );
    });
  });

  describe("when GET /threads/{threadsId}", () => {
    it("it should display the right thread details", async () => {
      // Arrange

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

      const requestPayload = {
        content: "This is reply",
      };

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

      // add comment replies
      await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Action
      const response = await server.inject({
        method: "GET",
        url: `/threads/${threadId}`,
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread).toBeDefined();
    });
  });
});
