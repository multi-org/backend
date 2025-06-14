import Queue from './queue';
import { logger } from '@app/utils/logger'

logger.info('Starting job processing worker');
Queue.process();

process.on('SIGTERM', async () => {
    logger.info('Worker shutting down...');
    // Código para encerramento gracioso das filas
    process.exit(0);
});

export default Queue;
