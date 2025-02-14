import { logger } from './utils';
import { getConfig } from './config';

(async () => {
  logger.info('*'.repeat(80));
  logger.info('Application: Octopus Energy Consumption Monitoring')
  logger.info('Author: Ainsey11')
  logger.info('Source: https://github.com/Ainsey11/octopus-energy-monitor')
  logger.info('*'.repeat(80));
  logger.info('Configuration:');
  
  const config = getConfig();
  for (const [key, value] of Object.entries(config)) {
    logger.info(`${key}: ${JSON.stringify(value)}`);
  }
  
  logger.info('*'.repeat(80));
 
})();

