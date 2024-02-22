const ThreadsTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const AddThread = require("../../../Domains/threads/entities/AddThread");
const pool = require("../../database/postgres/pool");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");

describe("ThreadRepositoryPostgres", () => {
  // Pre-requisite
  const userId = "user-123";

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: userId });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("addThread function", () => {
    it("should persist added thread ", async () => {
      //Arrange
      const addThread = new AddThread({
        title: "Abimanyu Thread",
        body: "Thread pertama",
      });

      const fakeIdGenerator = () => "123";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      //Action
      await threadRepositoryPostgres.addThread(addThread, userId);

      //Assert
      const threads = await ThreadsTableTestHelper.findThreadById("thread-123");
      expect(threads).toHaveLength(1);
    });

    it("should return thread correctly", async () => {
      //Arrange

      const addThread = new AddThread({
        title: "Abimanyu Thread",
        body: "Thread pertama",
      });

      const fakeIdGenerator = () => "123";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      //Action
      const addedThread = await threadRepositoryPostgres.addThread(
        addThread,
        userId
      );

      //Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: "thread-123",
          title: "Abimanyu Thread",
          owner: "user-123",
        })
      );
    });
  });

  describe("getThreadById function", () => {
    it("should throw NotFoundError if no thread found", async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.getThreadById("thread-521")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should get the right thread", async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: "thread-521",
        title: "Thread test",
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById("thread-521");

      // Assert
      expect(Object.keys(thread)).toHaveLength(5);
      expect(thread.id).toEqual("thread-521");
      expect(thread.title).toEqual("Thread test");
      expect(thread.body).toEqual("This is helper thread");
      expect(thread.owner).toEqual("user-123");
      expect(thread.created_at instanceof Date).toBeTruthy();
    });
  });

  describe("verifyThreadAvailability", () => {
    it("should throw NotFoundError when comment is not found", async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadAvailability("wrong-thread-id")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw error when user is the owner of the comment", async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: "thread-555",
        title: "Thread test",
      });

      // Act & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadAvailability("thread-555")
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
});
