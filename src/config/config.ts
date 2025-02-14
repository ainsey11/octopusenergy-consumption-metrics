import env from 'env-var';
import { Config } from './config.types';
import dotenv from 'dotenv';

// Use local .env file for development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

function getConfig(): Config {
  return {
    metrics: {
      port: env.get('LISTEN_PORT').default(9001).asPortNumber(),
      host: env.get('LISTEN_HOST').default('0.0.0.0').asString(),
    },
    octopus: {
      username: env.get('OCTO_USERNAME').asString(),
      password: env.get('OCTO_PASSWORD').asString(),
      api_url: env.get('OCTO_API_URL').default('https://api.octopus.energy/v1/graphql/').asString(),
      api_key: env.get('OCTO_API_KEY').asString(),
      account_number: env.get('OCTO_ACCOUNT_NUMBER').required().asString(),
      electric: {
        serialNumber: env.get('OCTO_ELECTRIC_SN').required().asString(),
        mpan: env.get('OCTO_ELECTRIC_MPAN').required().asString(),
        cost: env.get('OCTO_ELECTRIC_COST').required().asFloatPositive(),
      },
      gas: {
        mprn: env.get('OCTO_GAS_MPRN').required().asString(),
        serialNumber: env.get('OCTO_GAS_SN').required().asString(),
        cost: env.get('OCTO_GAS_COST').required().asFloatPositive(),
      },
    },
    influxdb: {
      url: env.get('INFLUXDB_URL').required().asString(),
      token: env.get('INFLUXDB_TOKEN').required().asString(),
      org: env.get('INFLUXDB_ORG').required().asString(),
      bucket: env.get('INFLUXDB_BUCKET').required().asString(),
    },
    settings: {
      loopTime: env.get('LOOP_TIME').required().asIntPositive(),
      pageSize: env.get('PAGE_SIZE').required().asIntPositive(),
      volumeCorrection: env.get('VOLUME_CORRECTION').required().asFloatPositive(),
      calorificValue: env.get('CALORIFIC_VALUE').required().asFloatPositive(),
      joulesConversion: env.get('JOULES_CONVERSION').required().asFloatPositive(),
    },
    logging: {
      level: env.get('LOGGING_LEVEL').default('info').asString(),
      enableFileLogging: env.get('ENABLE_FILE_LOGGING').default('false').asBool(),
      logFilePath: env.get('LOG_FILE_PATH').default('logs/app.log').asString(),
      errorLogFilePath: env.get('ERROR_LOG_FILE_PATH').default('logs/error.log').asString(),
    },
  };
}

export { getConfig };
