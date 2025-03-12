import { format, transports } from "winston";
import winstonDaily from "winston-daily-rotate-file";

const logDir = __dirname + "/../../logs";
const logFormat = format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`;
});

export const LogConfig = {
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.label({ label: "Plan" }),
        logFormat
    ),
    transports: [
        new winstonDaily({
            level: "info",
            datePattern: "YYYY-MM-DD",
            dirname: logDir,
            filename: "%DATE%.log",
            maxFiles: "14d",
            zippedArchive: true
        }),
        new winstonDaily({
            level: "error",
            datePattern: "YYYY-MM-DD",
            dirname: logDir + "/error",
            filename: "%DATE%.error.log",
            maxFiles: "14d",
            zippedArchive: true
        }),
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ level, label, message }) => `[${label}] ${level}: ${message}`)
            )
        })
    ]
};