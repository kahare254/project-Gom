"""
Monitoring middleware for the Gate of Memory backend.
"""
import time
import functools
from flask import request, g
from prometheus_client import Counter, Histogram, Gauge

# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP Requests',
    ['method', 'endpoint', 'http_status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP Request Latency',
    ['method', 'endpoint']
)

REQUEST_IN_PROGRESS = Gauge(
    'http_requests_in_progress',
    'Number of requests in progress',
    ['method', 'endpoint']
)

DB_QUERY_COUNT = Counter(
    'db_queries_total',
    'Total database queries',
    ['operation', 'table']
)

DB_QUERY_DURATION = Histogram(
    'db_query_duration_seconds',
    'Database query duration',
    ['operation', 'table']
)

class MonitorMiddleware:
    """Middleware for monitoring request metrics."""
    
    def __init__(self, app):
        self.app = app
        self.app.before_request(self.before_request)
        self.app.after_request(self.after_request)
        
        # Register metrics endpoint
        self.app.add_url_rule('/metrics', 'metrics', self.metrics)
    
    def before_request(self):
        """Record request start time and increment in-progress counter."""
        g.start_time = time.time()
        g.request_id = request.headers.get('X-Request-ID')
        
        # Skip metrics for health checks and static files
        if request.endpoint in ['metrics', 'static'] or request.path == '/health':
            return
        
        # Track request in progress
        REQUEST_IN_PROGRESS.labels(
            method=request.method,
            endpoint=request.endpoint or 'unknown'
        ).inc()
    
    def after_request(self, response):
        """Record request metrics after response is sent."""
        # Skip metrics for health checks and static files
        if request.endpoint in ['metrics', 'static'] or request.path == '/health':
            return response
        
        # Calculate request duration
        duration = time.time() - g.get('start_time', time.time())
        
        # Record metrics
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.endpoint or 'unknown',
            http_status=response.status_code
        ).inc()
        
        REQUEST_LATENCY.labels(
            method=request.method,
            endpoint=request.endpoint or 'unknown'
        ).observe(duration)
        
        # Decrement in-progress counter
        REQUEST_IN_PROGRESS.labels(
            method=request.method,
            endpoint=request.endpoint or 'unknown'
        ).dec()
        
        # Add request timing header
        response.headers['X-Request-Duration'] = f"{duration:.3f}s"
        
        return response
    
    def metrics(self):
        """Expose Prometheus metrics."""
        from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
        from flask import Response
        
        return Response(
            generate_latest(),
            mimetype=CONTENT_TYPE_LATEST
        )

def track_query(operation, table):
    """Decorator to track database query metrics."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            
            try:
                result = func(*args, **kwargs)
                status = 'success'
                return result
            except Exception as e:
                status = 'error'
                raise
            finally:
                duration = time.time() - start_time
                DB_QUERY_COUNT.labels(
                    operation=f"{operation}_{status}",
                    table=table
                ).inc()
                DB_QUERY_DURATION.labels(
                    operation=operation,
                    table=table
                ).observe(duration)
        
        return wrapper
    return decorator

def setup_monitoring(app):
    """Set up monitoring for the Flask application."""
    # Initialize middleware
    MonitorMiddleware(app)
    
    # Add request ID to all responses
    @app.after_request
    def add_request_id(response):
        if hasattr(g, 'request_id'):
            response.headers['X-Request-ID'] = g.request_id
        return response
    
    # Add health check endpoint
    @app.route('/health')
    def health_check():
        return {
            'status': 'healthy',
            'timestamp': time.time(),
            'version': '1.0.0'
        }
