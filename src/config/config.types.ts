export interface Config {
    metrics: {
      port: number;
      host: string;
    };
    octopus: {
      username: string | undefined;
      password: string | undefined;
      api_url: string;
      api_key: string | undefined;
      account_number: string;
      electric: {
        serialNumber: string;
        mpan: string;
        cost: number;
      };
      gas: {
        mprn: string;
        serialNumber: string;
        cost: number;
      };
    };
    influxdb: {
      url: string;
      token: string;
      org: string;
      bucket: string;
    };
    settings: {
      loopTime: number;
      pageSize: number;
      volumeCorrection: number;
      calorificValue: number;
      joulesConversion: number;
    };
    logging: {
      level: string;
      enableFileLogging: boolean;
      logFilePath: string;
      errorLogFilePath: string;
    }
  }
  