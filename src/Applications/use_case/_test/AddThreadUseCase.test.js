const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
    /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange

    const useCasePayload = {
      title: 'Abimanyu is here',
      body: 'This is body for thread',
    };

    const useCaseCredential = {
      id: 'user-123',
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: 'Abimanyu is here',
      owner: 'user-123',
    });

    /** creating dependency of use case*/

    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn().mockImplementation(() => Promise.resolve(mockAddedThread));

    /** creating use case instance */
    const getThreadUsecase = new AddThreadUseCase({ threadRepository: mockThreadRepository });

    //Action
    const addedThread = await getThreadUsecase.execute(useCasePayload, useCaseCredential);

    //Assert
    expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Abimanyu is here',
        owner: 'user-123',
      }))

    // Verify mock function calls
    expect(mockThreadRepository.addThread).toBeCalledWith(useCasePayload, useCaseCredential);
  });
});