#!/usr/bin/env python3
"""
Database Manager for Gate of Memory

This script provides a comprehensive set of tools for managing the database,
including optimization, health checks, and maintenance tasks.
"""
import os
import sys
import time
import logging
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple

# Third-party imports
try:
    import psycopg2
    from psycopg2 import sql
    from psycopg2 import extensions as pg_ext
except ImportError:
    psycopg2 = None
    sql = None
    pg_ext = None

try:
    import sqlalchemy
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.exc import SQLAlchemyError
    from sqlalchemy.pool import QueuePool
    from sqlalchemy.engine import Engine
    from sqlalchemy.orm import Session
except ImportError:
    sqlalchemy = None
    create_engine = None
    text = None
    sessionmaker = None
    SQLAlchemyError = None
    QueuePool = None
    Engine = None
    Session = None

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('database_manager.log')
    ]
)
logger = logging.getLogger(__name__)

class DatabaseManager:
    """Handles database operations, optimization, and health checks."""
    
    def __init__(self, db_url: Optional[str] = None):
        """Initialize the database manager with a connection URL."""
        self.db_url = db_url or os.getenv('DATABASE_URL')
        if not self.db_url:
            raise ValueError("Database URL not provided and DATABASE_URL environment variable not set")
        
        # Parse the database URL
        self.db_params = self._parse_db_url(self.db_url)
        self.engine = None
        self.Session = None
    
    def _parse_db_url(self, db_url: str) -> Dict[str, str]:
        """Parse a database URL into connection parameters."""
        from urllib.parse import urlparse, parse_qs
        
        result = urlparse(db_url)
        params = {
            'dbname': result.path[1:],  # Remove leading '/'
            'user': result.username,
            'password': result.password,
            'host': result.hostname,
            'port': str(result.port) if result.port else '5432',
        }
        
        # Parse query parameters for additional options
        query = parse_qs(result.query)
        for key in ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']:
            if key in query:
                params[key] = query[key][0]
        
        return params
    
    def connect(self) -> bool:
        """Establish a connection to the database."""
        try:
            self.engine = create_engine(self.db_url)
            self.Session = sessionmaker(bind=self.engine)
            # Test the connection
            with self.engine.connect() as conn:
                conn.execute(text('SELECT 1'))
            logger.info("Successfully connected to the database")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to database: {str(e)}")
            return False
    
    def _format_size(self, size_bytes: Union[int, str, float]) -> str:
        """Format size in bytes to human readable format.
        
        Args:
            size_bytes: Size in bytes to format
            
        Returns:
            Formatted size string with appropriate unit (B, KB, MB, GB, TB, PB)
        """
        try:
            size_bytes = int(size_bytes)
            for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
                if size_bytes < 1024.0:
                    return f"{size_bytes:.2f} {unit}"
                size_bytes /= 1024.0
            return f"{size_bytes:.2f} PB"
        except (ValueError, TypeError) as e:
            logger.warning(f"Error formatting size: {e}")
            return "0 B"
    
    def get_database_size(self) -> str:
        """Get the size of the database.
        
        Returns:
            Formatted database size string or "Unknown" if an error occurs
        """
        try:
            with self.engine.connect() as conn:
                result = conn.execute(
                    text("""
                    SELECT pg_size_pretty(pg_database_size(current_database()))
                    """
                )
                return result.scalar() or "0 B"
        except Exception as e:
            logger.error(f"Error getting database size: {str(e)}")
            return "Unknown"
    
    def get_table_sizes(self) -> List[Dict[str, str]]:
        """Get sizes of all tables in the database."""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(
                    text("""
                    SELECT 
                        table_name,
                        pg_size_pretty(pg_total_relation_size(table_schema || '.' || table_name)) as size,
                        pg_size_pretty(pg_relation_size(table_schema || '.' || table_name)) as table_size,
                        pg_size_pretty(pg_total_relation_size(table_schema || '.' || table_name) - 
                                      pg_relation_size(table_schema || '.' || table_name)) as index_size,
                        (SELECT reltuples::bigint FROM pg_class WHERE oid = (table_schema || '.' || table_name)::regclass) as row_count
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    ORDER BY pg_total_relation_size(table_schema || '.' || table_name) DESC;
                    """
                )
                return [dict(row) for row in result.mappings()]
        except Exception as e:
            logger.error(f"Error getting table sizes: {str(e)}")
            return []
    
    def analyze_tables(self) -> bool:
        """Run ANALYZE on all tables to update statistics."""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("ANALYZE"))
                logger.info("Successfully analyzed all tables")
                return True
        except Exception as e:
            logger.error(f"Error analyzing tables: {str(e)}")
            return False
    
    def vacuum_tables(self, full: bool = False, analyze: bool = True) -> bool:
        """Run VACUUM on all tables to reclaim storage and update statistics."""
        try:
            with self.engine.connect() as conn:
                vacuum_cmd = "VACUUM (VERBOSE, ANALYZE)" if analyze else "VACUUM (VERBOSE)"
                if full:
                    vacuum_cmd = "VACUUM FULL (VERBOSE, ANALYZE)"
                conn.execute(text(vacuum_cmd))
                logger.info("Successfully vacuumed all tables")
                return True
        except Exception as e:
            logger.error(f"Error vacuuming tables: {str(e)}")
            return False
    
    def reindex_database(self) -> bool:
        """Rebuild all indexes in the database."""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("REINDEX DATABASE " + self.db_params['dbname']))
                logger.info("Successfully reindexed the database")
                return True
        except Exception as e:
            logger.error(f"Error reindexing database: {str(e)}")
            return False
    
    def check_connection_pool(self) -> Dict[str, Union[int, str]]:
        """Check the database connection pool status."""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(
                    text("""
                    SELECT 
                        count(*) as total_connections,
                        count(*) FILTER (WHERE state = 'active') as active_connections,
                        count(*) FILTER (WHERE state = 'idle') as idle_connections,
                        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction_connections,
                        count(*) FILTER (WHERE state = 'idle in transaction (aborted)') as aborted_transaction_connections,
                        count(*) FILTER (WHERE state = 'fastpath function call') as fastpath_function_connections,
                        count(*) FILTER (WHERE state = 'disabled') as disabled_connections
                    FROM pg_stat_activity
                    WHERE datname = :dbname
                    """),
                    {'dbname': self.db_params['dbname']}
                )
                return dict(result.mappings().first())
        except Exception as e:
            logger.error(f"Error checking connection pool: {str(e)}")
            return {}
    
    def get_long_running_queries(self, threshold_seconds: int = 60) -> List[Dict]:
        """Get queries that have been running longer than the threshold.
        
        Args:
            threshold_seconds: Minimum duration in seconds to consider a query as long-running
            
        Returns:
            List of dictionaries containing query information
        """
        try:
            return self._execute_sql("""
                SELECT 
                    pid,
                    now() - query_start as duration,
                    query,
                    state,
                    usename,
                    application_name,
                    client_addr
                FROM pg_stat_activity
                WHERE now() - query_start > interval ':threshold seconds'
                AND state != 'idle'
                ORDER BY duration DESC;
            """, {'threshold': str(threshold_seconds)})
        except Exception as e:
            logger.error(f"Error getting long running queries: {str(e)}")
            return []
    
    def cancel_query(self, pid: int) -> bool:
        """Cancel a running query by process ID."""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("SELECT pg_cancel_backend(:pid)"), {'pid': pid})
                logger.info(f"Successfully cancelled query with PID {pid}")
                return True
        except Exception as e:
            logger.error(f"Error cancelling query: {str(e)}")
            return False
    
    def terminate_connection(self, pid: int) -> bool:
        """Terminate a database connection by process ID."""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("SELECT pg_terminate_backend(:pid)"), {'pid': pid})
                logger.info(f"Successfully terminated connection with PID {pid}")
                return True
        except Exception as e:
            logger.error(f"Error terminating connection: {str(e)}")
            return False
    
    def get_index_usage(self) -> List[Dict]:
        """Get index usage statistics."""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(
                    text("""
                    SELECT 
                        schemaname as schema_name,
                        relname as table_name,
                        indexrelname as index_name,
                        idx_scan as index_scans,
                        idx_tup_read as tuples_read,
                        idx_tup_fetch as tuples_fetched,
                        pg_size_pretty(pg_relation_size(indexrelid)) as index_size
                    FROM pg_stat_user_indexes
                    JOIN pg_statio_user_indexes USING (indexrelid, relid)
                    ORDER BY pg_relation_size(indexrelid) DESC;
                    """
                )
                return [dict(row) for row in result.mappings()]
        except Exception as e:
            logger.error(f"Error getting index usage: {str(e)}")
            return []
    
    def get_unused_indexes(self, min_size_mb: int = 1) -> List[Dict]:
        """Get unused or rarely used indexes."""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(
                    text("""
                    SELECT 
                        schemaname as schema_name,
                        relname as table_name,
                        indexrelname as index_name,
                        idx_scan as index_scans,
                        pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
                        pg_relation_size(indexrelid) as size_bytes
                    FROM pg_stat_user_indexes
                    WHERE idx_scan < 50  -- Fewer than 50 scans
                    AND pg_relation_size(indexrelid) > :min_size_bytes
                    ORDER BY pg_relation_size(indexrelid) DESC;
                    """),
                    {'min_size_bytes': min_size_mb * 1024 * 1024}
                )
                return [dict(row) for row in result.mappings()]
        except Exception as e:
            logger.error(f"Error getting unused indexes: {str(e)}")
            return []
    
    def get_lock_contention(self) -> List[Dict]:
        """Get information about lock contention."""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(
                    text("""
                    SELECT 
                        blocked_locks.pid AS blocked_pid,
                        blocked_activity.usename AS blocked_user,
                        blocking_locks.pid AS blocking_pid,
                        blocking_activity.usename AS blocking_user,
                        blocked_activity.query AS blocked_statement,
                        blocking_activity.query AS blocking_statement,
                        blocked_activity.application_name AS blocked_application,
                        blocking_activity.application_name AS blocking_application,
                        now() - blocked_activity.query_start AS blocked_duration,
                        now() - blocking_activity.query_start AS blocking_duration
                    FROM pg_catalog.pg_locks blocked_locks
                    JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
                    JOIN pg_catalog.pg_locks blocking_locks 
                        ON blocking_locks.locktype = blocked_locks.locktype
                        AND blocking_locks.DATABASE IS NOT DISTINCT FROM blocked_locks.DATABASE
                        AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
                        AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
                        AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
                        AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
                        AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
                        AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
                        AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
                        AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
                        AND blocking_locks.pid != blocked_locks.pid
                    JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
                    WHERE NOT blocked_locks.GRANTED;
                    """
                )
                return [dict(row) for row in result.mappings()]
        except Exception as e:
            logger.error(f"Error getting lock contention: {str(e)}")
            return []
    
    def _get_database_health(self):
        """Get overall database health metrics."""
        try:
            return {
                'version': self._get_pg_version(),
                'database_size': self._get_database_size(),
                'connection_pool': self._get_connection_pool_stats(),
                'long_running_queries': self._get_long_running_queries(),
                'unused_indexes': self._get_unused_indexes(),
                'lock_contention': self._get_lock_contention(),
                'table_sizes': self._get_table_sizes(),
                'index_usage': self._get_index_usage(),
            }
        except Exception as e:
            logger.error(f"Error getting database health: {str(e)}")
            return {}
    
    def get_database_health(self) -> Dict:
        """Get a comprehensive health check of the database."""
        return self._get_database_health()

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Gate of Memory Database Manager')
    
    # Connection options
    parser.add_argument('--db-url', help='Database connection URL')
    
    # Command options
    subparsers = parser.add_subparsers(dest='command', help='Command to execute', required=True)
    
    # Health check command
    health_parser = subparsers.add_parser('health', help='Check database health')
    
    # Analyze command
    analyze_parser = subparsers.add_parser('analyze', help='Analyze database tables')
    
    # Vacuum command
    vacuum_parser = subparsers.add_parser('vacuum', help='Vacuum database tables')
    vacuum_parser.add_argument('--full', action='store_true', help='Run VACUUM FULL')
    vacuum_parser.add_argument('--analyze', action='store_true', help='Run ANALYZE after vacuum')
    
    # Reindex command
    reindex_parser = subparsers.add_parser('reindex', help='Reindex database')
    
    # Table sizes command
    sizes_parser = subparsers.add_parser('sizes', help='Show table sizes')
    
    # Connection pool command
    pool_parser = subparsers.add_parser('pool', help='Show connection pool status')
    
    # Long running queries command
    long_queries_parser = subparsers.add_parser('long-queries', help='Show long running queries')
    long_queries_parser.add_argument('--threshold', type=int, default=60, 
                                    help='Threshold in seconds (default: 60)')
    
    # Index usage command
    index_parser = subparsers.add_parser('indexes', help='Show index usage')
    
    # Unused indexes command
    unused_parser = subparsers.add_parser('unused-indexes', help='Show unused indexes')
    unused_parser.add_argument('--min-size', type=int, default=1, 
                              help='Minimum index size in MB (default: 1)')
    
    # Locks command
    locks_parser = subparsers.add_parser('locks', help='Show lock contention')
    
    # Cancel query command
    cancel_parser = subparsers.add_parser('cancel', help='Cancel a running query')
    cancel_parser.add_argument('pid', type=int, help='Process ID to cancel')
    
    # Terminate connection command
    terminate_parser = subparsers.add_parser('terminate', help='Terminate a database connection')
    terminate_parser.add_argument('pid', type=int, help='Process ID to terminate')
    
    return parser.parse_args()

def print_table(rows, headers=None):
    """Print tabular data."""
    if not rows:
        print("No data to display")
        return
    
    if not headers and hasattr(rows[0], '_fields'):
        headers = rows[0]._fields
    
    if not headers and isinstance(rows[0], dict):
        headers = list(rows[0].keys())
    
    # Calculate column widths
    col_widths = [len(str(header)) for header in headers]
    for row in rows:
        for i, value in enumerate(row):
            col_widths[i] = max(col_widths[i], len(str(value)))
    
    # Print headers
    header_row = " | ".join(f"{header:<{col_widths[i]}}" for i, header in enumerate(headers))
    print(header_row)
    print("-" * len(header_row))
    
    # Print rows
    for row in rows:
        if hasattr(row, '_asdict'):
            row = row._asdict().values()
        elif isinstance(row, dict):
            row = row.values()
        print(" | ".join(f"{str(value):<{col_widths[i]}}" for i, value in enumerate(row)))

def main():
    """Main entry point for the database manager."""
    args = parse_arguments()
    
    try:
        # Initialize database manager
        db_manager = DatabaseManager(args.db_url)
        if not db_manager.connect():
            return 1
        
        # Execute command
        if args.command == 'health':
            health = db_manager.get_database_health()
            print("\n=== Database Health Check ===")
            print(f"Database Size: {health['database_size']}")
            print("\nConnection Pool:")
            for k, v in health['connection_pool'].items():
                print(f"  {k}: {v}")
            
            print("\nLong Running Queries:")
            print_table(health['long_running_queries'])
            
            print("\nUnused Indexes:")
            print_table(health['unused_indexes'])
            
            print("\nLock Contention:")
            print_table(health['lock_contention'])
            
        elif args.command == 'analyze':
            print("Analyzing database tables...")
            if db_manager.analyze_tables():
                print("Analysis complete")
            
        elif args.command == 'vacuum':
            print(f"Running {'VACUUM FULL ' if args.full else 'VACUUM'}{' with ANALYZE' if args.analyze else ''}...")
            if db_manager.vacuum_tables(full=args.full, analyze=args.analyze):
                print("Vacuum complete")
        
        elif args.command == 'reindex':
            print("Reindexing database...")
            if db_manager.reindex_database():
                print("Reindexing complete")
        
        elif args.command == 'sizes':
            print("\nTable Sizes:")
            sizes = db_manager.get_table_sizes()
            print_table(sizes)
        
        elif args.command == 'pool':
            print("\nConnection Pool Status:")
            pool = db_manager.check_connection_pool()
            if pool:
                for k, v in pool.items():
                    print(f"{k}: {v}")
        
        elif args.command == 'long-queries':
            print(f"\nQueries running longer than {args.threshold} seconds:")
            queries = db_manager.get_long_running_queries(args.threshold)
            if queries:
                print_table(queries)
            else:
                print("No long running queries found.")
        
        elif args.command == 'indexes':
            print("\nIndex Usage:")
            indexes = db_manager.get_index_usage()
            if indexes:
                print_table(indexes)
            else:
                print("No index usage data available.")
        
        elif args.command == 'unused-indexes':
            print(f"\nUnused Indexes (>{args.min_size}MB):")
            indexes = db_manager.get_unused_indexes(args.min_size)
            if indexes:
                print_table(indexes)
            else:
                print(f"No unused indexes larger than {args.min_size}MB found.")
        
        elif args.command == 'locks':
            print("\nLock Contention:")
            locks = db_manager.get_lock_contention()
            if locks:
                print_table(locks)
            else:
                print("No lock contention detected.")
        
        elif args.command == 'cancel':
            print(f"Cancelling query with PID {args.pid}...")
            if db_manager.cancel_query(args.pid):
                print("Query cancelled successfully")
            else:
                print("Failed to cancel query")
        
        elif args.command == 'terminate':
            print(f"Terminating connection with PID {args.pid}...")
            if db_manager.terminate_connection(args.pid):
                print("Connection terminated successfully")
            else:
                print("Failed to terminate connection")
        
        return 0
    
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
        return 1
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        if hasattr(e, 'pgcode'):
            logger.error(f"PostgreSQL Error Code: {e.pgcode}")
        if hasattr(e, 'pgerror'):
            logger.error(f"PostgreSQL Error: {e.pgerror}")
        return 1

if __name__ == "__main__":
    sys.exit(main())

