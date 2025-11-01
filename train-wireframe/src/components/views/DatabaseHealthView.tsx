import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import {
  Database,
  RefreshCw,
  Activity,
  HardDrive,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Server,
  Loader2,
  PlayCircle,
  History,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  DatabaseHealthReport,
  TableHealthMetrics,
  IndexHealthMetrics,
  QueryPerformanceMetrics,
  ConnectionPoolMetrics,
  DatabaseHealthAlert,
  MaintenanceOperationRecord,
  MaintenanceOperationOptions
} from '../../lib/types/database-health';

export function DatabaseHealthView() {
  const [healthReport, setHealthReport] = useState<DatabaseHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Maintenance state
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [maintenanceOperation, setMaintenanceOperation] = useState<MaintenanceOperationOptions | null>(null);
  const [isExecutingMaintenance, setIsExecutingMaintenance] = useState(false);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceOperationRecord[]>([]);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  
  // Load health metrics on mount
  useEffect(() => {
    loadHealthMetrics();
  }, []);
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadHealthMetrics(true); // Silent refresh
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  const loadHealthMetrics = async (silent: boolean = false) => {
    if (!silent) {
      setIsRefreshing(true);
    }
    
    try {
      const response = await fetch('/api/database/health');
      const data = await response.json();
      
      setHealthReport(data.report);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load health metrics:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const loadMaintenanceHistory = async () => {
    try {
      const response = await fetch('/api/database/maintenance?type=history&limit=20');
      const data = await response.json();
      setMaintenanceHistory(data.history);
    } catch (error) {
      console.error('Failed to load maintenance history:', error);
    }
  };
  
  const handleManualRefresh = () => {
    loadHealthMetrics();
  };
  
  const handleMaintenanceConfirm = async () => {
    if (!maintenanceOperation) return;
    
    setIsExecutingMaintenance(true);
    
    try {
      const response = await fetch('/api/database/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenanceOperation),
      });
      
      if (!response.ok) {
        throw new Error('Maintenance operation failed');
      }
      
      // Reload metrics and history
      await Promise.all([
        loadHealthMetrics(),
        loadMaintenanceHistory()
      ]);
      
      setShowMaintenanceDialog(false);
      setMaintenanceOperation(null);
    } catch (error) {
      console.error('Error executing maintenance:', error);
      alert('Failed to execute maintenance operation. Please check console for details.');
    } finally {
      setIsExecutingMaintenance(false);
    }
  };
  
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await fetch('/api/database/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'acknowledge' }),
      });
      
      await loadHealthMetrics();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };
  
  const handleResolveAlert = async (alertId: string) => {
    try {
      await fetch('/api/database/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'resolve' }),
      });
      
      await loadHealthMetrics();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-600">Loading database health metrics...</span>
      </div>
    );
  }
  
  if (!healthReport) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Health Metrics Error</AlertTitle>
          <AlertDescription>
            Failed to load database health metrics. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 flex items-center gap-3">
            <Database className="w-8 h-8" />
            Database Health
          </h1>
          <p className="text-gray-600">
            Monitor database performance and execute maintenance operations
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Auto-refresh toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={(checked) => setAutoRefresh(!!checked)}
            />
            <label htmlFor="auto-refresh" className="text-sm text-gray-600">
              Auto-refresh (30s)
            </label>
          </div>
          
          {/* Last updated */}
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          
          {/* Manual refresh button */}
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {/* History button */}
          <Button
            variant="outline"
            onClick={() => {
              loadMaintenanceHistory();
              setShowHistoryDialog(true);
            }}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
      </div>
      
      {/* Critical Alerts Banner */}
      {healthReport.alerts.length > 0 && (
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg">
            {healthReport.alerts.length} Active Health Alert{healthReport.alerts.length > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription>
            <div className="mt-3 space-y-2">
              {healthReport.alerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between bg-white/50 p-3 rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        {alert.severity}
                      </Badge>
                      <span className="font-medium">{alert.alertType.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!alert.acknowledgedAt && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Database Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Database Size */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Database Size</p>
              <p className="text-3xl mt-1">{healthReport.overview.databaseSizeFormatted}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                <HardDrive className="h-3 w-3" />
                <span>{healthReport.overview.databaseName}</span>
              </div>
            </div>
            <Database className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        {/* Cache Hit Ratio */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Cache Hit Ratio</p>
              <p className="text-3xl mt-1">{healthReport.overview.cacheHitRatio.toFixed(1)}%</p>
              <div className="flex items-center gap-1 mt-2 text-xs">
                {healthReport.overview.cacheHitRatio >= 90 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Excellent</span>
                  </>
                ) : healthReport.overview.cacheHitRatio >= 80 ? (
                  <>
                    <Activity className="h-3 w-3 text-yellow-600" />
                    <span className="text-yellow-600">Good</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">Needs attention</span>
                  </>
                )}
              </div>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        {/* Active Connections */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Connections</p>
              <p className="text-3xl mt-1">{healthReport.connectionPool.activeConnections}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                <span>{healthReport.connectionPool.totalConnections} total</span>
                <span className="text-gray-400">•</span>
                <span>{healthReport.connectionPool.utilizationPercentage.toFixed(0)}% used</span>
              </div>
            </div>
            <Server className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
        
        {/* Transaction Stats */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Commit Ratio</p>
              <p className="text-3xl mt-1">{healthReport.overview.commitRollbackRatio.toFixed(1)}%</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                <span>{healthReport.overview.transactionsCommitted.toLocaleString()} commits</span>
              </div>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>
      
      {/* Tables Health Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Tables Health
          </h3>
          <Badge variant="outline">
            {healthReport.tables.length} tables
          </Badge>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table Name</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Rows</TableHead>
                <TableHead className="text-right">Dead Tuples</TableHead>
                <TableHead className="text-right">Bloat</TableHead>
                <TableHead>Last Vacuum</TableHead>
                <TableHead>Last Analyze</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthReport.tables.map((table) => (
                <TableRow key={`${table.schemaName}.${table.tableName}`}>
                  <TableCell className="font-medium">
                    <div>
                      <span>{table.tableName}</span>
                      {table.schemaName !== 'public' && (
                        <span className="text-xs text-gray-500 ml-2">({table.schemaName})</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{table.tableSizeFormatted}</TableCell>
                  <TableCell className="text-right">{table.rowCount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div>
                      <span>{table.deadTuples.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({table.deadTuplesRatio.toFixed(1)}%)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={table.bloatPercentage > 20 ? 'destructive' : 'default'}>
                      {table.bloatPercentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {table.lastVacuum ? (
                      <span className="text-sm">
                        {new Date(table.lastVacuum).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Never</span>
                    )}
                    {table.needsVacuum && (
                      <Badge variant="destructive" className="ml-2">
                        Needs VACUUM
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {table.lastAnalyze ? (
                      <span className="text-sm">
                        {new Date(table.lastAnalyze).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Never</span>
                    )}
                    {table.needsAnalyze && (
                      <Badge variant="destructive" className="ml-2">
                        Needs ANALYZE
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setMaintenanceOperation({
                            operationType: 'VACUUM',
                            tableName: table.tableName,
                            analyze: true,
                          });
                          setShowMaintenanceDialog(true);
                        }}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Vacuum
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setMaintenanceOperation({
                            operationType: 'ANALYZE',
                            tableName: table.tableName,
                          });
                          setShowMaintenanceDialog(true);
                        }}
                      >
                        <Activity className="w-3 h-3 mr-1" />
                        Analyze
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Indexes Health Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Indexes Health
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {healthReport.indexes.length} indexes
            </Badge>
            <Badge variant="destructive">
              {healthReport.indexes.filter(i => i.isUnused).length} unused
            </Badge>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Index Name</TableHead>
                <TableHead>Table</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Scans</TableHead>
                <TableHead className="text-right">Tuples Read</TableHead>
                <TableHead className="text-right">Bloat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthReport.indexes.map((index) => (
                <TableRow
                  key={`${index.schemaName}.${index.indexName}`}
                  className={index.isUnused ? 'bg-red-50' : ''}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{index.indexName}</span>
                      {index.isUnused && (
                        <Badge variant="destructive" className="text-xs">
                          Unused
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{index.tableName}</TableCell>
                  <TableCell className="text-right">{index.indexSizeFormatted}</TableCell>
                  <TableCell className="text-right">{index.indexScans.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{index.indexTuplesRead.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={index.bloatPercentage > 20 ? 'destructive' : 'default'}>
                      {index.bloatPercentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {index.isUnused ? (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Unused ({index.daysSinceLastUse} days)
                      </Badge>
                    ) : index.needsReindex ? (
                      <Badge variant="default" className="bg-yellow-500">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Needs REINDEX
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Healthy
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {index.needsReindex && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setMaintenanceOperation({
                            operationType: 'REINDEX',
                            indexName: index.indexName,
                            concurrent: true,
                          });
                          setShowMaintenanceDialog(true);
                        }}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Reindex
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Unused Indexes Warning */}
        {healthReport.indexes.filter(i => i.isUnused).length > 0 && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Consider dropping unused indexes to reduce storage and improve write performance.
              Review query patterns before dropping to ensure they're truly unused.
            </AlertDescription>
          </Alert>
        )}
      </Card>
      
      {/* Slow Queries Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Slow Queries
          </h3>
          <Badge variant="destructive">
            {healthReport.slowQueries.length} queries &gt; 500ms
          </Badge>
        </div>
        
        {healthReport.slowQueries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p>No slow queries detected in the last 24 hours</p>
            <p className="text-sm mt-1">All queries are performing within acceptable limits</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Mean Time</TableHead>
                  <TableHead className="text-right">Max Time</TableHead>
                  <TableHead className="text-right">Total Time</TableHead>
                  <TableHead className="text-right">Cache Hit %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthReport.slowQueries.map((query) => (
                  <TableRow key={query.queryId}>
                    <TableCell className="font-mono text-xs max-w-md">
                      <div className="truncate" title={query.query}>
                        {query.query.substring(0, 100)}...
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{query.calls.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={query.meanTimeMs > 1000 ? 'destructive' : 'default'}>
                        {query.meanTimeMs.toFixed(0)}ms
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{query.maxTimeMs.toFixed(0)}ms</TableCell>
                    <TableCell className="text-right">{(query.totalTimeMs / 1000).toFixed(1)}s</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={query.cacheHitRatio < 80 ? 'destructive' : 'default'}>
                        {query.cacheHitRatio.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
      
      {/* Connection Pool Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Connection Pool Status
          </h3>
          
          <div className="space-y-4">
            {/* Connection Types */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-700">
                  {healthReport.connectionPool.activeConnections}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Idle</p>
                <p className="text-2xl font-bold text-gray-700">
                  {healthReport.connectionPool.idleConnections}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Idle in Transaction</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {healthReport.connectionPool.idleInTransactionConnections}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Waiting</p>
                <p className="text-2xl font-bold text-red-700">
                  {healthReport.connectionPool.waitingConnections}
                </p>
              </div>
            </div>
            
            {/* Utilization Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pool Utilization</span>
                <span className="font-medium">
                  {healthReport.connectionPool.totalConnections} / {healthReport.connectionPool.maxConnections}
                  ({healthReport.connectionPool.utilizationPercentage.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    healthReport.connectionPool.utilizationPercentage > 80
                      ? 'bg-red-500'
                      : healthReport.connectionPool.utilizationPercentage > 60
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${healthReport.connectionPool.utilizationPercentage}%` }}
                />
              </div>
            </div>
            
            {/* Longest Running Query */}
            {healthReport.connectionPool.longestRunningQuerySeconds !== null && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Longest Running Query</p>
                <p className="text-xl font-bold text-blue-700">
                  {healthReport.connectionPool.longestRunningQuerySeconds.toFixed(0)}s
                </p>
              </div>
            )}
            
            {/* High utilization warning */}
            {healthReport.connectionPool.utilizationPercentage > 80 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Connection pool utilization is high ({healthReport.connectionPool.utilizationPercentage.toFixed(0)}%).
                  Consider increasing max_connections or implementing connection pooling.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
        
        {/* Recommendations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recommendations
          </h3>
          
          {healthReport.recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p>Database is healthy</p>
              <p className="text-sm mt-1">No recommendations at this time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {healthReport.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.priority === 'high'
                      ? 'bg-red-50 border-red-500'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={
                          rec.priority === 'high' ? 'destructive' :
                          rec.priority === 'medium' ? 'default' :
                          'outline'
                        }>
                          {rec.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">{rec.category}</span>
                      </div>
                      <h4 className="font-semibold">{rec.title}</h4>
                      <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Action:</strong> {rec.action}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Impact:</strong> {rec.impact}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {rec.effort} effort
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      
      {/* Maintenance Confirmation Dialog */}
      <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Confirm Maintenance Operation
            </DialogTitle>
            <DialogDescription>
              You are about to execute a database maintenance operation. This may temporarily impact performance.
            </DialogDescription>
          </DialogHeader>
          
          {maintenanceOperation && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Operation:</span>
                  <Badge>{maintenanceOperation.operationType}</Badge>
                </div>
                {maintenanceOperation.tableName && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Table:</span>
                    <span className="text-sm font-mono">{maintenanceOperation.tableName}</span>
                  </div>
                )}
                {maintenanceOperation.indexName && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Index:</span>
                    <span className="text-sm font-mono">{maintenanceOperation.indexName}</span>
                  </div>
                )}
                {maintenanceOperation.analyze && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Include ANALYZE:</span>
                    <span className="text-sm">Yes</span>
                  </div>
                )}
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {maintenanceOperation.operationType === 'VACUUM FULL' ? (
                    <span>VACUUM FULL requires an exclusive lock and may take significant time on large tables.</span>
                  ) : maintenanceOperation.operationType === 'VACUUM' ? (
                    <span>VACUUM will reclaim space from dead tuples and may improve query performance.</span>
                  ) : maintenanceOperation.operationType === 'ANALYZE' ? (
                    <span>ANALYZE will update statistics to help the query planner make better decisions.</span>
                  ) : (
                    <span>REINDEX will rebuild the index, which may improve query performance.</span>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMaintenanceDialog(false)}
              disabled={isExecutingMaintenance}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMaintenanceConfirm}
              disabled={isExecutingMaintenance}
            >
              {isExecutingMaintenance ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Maintenance History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Maintenance Operation History
            </DialogTitle>
            <DialogDescription>
              Recent maintenance operations executed on the database
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operation</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Initiated By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No maintenance operations found
                    </TableCell>
                  </TableRow>
                ) : (
                  maintenanceHistory.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>
                        <Badge>{operation.operationType}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {operation.tableName || operation.indexName || 'All'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(operation.startedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {operation.durationMs
                          ? `${(operation.durationMs / 1000).toFixed(1)}s`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          operation.status === 'completed' ? 'default' :
                          operation.status === 'failed' ? 'destructive' :
                          operation.status === 'running' ? 'default' :
                          'outline'
                        }>
                          {operation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {operation.initiatedBy.substring(0, 8)}...
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowHistoryDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

