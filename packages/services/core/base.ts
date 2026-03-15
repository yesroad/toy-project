import axios, { type AxiosInstance } from 'axios';

export interface ServicesConfig {
  baseURL: string;
}

class BaseServices {
  #axios: AxiosInstance;

  constructor({ baseURL }: ServicesConfig) {
    this.#axios = axios.create({
      timeout: 10000,
      baseURL,
    });
  }

  protected getAxiosInstance(): AxiosInstance {
    return this.#axios;
  }
}

export default BaseServices;
