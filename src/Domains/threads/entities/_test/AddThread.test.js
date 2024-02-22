const AddThread = require('../AddThread');

describe('a AddThread entities', () => {
  it('should throw error when payload did not contain right property', () => {
    // Arrange
    const payload = {
      title: 'dicoding',
      content: 'dicoding',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload contain wrong data type', () => {
    // Arrange
    const payload = {
      title: 'dicoding',
      body: 123,
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.PROPERTY_HAVE_WRONG_DATA_TYPE');
  });

  it('should throw error if the title more than 100 character', () => {
    const payload = {
      title: 'dicodingindonesiadicodingindonesiadicodingindonesiadicodingdicodingdicodingdicodingdicodingdicodingdicodingdicoding',
      body: 'this is body',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.TITLE_EXCEED_CHAR_LIMIT');
  });

  it('should create registerUser object correctly', () => {
    // Arrange
    const payload = {
      title: 'dicoding',
      body: 'this is body',
    };

    // Action
    const { title, body } = new AddThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
  });
});