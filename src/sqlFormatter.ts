import BigQueryFormatter from 'src/languages/bigquery/bigquery.formatter.js';
import Db2Formatter from 'src/languages/db2/db2.formatter.js';
import HiveFormatter from 'src/languages/hive/hive.formatter.js';
import MariaDbFormatter from 'src/languages/mariadb/mariadb.formatter.js';
import MySqlFormatter from 'src/languages/mysql/mysql.formatter.js';
import N1qlFormatter from 'src/languages/n1ql/n1ql.formatter.js';
import PlSqlFormatter from 'src/languages/plsql/plsql.formatter.js';
import PostgreSqlFormatter from 'src/languages/postgresql/postgresql.formatter.js';
import RedshiftFormatter from 'src/languages/redshift/redshift.formatter.js';
import SparkFormatter from 'src/languages/spark/spark.formatter.js';
import SqliteFormatter from 'src/languages/sqlite/sqlite.formatter.js';
import SqlFormatter from 'src/languages/sql/sql.formatter.js';
import TrinoFormatter from 'src/languages/trino/trino.formatter.js';
import TransactSqlFormatter from 'src/languages/transactsql/transactsql.formatter.js';
import SingleStoreDbFormatter from './languages/singlestoredb/singlestoredb.formatter.js';
import SnowflakeFormatter from './languages/snowflake/snowflake.formatter.js';

import { FormatOptions } from './FormatOptions.js';
import { ParamItems } from './formatter/Params.js';

export const formatters = {
  bigquery: BigQueryFormatter,
  db2: Db2Formatter,
  hive: HiveFormatter,
  mariadb: MariaDbFormatter,
  mysql: MySqlFormatter,
  n1ql: N1qlFormatter,
  plsql: PlSqlFormatter,
  postgresql: PostgreSqlFormatter,
  redshift: RedshiftFormatter,
  singlestoredb: SingleStoreDbFormatter,
  snowflake: SnowflakeFormatter,
  spark: SparkFormatter,
  sql: SqlFormatter,
  sqlite: SqliteFormatter,
  transactsql: TransactSqlFormatter,
  trino: TrinoFormatter,
  tsql: TransactSqlFormatter, // alias for transactsql
};
export type SqlLanguage = keyof typeof formatters;
export const supportedDialects = Object.keys(formatters);

const defaultOptions: FormatOptions = {
  language: 'sql',
  tabWidth: 2,
  useTabs: false,
  keywordCase: 'preserve',
  indentStyle: 'standard',
  logicalOperatorNewline: 'before',
  tabulateAlias: false,
  commaPosition: 'after',
  expressionWidth: 50,
  linesBetweenQueries: 1,
  denseOperators: false,
  newlineBeforeSemicolon: false,
};

/**
 * Format whitespace in a query to make it easier to read.
 *
 * @param {string} query - input SQL query string
 * @param {FormatOptions} cfg Configuration options (see docs in README)
 * @return {string} formatted query
 */
export const format = (query: string, cfg: Partial<FormatOptions> = {}): string => {
  if (typeof query !== 'string') {
    throw new Error('Invalid query argument. Expected string, instead got ' + typeof query);
  }

  const options = validateConfig({
    ...defaultOptions,
    ...cfg,
  });

  const FormatterCls =
    typeof options.language === 'string' ? formatters[options.language] : options.language;

  return new FormatterCls(options).format(query);
};

export class ConfigError extends Error {}

function validateConfig(cfg: FormatOptions): FormatOptions {
  if (typeof cfg.language === 'string' && !supportedDialects.includes(cfg.language)) {
    throw new ConfigError(`Unsupported SQL dialect: ${cfg.language}`);
  }

  if ('multilineLists' in cfg) {
    throw new ConfigError('multilineLists config is no more supported.');
  }
  if ('newlineBeforeOpenParen' in cfg) {
    throw new ConfigError('newlineBeforeOpenParen config is no more supported.');
  }
  if ('newlineBeforeCloseParen' in cfg) {
    throw new ConfigError('newlineBeforeCloseParen config is no more supported.');
  }
  if ('aliasAs' in cfg) {
    throw new ConfigError('aliasAs config is no more supported.');
  }

  if (cfg.expressionWidth <= 0) {
    throw new ConfigError(
      `expressionWidth config must be positive number. Received ${cfg.expressionWidth} instead.`
    );
  }

  if (cfg.commaPosition === 'before' && cfg.useTabs) {
    throw new ConfigError(
      'commaPosition: before does not work when tabs are used for indentation.'
    );
  }

  if (cfg.params && !validateParams(cfg.params)) {
    // eslint-disable-next-line no-console
    console.warn('WARNING: All "params" option values should be strings.');
  }

  return cfg;
}

function validateParams(params: ParamItems | string[]): boolean {
  const paramValues = params instanceof Array ? params : Object.values(params);
  return paramValues.every(p => typeof p === 'string');
}

export type FormatFn = typeof format;
