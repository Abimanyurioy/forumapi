const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, useCaseCredential) {
    const addThread = new AddThread(useCasePayload);
    
    return await this._threadRepository.addThread(addThread, useCaseCredential);
  }
}

module.exports = AddThreadUseCase;