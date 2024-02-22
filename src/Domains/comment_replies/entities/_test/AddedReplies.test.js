const AddedReplies = require('../AddedReplies');

describe('a AddedReplies entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange

    const payload = {
      id: 'reply-123',
      title: 'This is title',
      user: 'dad'
    };

    // Action and Assert
    expect(() => new AddedReplies(payload)).toThrowError('ADDED_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload property did not meet data type needed', () => {
    // Arrange

    const payload = {
      id: 'reply-123',
      content: 'This is title',
      owner: 123,
    };

    // Action and Assert
    expect(() => new AddedReplies(payload)).toThrowError('ADDED_REPLIES.PROPERTY_NOT_MEET_DATA_TYPE_NEEDED');
  });

  it('should create AddedReplies object correctly', () => {
    // Arrange
    const payload = {
        id:'reply-123',
        content:'This is content',
        owner:'user-123'
    };

    // Action
    const addedReplies = new AddedReplies(payload);

    // Assert
    expect(addedReplies.id).toEqual(payload.id);
    expect(addedReplies.content).toEqual(payload.content);
    expect(addedReplies.owner).toEqual(payload.owner);
  });
});