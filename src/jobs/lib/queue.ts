import Queue from "bull";
import * as jobs from "../index";
import { logger } from "@app/utils/logger";
import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined in environment variables");
}

// Criar conexões Redis compartilhadas para todas as filas
const redisClient = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const redisSubscriber = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

interface job {
  key: string;
  handle({ data }: { data: any }): Promise<{ success: boolean }>;
}

const queues = Object.values(jobs).map((job) => {
  const typeJob = job as job;
  logger.info(`Configuring job queue for ${typeJob.key}`);

  const bullQueue = new Queue(typeJob.key, {
    createClient: (type) => {
      switch (type) {
        case "client":
          return redisClient;
        case "subscriber":
          return redisSubscriber;
        case "bclient":
          return redisClient; // Reutilizar o client principal
        default:
          return redisClient;
      }
    },
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      timeout: 60000, // 60 seconds
    },
  });

  bullQueue.on("error", (error) => {
    logger.error(`Queue error for ${typeJob.key} - ${error.message}`);
  });

  bullQueue
    .isReady()
    .then(() => {
      logger.info(
        `Bull queue for ${typeJob.key} is ready and connected to Redis`,
      );
    })
    .catch((error) => {
      logger.error(
        `Bull queue for ${typeJob.key} failed to connect to Redis - ${error.message}`,
      );
    });

  return {
    name: typeJob.key,
    bull: bullQueue,
    handle: typeJob.handle,
  };
});

export default {
  queues,

  add(jobName: string, data: any, options = {}) {
    const queue = this.queues.find((q) => q.name === jobName);
    if (!queue) {
      logger.error(`Queue ${jobName} not found`);
      throw new Error(`Queue ${jobName} not found`);
    }

    logger.info(`Adding job to queue: ${jobName}`);
    return queue.bull.add(data, options);
  },

  process() {
    return this.queues.forEach((queue) => {
      queue.bull.process(queue.handle);

      queue.bull.on("completed", (job) => {
        logger.info(`Job completed: ${queue.name}, Job ID: ${job.id}`);
      });

      queue.bull.on("failed", (job, error) => {
        logger.error(
          `Job failed: ${queue.name}, Job ID: ${job.id}, Error: ${error.message}`,
        );
      });

      queue.bull.on("stalled", (job) => {
        logger.warn(`Job stalled: ${queue.name}, Job ID: ${job.id}`);
      });
    });
  },

  async getStats() {
    const stats = [];

    for (const queue of this.queues) {
      const countsJobs = await queue.bull.getJobCounts();
      stats.push({
        name: queue.name,
        countsJobs,
      });
    }

    return stats;
  },
};
