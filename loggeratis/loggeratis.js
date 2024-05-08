
exports.GetLogger = (NameFail,  LogsPuth) => 
{  
  try 
  { 
    if(LogsPuth)
    {
      const log4js = require('log4js');

      log4js.configure({
        appenders: {
          console: { type: 'console' },
          file: {
            type: 'file',
            filename: LogsPuth,
            maxLogSize: 10485760,
            backups: 3
          }
        },
        categories: {
          default: { appenders: ['console', 'file'], level: 'trace' }
        }
      });
    
      const logger = log4js.getLogger();

      if(NameFail)
      {
        logger.debug(NameFail + ":  Путь до Лога программы - > " + LogsPuth)
      }
      return logger;
    }
    else
    {
      return undefined;
    }
  } 
  catch (e)
  {
    return undefined;
  }
}
/*
logger.trace('Это сообщение трассировки');
logger.debug('Это сообщение отладки');
logger.info('Это информационное сообщение');
logger.warn('Это предупреждающее сообщение');
logger.error('Это сообщение об ошибке');
logger.fatal('Это фатальное сообщение');
*/