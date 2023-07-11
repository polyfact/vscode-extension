import * as assert from "assert";
import * as sinon from "sinon";
import axios from "axios";
import { APIHandler } from "../../api";

import { API_BASE_URL, API_COMMENT_ENDPOINT } from "../../config";

suite("APIHandler Test Suite", () => {
  let apiHandler: APIHandler;
  let axiosStub: sinon.SinonStub;

  setup(() => {
    apiHandler = new APIHandler();
    axiosStub = sinon.stub(axios, "post");
  });

  teardown(() => {
    sinon.restore();
  });

  test("cancelOperation() should cancel axios operation with correct message", () => {
    const cancelStub = sinon.stub(apiHandler["axiosSource"], "cancel");

    apiHandler.cancelOperation(true);
    assert.ok(cancelStub.calledOnceWith("Operation canceled due to an error."));

    apiHandler.cancelOperation(false);
    assert.ok(cancelStub.calledOnceWith("Operation canceled by the user."));
  });

  test("comment() should call axios.post with correct arguments", async () => {
    const response = { data: "Test response" };
    axiosStub.resolves(response);

    const code = "function foo() {}";
    const language = "typescript";
    const accessToken = "test_token";

    const result = await apiHandler.comment(
      code,
      language,
      accessToken,
      "detailed"
    );

    assert.ok(axiosStub.calledOnce);
    const args = axiosStub.getCall(0).args;
    assert.strictEqual(args[0], `${API_BASE_URL}${API_COMMENT_ENDPOINT}`);
    assert.deepStrictEqual(args[1], { code, language });
    assert.deepStrictEqual(args[2], {
      cancelToken: apiHandler["axiosSource"].token,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "x-access-token": accessToken,
      },
    });

    assert.strictEqual(result, response);
  });
});
