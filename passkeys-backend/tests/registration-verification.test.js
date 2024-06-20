const axios = require('axios');
const helpers = require('../../test/test-helper');

jest.mock('axios');

const testEvent = {
  id: '12345',
  attestationObject: {},
  rawId: 'randomRawId',
  clientDataJson: {},
  transports: 'test-transport',
};

describe('registration/verification', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/services/helpers.js',
      '../assets/services/helpers.private.js'
    );
    helpers.setup({}, runtime);
    handlerFunction = require('../functions/registration/verification').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => {
    jest.resetModules();
    axios.post.mockClear();
  });

  describe('when multiple required parameters are missing', () => {
    it('returns an error indicating multiple missing parameters', (done) => {
      const callback = (_, { _body, _statusCode }) => {
        expect(_statusCode).toBeDefined();
        expect(_body).toBeDefined();
        expect(_statusCode).toEqual(400);
        expect(_body).toEqual(
          `Missing parameters; please provide: 'id, attestationObject, rawId, clientDataJson, transports'.`
        );
        done();
      };
      handlerFunction({}, {}, callback);
    });

    it('returns an error indicating specific missing parameters', (done) => {
      const callback = (_, { _body, _statusCode }) => {
        expect(_statusCode).toBeDefined();
        expect(_body).toBeDefined();
        expect(_statusCode).toEqual(400);
        expect(_body).toEqual(
          `Missing parameters; please provide: 'attestationObject, clientDataJson, transports'.`
        );
        done();
      };
      handlerFunction(
        {},
        {
          id: '123',
          rawId: '123',
        },
        callback
      );
    });
  });

  describe('When response are unsuccesfull', () => {
    it('returns error with unsuccesfull request', (done) => {
      const expectedError = new Error('something bad happened');
      axios.post = jest.fn(() => Promise.reject(expectedError));

      const callback = (_, { _body }) => {
        expect(_body).toBeDefined();
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(_body).toEqual(expectedError.message);
        done();
      };

      handlerFunction({}, testEvent, callback);
    });
  });
});
