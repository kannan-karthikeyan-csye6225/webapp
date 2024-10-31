import { StatsD } from 'hot-shots';

const statsdClient = new StatsD({
  host: '127.0.0.1', // assuming StatsD runs locally on the EC2 instance
  port: 8125,
  prefix: 'webapp.', // Prefix for all metrics
});

export default statsdClient;