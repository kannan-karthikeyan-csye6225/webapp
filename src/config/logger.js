import { createLogger, transports, format } from 'winston'

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.File({ filename: 'logs/combined.log' }), 
        new transports.Console({ format: format.simple() })
    ]
});
export default logger;