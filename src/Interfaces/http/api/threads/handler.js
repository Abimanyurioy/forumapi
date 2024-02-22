const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
const GetThreadUseCase = require("../../../../Applications/use_case/GetThreadUseCase");

class ThreadHandler {
  constructor(container) {
    this._containter = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadDetailsHandler = this.getThreadDetailsHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._containter.getInstance(
      AddThreadUseCase.name
    );
    const { id: userId } = request.auth.credentials;
    const addedThread = await addThreadUseCase.execute(request.payload, userId);
    const response = h.response({
      status: "success",
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadDetailsHandler(request, h) {
    const getThreadUseCase = this._containter.getInstance(
      GetThreadUseCase.name
    );
    const { threadId } = request.params;
    const thread = await getThreadUseCase.execute(threadId);
    const response = h.response({
      status: "success",
      data: { thread },
    });

    return response;
  } 
}

module.exports = ThreadHandler;
