const AddReplies = require('../AddReplies');

describe('a AddReplies entities', () => {
  it('should throw error when payload did not contain right property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new AddReplies(payload)).toThrowError('ADD_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload contain wrong data type', () => {
    // Arrange
    const payload = {
      content: 123,
    };

    // Action and Assert
    expect(() => new AddReplies(payload)).toThrowError('ADD_REPLIES.PROPERTY_HAVE_WRONG_DATA_TYPE');
  });

  it('should throw error when payload is empty string', () => {
    // Arrange
    const payload = {
      content: '    ',
    };

    // Action and Assert
    expect(() => new AddReplies(payload)).toThrowError('ADD_REPLIES.CANNOT_BE_EMPTY_STRING');
  });

  it('should create AddReplies object correctly', () => {
    // Arrange
    const payload = {
      content: 'this is content',
    };

    // Action
    const addReplies = new AddReplies(payload);

    // Assert
    expect(addReplies.content).toEqual(payload.content);
  });
});