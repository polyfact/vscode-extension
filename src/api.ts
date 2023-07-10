import axios from "axios";
import { API_BASE_URL, API_COMMENT_ENDPOINT } from "./config";

export class APIHandler {
  private axiosSource = axios.CancelToken.source();

  public cancelOperation(isError: boolean = false): void {
    if (isError) {
      this.axiosSource.cancel("Operation canceled due to an error.");
    } else {
      this.axiosSource.cancel("Operation canceled by the user.");
    }
  }

  public async comment(
    code: string,
    language: string,
    accessToken: string,
    mode: string
  ): Promise<any> {
    return axios.post(
      `${API_BASE_URL}${API_COMMENT_ENDPOINT}`,
      { code, language, mode },
      {
        cancelToken: this.axiosSource.token,
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "x-access-token": accessToken,
        },
      }
    );
  }
}
