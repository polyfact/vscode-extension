import axios from "axios";
import { API_BASE_URL, API_COMMENT_ENDPOINT } from "./config";

export class APIHandler {
  private static axiosSource = axios.CancelToken.source();

  public static cancelOperation(): void {
    APIHandler.axiosSource.cancel("Operation canceled by the user.");
  }

  public static async comment(code: string, language: string): Promise<any> {
    return axios.post(
      `${API_BASE_URL}${API_COMMENT_ENDPOINT}`,
      { code, language },
      { cancelToken: APIHandler.axiosSource.token }
    );
  }
}
