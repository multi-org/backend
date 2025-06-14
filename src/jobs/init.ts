import Queue from './lib/queue';
import { logger } from '@app/utils/logger';

logger.info('Initializing job queues...');
Queue.process();

logger.info('Job queues initialized successfully.');

export default Queue;