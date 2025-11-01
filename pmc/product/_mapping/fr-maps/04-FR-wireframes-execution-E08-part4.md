# Train - Settings & Administration Module Implementation Execution Instructions (E08 - Part 4)
**Generated**: 2025-11-01  
**Segment**: E08 - Settings & Administration Module (Prompts 7-8)  
**Total Prompts**: 2 (7-8 of 8 total)  
**Estimated Implementation Time**: 24-30 hours

## Context

This document contains the detailed execution instructions for **Prompts 7-8** of the Settings & Administration Module (E08). These final prompts focus on:

- **Prompt 7**: Database Health Dashboard UI (T-3.3.0)
- **Prompt 8**: Integration, Testing & Deployment (T-4.1.0, T-5.1.0, T-6.1.0)

**Prerequisites**: 
- Prompts 1-6 have been completed successfully
- Database migrations from E08 have been applied
- User preferences, AI configuration, database health monitoring foundations operational
- Configuration change management system working
- Settings UI and AI Config UI implemented

**Reference Documents**:
- Main E08 document: `04-FR-wireframes-execution-E08.md`
- Part 2 (Prompts 3-4): `04-FR-wireframes-execution-E08-part2.md`
- Part 3 (Prompts 5-6): `04-FR-wireframes-execution-E08-part3.md`
- Task Inventory: `04-train-FR-wireframes-E08-output.md`
- Functional Requirements: `03-train-functional-requirements.md` (FR8.2.2)

---

## Implementation Prompts

### Prompt 7: Database Health Dashboard UI (T-3.3.0)
**Scope**: Complete database monitoring and maintenance UI  
**Dependencies**: T-1.3.0 (Database Health Monitoring Foundation)
**Estimated Time**: 12-14 hours  
**Risk Level**: Medium

========================


You are a senior full-stack developer implementing the Database Health Dashboard UI for the Train platform (Interactive LoRA Training Data Generation). This critical administrative interface provides visibility into database performance, health metrics, and enables proactive maintenance operations.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
The Train platform relies heavily on PostgreSQL (Supabase) for storing conversations, templates, chunks, dimensions, and audit logs. As the dataset grows to thousands of conversations, database performance becomes critical. The Database Health Dashboard provides real-time monitoring, identifies performance issues, and enables administrators to perform maintenance operations safely.

**Functional Requirements (FR8.2.2):**
- Database stats dashboard showing: table sizes, index health, query performance
- Manual vacuum and analyze operations triggerable from UI
- Connection pool monitoring displaying active/idle connections
- Slow query identification using pg_stat_statements
- Index usage statistics with unused index detection
- Table bloat calculation and visualization
- Performance alert system for threshold violations
- Monthly health report generation capability
- Real-time metrics updates (30-second refresh interval)
- Maintenance operation history with status tracking
- Safety confirmations before destructive operations

**Technical Architecture:**
- **Frontend**: Next.js 14 App Router, TypeScript, React 18, Tailwind CSS, Shadcn/UI
- **Charts**: Recharts library for data visualization
- **State Management**: React state with API polling
- **Backend**: Next.js API routes from Prompt 3
- **Type Safety**: Strict TypeScript mode throughout

**CURRENT CODEBASE STATE:**

**Existing Implementation:**
1. **Database Health Types** (`src/lib/types/database-health.ts` - from Prompt 3):
   - Complete type definitions: TableHealthMetrics, IndexHealthMetrics, QueryPerformanceMetrics, ConnectionPoolMetrics, DatabaseOverviewMetrics, MaintenanceOperationRecord, DatabaseHealthAlert, HealthRecommendation
   - Utility functions: formatBytes, calculatePercentage, needsVacuum, needsAnalyze
   - DEFAULT_HEALTH_MONITORING_CONFIG constant

2. **Database Health Service** (`src/lib/services/database-health-service.ts` - from Prompt 3):
   - getHealthReport() - comprehensive health metrics
   - getDatabaseOverview() - database-wide statistics
   - getTableHealthMetrics() - table-level health
   - getIndexHealthMetrics() - index usage statistics
   - getSlowQueries() - slow query detection
   - getConnectionPoolMetrics() - connection pool status
   - getActiveAlerts() - current health alerts
   - acknowledgeAlert() / resolveAlert() - alert management

3. **Database Maintenance Service** (`src/lib/services/database-maintenance-service.ts` - from Prompt 3):
   - executeVacuum() - VACUUM operations
   - executeAnalyze() - ANALYZE operations
   - executeReindex() - REINDEX operations
   - getOperationHistory() - maintenance history
   - getRunningOperations() - current operations

4. **API Routes** (from Prompt 3):
   - GET /api/database/health - health metrics
   - POST /api/database/maintenance - execute operations
   - GET /api/database/maintenance - operation history
   - GET /api/database/alerts - active alerts
   - PATCH /api/database/alerts - acknowledge/resolve alerts

5. **Shadcn/UI Components Available**:
   - Card, Table, Badge, Button, Alert, Dialog, Select, Checkbox
   - Recharts (BarChart, LineChart, PieChart, ResponsiveContainer)
   - Icons from lucide-react

**Existing Codebase Patterns:**
- From `train-wireframe/src/App.tsx`: View routing pattern with switch statement
- From `train-wireframe/src/stores/useAppStore.ts`: Zustand store for global state
- From `train-wireframe/src/components/views/`: Established view component patterns

**Gaps to Fill:**
- Create new DatabaseHealthView component
- Database overview metrics display
- Tables health table with sortable columns
- Indexes health table with unused index highlighting
- Slow queries table with execution statistics
- Connection pool visualization
- Maintenance operations section with safety confirmations
- Real-time polling mechanism (30-second interval)
- Alert banner for critical issues
- Refresh button for manual updates
- Operation history modal
- Confirmation dialogs for maintenance operations
- Navigation integration (add route to App.tsx)

**IMPLEMENTATION TASKS:**

**Task T-3.3.1: Create DatabaseHealthView Component Foundation**

Create new file `train-wireframe/src/components/views/DatabaseHealthView.tsx`:

```typescript
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
      
      {/* Rest of the component content will be added in subsequent tasks */}
    </div>
  );
}
```

**Task T-3.3.2: Database Overview Metrics Section**

Add database overview metrics display:

```typescript
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
```

**Task T-3.3.3: Tables Health Table**

Add tables health table with maintenance actions:

```typescript
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
```

**Task T-3.3.4: Indexes Health Table**

Add indexes health table with unused index highlighting:

```typescript
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
```

**Task T-3.3.5: Slow Queries Table**

Add slow queries table with execution statistics:

```typescript
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
```

**Task T-3.3.6: Connection Pool Visualization**

Add connection pool metrics visualization:

```typescript
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
```

**Task T-3.3.7: Maintenance Confirmation Dialog**

Add maintenance operation confirmation dialog:

```typescript
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
```

**Task T-3.3.8: Maintenance History Dialog**

Add maintenance operation history dialog:

```typescript
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
```

**Task T-3.3.9: Navigation Integration**

Update `train-wireframe/src/App.tsx` to add database health route:

```typescript
// Add to imports
import { DatabaseHealthView } from './components/views/DatabaseHealthView';

// Update renderView function
const renderView = () => {
  switch (currentView) {
    case 'dashboard':
      return <DashboardView />;
    case 'templates':
      return <TemplatesView />;
    case 'scenarios':
      return <ScenariosView />;
    case 'edge_cases':
      return <EdgeCasesView />;
    case 'review':
      return <ReviewQueueView />;
    case 'feedback':
      return <QualityFeedbackView />;
    case 'settings':
      return <SettingsView />;
    case 'database':  // NEW
      return <DatabaseHealthView />;  // NEW
    default:
      return <DashboardView />;
  }
};
```

Update `train-wireframe/src/stores/useAppStore.ts` to add 'database' view type:

```typescript
// Update AppView type
export type AppView = 
  | 'dashboard' 
  | 'templates' 
  | 'scenarios' 
  | 'edge_cases' 
  | 'review' 
  | 'feedback' 
  | 'settings'
  | 'database';  // NEW
```

Update sidebar navigation to include Database Health link (in DashboardLayout component).

**ACCEPTANCE CRITERIA:**

1. **Component Structure:**
   - [ ] DatabaseHealthView component loads health report on mount
   - [ ] Auto-refresh polls API every 30 seconds when enabled
   - [ ] Manual refresh button triggers immediate update
   - [ ] Loading state shows spinner during initial load
   - [ ] Error state shows alert if health report fails to load
   - [ ] Last updated timestamp displays correctly
   
2. **Database Overview:**
   - [ ] Four metric cards display: Database Size, Cache Hit Ratio, Active Connections, Commit Ratio
   - [ ] Metrics formatted appropriately (sizes with units, percentages)
   - [ ] Icons enhance visual hierarchy
   - [ ] Color-coded indicators show health status
   
3. **Tables Health Table:**
   - [ ] All table metrics displayed: size, rows, dead tuples, bloat
   - [ ] Tables sorted by size (largest first)
   - [ ] Vacuum/Analyze badges appear when needed
   - [ ] Action buttons trigger maintenance dialogs
   - [ ] High bloat tables highlighted
   
4. **Indexes Health Table:**
   - [ ] All index metrics displayed: size, scans, tuples, bloat
   - [ ] Unused indexes highlighted with red background
   - [ ] Status badges show healthy/needs reindex/unused
   - [ ] Reindex button appears for bloated indexes
   - [ ] Unused index count displayed in header
   
5. **Slow Queries Table:**
   - [ ] Query text truncated appropriately
   - [ ] Execution statistics displayed: calls, mean/max/total time
   - [ ] Cache hit ratio shown
   - [ ] Queries sorted by mean time (slowest first)
   - [ ] Empty state shows "No slow queries" message
   
6. **Connection Pool:**
   - [ ] Connection types displayed: active, idle, idle in transaction, waiting
   - [ ] Utilization bar shows percentage filled
   - [ ] Color-coded based on utilization (green/yellow/red)
   - [ ] Longest running query time displayed
   - [ ] High utilization alert appears when >80%
   
7. **Recommendations:**
   - [ ] All recommendations displayed with priority
   - [ ] High priority recommendations highlighted
   - [ ] Action, impact, and effort shown for each
   - [ ] Empty state shows "Database is healthy"
   
8. **Maintenance Operations:**
   - [ ] Confirmation dialog shows operation details
   - [ ] Safety warnings displayed appropriately
   - [ ] Execute button triggers API call
   - [ ] Loading state during execution
   - [ ] Success/error feedback after operation
   - [ ] History dialog shows recent operations
   - [ ] Operation status tracked correctly
   
9. **Alerts:**
   - [ ] Critical alerts banner appears at top
   - [ ] Alert severity color-coded
   - [ ] Acknowledge/Resolve buttons functional
   - [ ] Alerts dismissed after resolution
   
10. **Navigation:**
    - [ ] Database health view accessible from sidebar/menu
    - [ ] View type 'database' added to AppView
    - [ ] Routing works correctly
    
11. **Performance:**
    - [ ] Initial load < 3 seconds
    - [ ] Auto-refresh doesn't block UI
    - [ ] Manual refresh provides feedback
    - [ ] Large tables render without lag
    
12. **UI/UX:**
    - [ ] Consistent styling with other views
    - [ ] Responsive layout on all screen sizes
    - [ ] Tables scrollable horizontally if needed
    - [ ] Icons enhance visual hierarchy
    - [ ] Color coding intuitive (green=good, yellow=warning, red=critical)

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
train-wireframe/src/components/views/DatabaseHealthView.tsx (NEW)
train-wireframe/src/App.tsx (UPDATE - add route)
train-wireframe/src/stores/useAppStore.ts (UPDATE - add view type)
train-wireframe/src/components/layout/DashboardLayout.tsx (UPDATE - add nav link)
src/lib/types/database-health.ts (EXISTING - from Prompt 3)
src/lib/services/database-health-service.ts (EXISTING - from Prompt 3)
src/lib/services/database-maintenance-service.ts (EXISTING - from Prompt 3)
```

**Component Architecture:**
- Single comprehensive DatabaseHealthView component
- Local state for health report and maintenance operations
- Polling mechanism for auto-refresh (30-second interval)
- Confirmation dialogs for safety
- History modal for operation tracking

**State Management:**
- healthReport: Current database health metrics
- isLoading: Initial load state
- isRefreshing: Manual/auto refresh state
- autoRefresh: Toggle for auto-refresh
- lastUpdated: Timestamp of last update
- maintenanceOperation: Pending maintenance operation
- showMaintenanceDialog: Confirmation dialog visibility
- maintenanceHistory: Recent operations
- showHistoryDialog: History dialog visibility

**API Integration:**
- GET /api/database/health - Load health report
- POST /api/database/maintenance - Execute operations
- GET /api/database/maintenance - Load history
- PATCH /api/database/alerts - Acknowledge/resolve alerts

**Polling Strategy:**
- Auto-refresh enabled by default
- 30-second interval (configurable via checkbox)
- Silent refresh (no loading spinner)
- Manual refresh available
- Cleanup interval on unmount

**Error Handling:**
- Try-catch around all API calls
- Error states displayed in Alert components
- Console logging for debugging
- User-friendly error messages
- Graceful degradation if API fails

**Performance:**
- Polling optimized with silent updates
- Large tables rendered efficiently
- Maintenance operations non-blocking
- Cancel pending operations on unmount

**VALIDATION REQUIREMENTS:**

1. **Manual Testing:**
   - Open Database Health view → verify loads metrics
   - Wait 30 seconds → verify auto-refresh works
   - Click manual refresh → verify updates immediately
   - Disable auto-refresh → verify stops polling
   - Click Vacuum button → verify confirmation dialog
   - Execute maintenance → verify operation runs
   - Check history → verify operation logged
   - Acknowledge alert → verify alert dismissed
   
2. **Integration Testing:**
   - Verify API routes return correct data
   - Verify maintenance operations execute successfully
   - Verify operation history updates
   - Verify alerts acknowledge/resolve correctly
   - Verify polling doesn't cause performance issues
   
3. **Visual Testing:**
   - Verify all metrics display correctly
   - Verify tables render properly
   - Verify responsive layout works
   - Verify color coding intuitive
   - Verify icons enhance clarity
   - Verify dialogs display correctly
   
4. **Functional Testing:**
   - Test auto-refresh toggle
   - Test manual refresh
   - Test maintenance operations
   - Test alert management
   - Test history dialog
   - Test navigation to/from view

**DELIVERABLES:**

1. [ ] `train-wireframe/src/components/views/DatabaseHealthView.tsx` - Complete Database Health View
2. [ ] Database overview metrics section implemented
3. [ ] Tables health table with maintenance actions
4. [ ] Indexes health table with unused index detection
5. [ ] Slow queries table with execution statistics
6. [ ] Connection pool visualization
7. [ ] Recommendations section
8. [ ] Maintenance confirmation dialog
9. [ ] Maintenance history dialog
10. [ ] Navigation integration complete
11. [ ] Auto-refresh polling mechanism working
12. [ ] Manual testing completed with all scenarios passing
13. [ ] Integration testing with backend API completed

Implement this comprehensive Database Health Dashboard UI completely, ensuring all database metrics are visible, maintenance operations are safe and tracked, and administrators can effectively monitor and maintain database health.


++++++++++++++++++


### Prompt 8: Integration, Testing & Deployment (T-4.1.0, T-5.1.0, T-6.1.0)
**Scope**: Application-wide integration, comprehensive testing, production deployment  
**Dependencies**: T-1.1.0 through T-3.3.0 (All foundation and UI tasks)  
**Estimated Time**: 12-16 hours  
**Risk Level**: Medium-High

========================


You are a senior full-stack developer completing the Settings & Administration Module implementation for the Train platform. This final phase integrates all preference and configuration systems throughout the application, implements comprehensive testing, and prepares for production deployment.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
The Settings & Administration Module provides comprehensive customization and monitoring capabilities. This final phase ensures all preference systems work correctly throughout the application, validates functionality through testing, and deploys safely to production with proper monitoring and rollback procedures.

**Functional Requirements (FR8.1.1, FR8.2.1, FR8.2.2):**
- User preferences applied throughout application
- Theme changes reflected in UI immediately
- Rows per page preference applied to all tables
- Default filters auto-applied on dashboard load
- Cross-tab preference synchronization working
- AI configuration used by generation endpoints
- Database health monitoring operational
- Complete test coverage for all services and components
- Database migrations deployed safely to production
- Post-deployment validation successful

**Technical Architecture:**
- **Frontend**: Next.js 14 App Router, TypeScript, React 18, Tailwind CSS
- **Testing**: Vitest, React Testing Library
- **State Management**: Zustand with persistence
- **Backend**: Next.js API routes, Supabase PostgreSQL
- **Deployment**: Supabase migrations, staged rollout

**CURRENT CODEBASE STATE:**

**Existing Implementation:**
1. **Preferences Already Loaded** (`train-wireframe/src/App.tsx:38-49`):
   - loadPreferences() called on mount ✓
   - subscribeToPreferences() implemented for cross-tab sync ✓
   - Cleanup on unmount ✓

2. **User Preferences Service** (`train-wireframe/src/lib/services/user-preferences-service.ts`):
   - Complete service implementation ✓
   - Debounced updates ✓
   - Validation functions ✓

3. **Zustand Store** (`train-wireframe/src/stores/useAppStore.ts`):
   - Preferences state management ✓
   - Update actions ✓
   - Persistence ✓

4. **Views Implemented**:
   - SettingsView (Prompt 5) ✓
   - AIConfigView (Prompt 6) ✓
   - DatabaseHealthView (Prompt 7) ✓

**Gaps to Fill:**
- Theme application logic (CSS class toggling)
- Apply rowsPerPage preference to DashboardView and other table views
- Apply default filters on dashboard load
- Integrate AI configuration with generation endpoints
- Unit tests for all services
- Component tests for Settings/AIConfig/DatabaseHealth views
- API route tests
- Integration tests
- Deployment procedures documentation

**IMPLEMENTATION TASKS:**

**Task T-4.1.1: Theme Application Logic**

Create theme application utility in `train-wireframe/src/lib/theme.ts`:

```typescript
/**
 * Theme Application Utility
 * 
 * Handles theme application based on user preferences:
 * - 'light': Force light theme
 * - 'dark': Force dark theme  
 * - 'system': Follow system preference
 */

export type Theme = 'light' | 'dark' | 'system';

/**
 * Apply theme to document root
 * 
 * @param theme - User's theme preference
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  
  if (theme === 'system') {
    // Follow system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemPrefersDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  } else {
    // Apply explicit theme
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
}

/**
 * Initialize theme application with system preference listener
 * 
 * @param theme - User's theme preference
 * @returns Cleanup function to remove listener
 */
export function initializeTheme(theme: Theme): () => void {
  // Apply initial theme
  applyTheme(theme);
  
  // If system theme, listen for system preference changes
  if (theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    
    mediaQuery.addEventListener('change', handler);
    
    // Return cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }
  
  // No cleanup needed for explicit themes
  return () => {};
}
```

Update `train-wireframe/src/App.tsx` to apply theme on preferences load:

```typescript
import { useEffect } from 'react';
import { initializeTheme } from './lib/theme';
// ... other imports

export default function App() {
  const { 
    currentView,
    setConversations,
    setTemplates,
    setScenarios,
    setEdgeCases,
    loadPreferences,
    subscribeToPreferences,
    unsubscribeFromPreferences,
    preferences,
    preferencesLoaded,
  } = useAppStore();
  
  // ... existing effects ...
  
  // Apply theme when preferences loaded or changed
  useEffect(() => {
    if (!preferencesLoaded) return;
    
    const cleanup = initializeTheme(preferences.theme);
    
    return cleanup;
  }, [preferences.theme, preferencesLoaded]);
  
  // ... rest of component
}
```

Add dark mode styles to `train-wireframe/src/index.css`:

```css
/* Dark mode styles */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}

.dark body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

**Task T-4.1.2: Apply rowsPerPage Preference to Tables**

Update `train-wireframe/src/components/dashboard/DashboardView.tsx` to use preference:

```typescript
export function DashboardView() {
  const { 
    conversations, 
    filters, 
    searchQuery,
    openGenerationModal,
    preferences,  // ADD THIS
  } = useAppStore();
  
  const [currentPage, setCurrentPage] = useState(1);
  // REMOVE local state: const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Use preference instead
  const rowsPerPage = preferences.rowsPerPage;
  
  // ... rest of component (remove setRowsPerPage usage)
}
```

Apply similar changes to other views with tables:
- TemplatesView
- ScenariosView  
- EdgeCasesView
- ReviewQueueView

**Task T-4.1.3: Apply Default Filters on Dashboard Load**

Update `train-wireframe/src/components/dashboard/DashboardView.tsx` to apply default filters:

```typescript
export function DashboardView() {
  const { 
    conversations, 
    filters,
    setFilters,  // ADD THIS
    searchQuery,
    openGenerationModal,
    preferences,
    preferencesLoaded,  // ADD THIS
  } = useAppStore();
  
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Apply default filters on load (once)
  useEffect(() => {
    if (!preferencesLoaded || filtersApplied) return;
    
    if (preferences.defaultFilters.autoApply) {
      const defaultFilters: ConversationFilters = {};
      
      if (preferences.defaultFilters.tier) {
        defaultFilters.tier = preferences.defaultFilters.tier;
      }
      
      if (preferences.defaultFilters.status) {
        defaultFilters.status = preferences.defaultFilters.status;
      }
      
      if (preferences.defaultFilters.qualityRange) {
        defaultFilters.qualityScoreMin = preferences.defaultFilters.qualityRange[0];
        defaultFilters.qualityScoreMax = preferences.defaultFilters.qualityRange[1];
      }
      
      setFilters(defaultFilters);
      setFiltersApplied(true);
    }
  }, [preferencesLoaded, preferences.defaultFilters, filtersApplied, setFilters]);
  
  // ... rest of component
}
```

**Task T-4.1.4: Integrate AI Configuration with Generation**

Update generation API route to use AI configuration:

Create `src/app/api/generate/route.ts` (or update existing):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { aiConfigService } from '@/lib/services/ai-config-service';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { prompt, conversationId } = body;
    
    // Get user's AI configuration
    const aiConfig = await aiConfigService.getEffectiveConfiguration(user.id);
    
    // Initialize Anthropic client with user's configuration
    const anthropic = new Anthropic({
      apiKey: aiConfig.apiKeys.primaryKey,
    });
    
    // Generate with user's model configuration
    const message = await anthropic.messages.create({
      model: aiConfig.model.model,
      max_tokens: aiConfig.model.maxTokens,
      temperature: aiConfig.model.temperature,
      top_p: aiConfig.model.topP,
      messages: [{ role: 'user', content: prompt }],
    });
    
    // Extract response
    const content = message.content[0];
    const responseText = content.type === 'text' ? content.text : '';
    
    // Calculate cost
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    
    return NextResponse.json({
      success: true,
      response: responseText,
      usage: {
        inputTokens,
        outputTokens,
        cost: calculateCost(inputTokens, outputTokens, aiConfig.model.model),
      },
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    );
  }
}

function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  // Cost calculation logic from ai-config.ts
  const AVAILABLE_MODELS: Record<string, { costPer1kInputTokens: number; costPer1kOutputTokens: number }> = {
    'claude-sonnet-4-5-20250929': { costPer1kInputTokens: 0.003, costPer1kOutputTokens: 0.015 },
    'claude-3-opus-20240229': { costPer1kInputTokens: 0.015, costPer1kOutputTokens: 0.075 },
    'claude-3-haiku-20240307': { costPer1kInputTokens: 0.00025, costPer1kOutputTokens: 0.00125 },
  };
  
  const capabilities = AVAILABLE_MODELS[model];
  if (!capabilities) return 0;
  
  const inputCost = (inputTokens / 1000) * capabilities.costPer1kInputTokens;
  const outputCost = (outputTokens / 1000) * capabilities.costPer1kOutputTokens;
  
  return inputCost + outputCost;
}
```

**Task T-4.1.5: Unit Tests for Services**

Create `src/lib/services/__tests__/user-preferences-service.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userPreferencesService } from '../user-preferences-service';
import { DEFAULT_USER_PREFERENCES } from '../../types/user-preferences';

// Mock Supabase client
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { preferences: DEFAULT_USER_PREFERENCES }, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

describe('UserPreferencesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('getPreferences', () => {
    it('should return user preferences', async () => {
      const prefs = await userPreferencesService.getPreferences('test-user-id');
      
      expect(prefs).toBeDefined();
      expect(prefs.theme).toBe('system');
      expect(prefs.rowsPerPage).toBe(25);
    });
    
    it('should return defaults on error', async () => {
      // Mock error response
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: new Error('Database error') })),
          })),
        })),
      } as any);
      
      const prefs = await userPreferencesService.getPreferences('test-user-id');
      
      expect(prefs).toEqual(DEFAULT_USER_PREFERENCES);
    });
  });
  
  describe('updatePreferences', () => {
    it('should update preferences successfully', async () => {
      const result = await userPreferencesService.updatePreferences('test-user-id', {
        theme: 'dark',
      });
      
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });
    
    it('should validate preferences before update', async () => {
      const result = await userPreferencesService.updatePreferences('test-user-id', {
        rowsPerPage: 30 as any, // Invalid value
      });
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
  
  describe('resetToDefaults', () => {
    it('should reset preferences to defaults', async () => {
      const result = await userPreferencesService.resetToDefaults('test-user-id');
      
      expect(result.success).toBe(true);
    });
  });
});
```

Create similar test files for:
- `ai-config-service.test.ts`
- `database-health-service.test.ts`
- `database-maintenance-service.test.ts`
- `config-rollback-service.test.ts`

**Task T-4.1.6: Component Tests**

Create `train-wireframe/src/components/views/__tests__/SettingsView.test.tsx`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsView } from '../SettingsView';
import { useAppStore } from '../../../stores/useAppStore';

// Mock Zustand store
vi.mock('../../../stores/useAppStore', () => ({
  useAppStore: vi.fn(),
}));

describe('SettingsView', () => {
  const mockUpdatePreferences = vi.fn();
  const mockResetPreferences = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useAppStore).mockReturnValue({
      preferences: {
        theme: 'system',
        sidebarCollapsed: false,
        tableDensity: 'comfortable',
        rowsPerPage: 25,
        enableAnimations: true,
        // ... other default preferences
      },
      updatePreferences: mockUpdatePreferences,
      resetPreferences: mockResetPreferences,
    } as any);
  });
  
  it('renders settings sections', () => {
    render(<SettingsView />);
    
    expect(screen.getByText('Theme & Display')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Default Filters')).toBeInTheDocument();
    expect(screen.getByText('Export Preferences')).toBeInTheDocument();
  });
  
  it('updates theme preference', async () => {
    render(<SettingsView />);
    
    const themeSelect = screen.getByLabelText('Color Theme');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    
    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        theme: 'dark',
      });
    });
  });
  
  it('toggles animation preference', async () => {
    render(<SettingsView />);
    
    const animationsSwitch = screen.getByLabelText('Enable Animations');
    fireEvent.click(animationsSwitch);
    
    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        enableAnimations: false,
      });
    });
  });
  
  it('resets all settings', async () => {
    render(<SettingsView />);
    
    const resetButton = screen.getByText('Reset All');
    fireEvent.click(resetButton);
    
    // Confirm dialog
    // Note: This depends on your confirm implementation
    
    await waitFor(() => {
      expect(mockResetPreferences).toHaveBeenCalled();
    });
  });
});
```

Create similar test files for:
- `AIConfigView.test.tsx`
- `DatabaseHealthView.test.tsx`

**Task T-4.1.7: API Route Tests**

Create `src/app/api/user-preferences/__tests__/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PATCH, POST } from '../route';
import { NextRequest } from 'next/server';

// Mock Supabase auth
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })),
    },
  })),
}));

// Mock user preferences service
vi.mock('@/lib/services/user-preferences-service', () => ({
  userPreferencesService: {
    getPreferences: vi.fn(() => Promise.resolve({ theme: 'system' })),
    updatePreferences: vi.fn(() => Promise.resolve({ success: true })),
    resetToDefaults: vi.fn(() => Promise.resolve({ success: true })),
  },
}));

describe('User Preferences API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('GET /api/user-preferences', () => {
    it('returns user preferences', async () => {
      const request = new NextRequest('http://localhost/api/user-preferences');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.preferences).toBeDefined();
    });
    
    it('returns 401 for unauthenticated users', async () => {
      // Mock unauthenticated user
      vi.mocked(createRouteHandlerClient).mockReturnValueOnce({
        auth: {
          getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        },
      } as any);
      
      const request = new NextRequest('http://localhost/api/user-preferences');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('PATCH /api/user-preferences', () => {
    it('updates user preferences', async () => {
      const request = new NextRequest('http://localhost/api/user-preferences', {
        method: 'PATCH',
        body: JSON.stringify({ theme: 'dark' }),
      });
      
      const response = await PATCH(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
  
  describe('POST /api/user-preferences', () => {
    it('resets preferences', async () => {
      const request = new NextRequest('http://localhost/api/user-preferences', {
        method: 'POST',
        body: JSON.stringify({ action: 'reset' }),
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
```

Create similar test files for:
- `ai-configuration/route.test.ts`
- `database/health/route.test.ts`
- `database/maintenance/route.test.ts`
- `config/change-history/route.test.ts`
- `config/rollback/route.test.ts`

**Task T-4.1.8: Integration Tests**

Create `__tests__/integration/preferences-integration.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Integration tests require actual Supabase instance
// Use test environment credentials

describe('User Preferences Integration', () => {
  let supabase: any;
  let testUserId: string;
  
  beforeAll(async () => {
    // Initialize test Supabase client
    supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    
    // Create test user
    const { data, error } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'test-password-123',
    });
    
    if (error) throw error;
    testUserId = data.user.id;
  });
  
  afterAll(async () => {
    // Cleanup: delete test user
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });
  
  it('should initialize default preferences for new user', async () => {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', testUserId)
      .single();
    
    expect(error).toBeNull();
    expect(data.preferences).toBeDefined();
    expect(data.preferences.theme).toBe('system');
  });
  
  it('should update preferences', async () => {
    const { error } = await supabase
      .from('user_preferences')
      .update({
        preferences: {
          theme: 'dark',
          rowsPerPage: 50,
        },
      })
      .eq('user_id', testUserId);
    
    expect(error).toBeNull();
    
    // Verify update
    const { data: updated } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', testUserId)
      .single();
    
    expect(updated.preferences.theme).toBe('dark');
    expect(updated.preferences.rowsPerPage).toBe(50);
  });
  
  it('should log preference changes to audit trail', async () => {
    // Update preferences
    await supabase
      .from('user_preferences')
      .update({
        preferences: { theme: 'light' },
      })
      .eq('user_id', testUserId);
    
    // Check audit log
    const { data: auditLogs } = await supabase
      .from('configuration_audit_log')
      .select('*')
      .eq('config_type', 'user_preference')
      .eq('changed_by', testUserId);
    
    expect(auditLogs).toBeDefined();
    expect(auditLogs.length).toBeGreaterThan(0);
  });
});
```

**Task T-4.1.9: Database Migration Deployment Procedures**

Create `MIGRATION_DEPLOYMENT_GUIDE.md`:

```markdown
# Settings & Administration Module - Database Migration Deployment Guide

## Overview

This guide covers the safe deployment of database migrations for the Settings & Administration Module (E08).

## Prerequisites

- [ ] All code changes deployed to staging
- [ ] Staging validation completed successfully
- [ ] Database backup created
- [ ] Rollback procedures tested in staging
- [ ] Downtime window scheduled (if needed)
- [ ] Team notified of deployment

## Migration Files

The following migrations must be applied in order:

1. `20251101_create_user_preferences.sql` - User preferences table
2. `20251101_create_ai_configurations.sql` - AI configurations table
3. `20251101_create_maintenance_operations.sql` - Maintenance operations log
4. `20251101_create_configuration_audit_log.sql` - Configuration audit trail

## Pre-Deployment Checklist

### Staging Environment

- [ ] Apply migrations to staging database
- [ ] Verify RLS policies work correctly
- [ ] Verify triggers fire as expected
- [ ] Test user preference CRUD operations
- [ ] Test AI configuration CRUD operations
- [ ] Test configuration rollback functionality
- [ ] Test database health monitoring queries
- [ ] Verify audit trail captures all changes
- [ ] Performance test: preference queries < 100ms
- [ ] Performance test: health queries < 500ms

### Production Backup

- [ ] Create full database backup
- [ ] Verify backup is complete and valid
- [ ] Store backup in secure location
- [ ] Document backup timestamp and size
- [ ] Test restore procedure (optional, recommended)

### Rollback Scripts

Prepare rollback scripts in reverse order:

```sql
-- Rollback 4: Drop configuration audit log
DROP TRIGGER IF EXISTS user_preferences_audit_trigger ON public.user_preferences;
DROP FUNCTION IF EXISTS public.log_user_preferences_changes();
DROP POLICY IF EXISTS "No deletes from audit log" ON public.configuration_audit_log;
DROP POLICY IF EXISTS "No updates to audit log" ON public.configuration_audit_log;
DROP POLICY IF EXISTS "Users can view own configuration audit logs" ON public.configuration_audit_log;
DROP TABLE IF EXISTS public.configuration_audit_log;

-- Rollback 3: Drop maintenance operations log
DROP POLICY IF EXISTS "Admins can insert maintenance operations" ON public.maintenance_operations;
DROP POLICY IF EXISTS "Authenticated users can view maintenance operations" ON public.maintenance_operations;
DROP TABLE IF EXISTS public.maintenance_operations;

-- Rollback 2: Drop AI configurations
DROP TRIGGER IF EXISTS ai_configuration_audit_trigger ON public.ai_configurations;
DROP FUNCTION IF EXISTS public.log_ai_config_changes();
DROP FUNCTION IF EXISTS public.get_effective_ai_config(UUID);
DROP TABLE IF EXISTS public.ai_configuration_audit;
DROP TABLE IF EXISTS public.ai_configurations;

-- Rollback 1: Drop user preferences
DROP TRIGGER IF EXISTS initialize_user_preferences_on_signup ON auth.users;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
DROP FUNCTION IF EXISTS public.initialize_user_preferences();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP TABLE IF EXISTS public.user_preferences;
```

## Deployment Steps

### Step 1: Pre-Migration Validation

1. Verify production database connection:
```sql
SELECT version();
SELECT current_database();
```

2. Check for conflicting table names:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_preferences', 'ai_configurations', 'maintenance_operations', 'configuration_audit_log');
```

Expected: 0 rows (tables don't exist yet)

3. Verify auth.users table exists:
```sql
SELECT COUNT(*) FROM auth.users;
```

### Step 2: Apply Migrations

Execute migrations in Supabase SQL Editor in order:

1. Migration 1: User Preferences
```bash
# Copy SQL from 04-FR-wireframes-execution-E08.md lines 166-280
```

Verify:
```sql
SELECT COUNT(*) FROM public.user_preferences;
-- Expected: Number of existing users (auto-initialized)

SELECT * FROM pg_policies WHERE tablename = 'user_preferences';
-- Expected: 3 policies
```

2. Migration 2: AI Configurations
```bash
# Copy SQL from 04-FR-wireframes-execution-E08.md lines 284-486
```

Verify:
```sql
SELECT COUNT(*) FROM public.ai_configurations;
-- Expected: 0 (no configurations yet)

SELECT * FROM pg_policies WHERE tablename = 'ai_configurations';
-- Expected: 4 policies

SELECT proname FROM pg_proc WHERE proname = 'get_effective_ai_config';
-- Expected: 1 row (function exists)
```

3. Migration 3: Maintenance Operations
```bash
# Copy SQL from 04-FR-wireframes-execution-E08.md lines 490-538
```

Verify:
```sql
SELECT COUNT(*) FROM public.maintenance_operations;
-- Expected: 0

SELECT * FROM pg_policies WHERE tablename = 'maintenance_operations';
-- Expected: 2 policies
```

4. Migration 4: Configuration Audit Log
```bash
# Copy SQL from 04-FR-wireframes-execution-E08.md lines 542-629
```

Verify:
```sql
SELECT COUNT(*) FROM public.configuration_audit_log;
-- Expected: 0

SELECT tgname FROM pg_trigger WHERE tgname = 'user_preferences_audit_trigger';
-- Expected: 1 row (trigger exists)
```

### Step 3: Post-Migration Validation

1. Test user preferences initialization:
```sql
-- Create test user via Supabase Auth UI
-- Then verify preferences auto-initialized:
SELECT * FROM public.user_preferences WHERE user_id = '<test-user-id>';
-- Expected: 1 row with default preferences
```

2. Test RLS policies:
```sql
-- As test user, try to access another user's preferences
-- Should return 0 rows (RLS blocks access)
```

3. Test audit trail:
```sql
-- Update preferences as test user
UPDATE public.user_preferences 
SET preferences = jsonb_set(preferences, '{theme}', '"dark"')
WHERE user_id = '<test-user-id>';

-- Verify audit log entry
SELECT * FROM public.configuration_audit_log 
WHERE changed_by = '<test-user-id>';
-- Expected: 1+ rows
```

4. Test AI configuration fallback:
```sql
SELECT public.get_effective_ai_config('<test-user-id>');
-- Expected: JSON with default configuration
```

5. Performance validation:
```sql
EXPLAIN ANALYZE
SELECT preferences FROM public.user_preferences WHERE user_id = '<test-user-id>';
-- Expected: Execution time < 100ms
```

## Monitoring Post-Deployment

### Critical Metrics to Monitor

1. **User Preferences Queries** (first 24 hours):
- Query count: Should match user login count
- Average execution time: < 100ms
- Error rate: < 0.1%

2. **Configuration Audit Log** (first 24 hours):
- Insert count: Should match preference updates
- Table size growth: < 10MB per day

3. **Database Health Queries** (first hour):
- Execution time: < 500ms
- No index scan errors

### Alerts to Configure

```sql
-- Alert on slow preference queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
WHERE query LIKE '%user_preferences%' 
AND mean_exec_time > 100;

-- Alert on failed preference updates
SELECT * FROM pg_stat_database 
WHERE datname = current_database() 
AND conflicts > 0;

-- Alert on high audit log growth
SELECT pg_size_pretty(pg_total_relation_size('public.configuration_audit_log'));
```

## Rollback Procedures

### When to Rollback

Rollback if any of these occur within 1 hour:
- Error rate > 5% on preference queries
- Any RLS policy failures
- Trigger failures preventing updates
- Performance degradation > 50%

### Rollback Execution

1. Stop application deployments
2. Execute rollback scripts (reverse order)
3. Restore database from backup (if needed)
4. Verify rollback successful
5. Restart application with previous code version
6. Monitor for 30 minutes

### Post-Rollback

1. Document rollback reason
2. Analyze failure cause
3. Fix issues in staging
4. Re-validate in staging
5. Schedule new deployment

## Success Criteria

Deployment is successful when:
- [ ] All migrations applied without errors
- [ ] All RLS policies enforce correct access
- [ ] All triggers fire correctly
- [ ] Audit trail captures all changes
- [ ] Performance within acceptable limits
- [ ] No errors in application logs (1 hour)
- [ ] User preferences load correctly
- [ ] AI configuration fallback works
- [ ] Database health dashboard displays metrics
- [ ] Cross-tab preference sync works

## Deployment Checklist Summary

### Pre-Deployment
- [ ] Code deployed to staging
- [ ] Staging validation passed
- [ ] Production backup created
- [ ] Rollback scripts prepared
- [ ] Team notified

### Deployment
- [ ] Migration 1 applied and verified
- [ ] Migration 2 applied and verified
- [ ] Migration 3 applied and verified
- [ ] Migration 4 applied and verified
- [ ] Post-migration validation passed

### Post-Deployment
- [ ] Monitoring configured
- [ ] Alerts configured
- [ ] Performance within limits
- [ ] No errors in logs (1 hour)
- [ ] User acceptance testing passed
- [ ] Documentation updated
- [ ] Team notified of completion

## Support Contacts

- Database Admin: [contact]
- Backend Lead: [contact]
- DevOps: [contact]
- On-Call Engineer: [contact]
```

**ACCEPTANCE CRITERIA:**

1. **Theme Application:**
   - [ ] Theme preference applied on app load
   - [ ] Theme changes reflected immediately
   - [ ] System theme follows OS preference
   - [ ] Dark mode styles applied correctly
   - [ ] Light mode styles applied correctly
   - [ ] Theme persists across sessions
   
2. **Rows Per Page Integration:**
   - [ ] Dashboard uses preference value
   - [ ] All table views respect preference
   - [ ] Pagination works correctly with preference
   - [ ] Changing preference updates tables
   
3. **Default Filters Integration:**
   - [ ] Auto-apply setting respected
   - [ ] Default filters applied on dashboard load
   - [ ] Only applies once per session
   - [ ] Filters match preference configuration
   
4. **AI Configuration Integration:**
   - [ ] Generation endpoints use user configuration
   - [ ] Fallback chain works correctly
   - [ ] Cost calculation accurate
   - [ ] Configuration changes affect generation
   
5. **Unit Tests:**
   - [ ] All services have test coverage
   - [ ] All validators have test coverage
   - [ ] Tests pass without errors
   - [ ] Coverage > 85% for services
   - [ ] Mocks work correctly
   
6. **Component Tests:**
   - [ ] Settings view tests pass
   - [ ] AI Config view tests pass
   - [ ] Database Health view tests pass
   - [ ] Coverage > 80% for components
   - [ ] User interactions tested
   
7. **API Route Tests:**
   - [ ] All routes have test coverage
   - [ ] Authentication tested
   - [ ] Validation tested
   - [ ] Error handling tested
   - [ ] Success responses tested
   
8. **Integration Tests:**
   - [ ] Preference CRUD operations work
   - [ ] Audit trail captures changes
   - [ ] RLS policies enforce isolation
   - [ ] Cross-tab sync works
   - [ ] End-to-end flows validated
   
9. **Deployment Procedures:**
   - [ ] Migration guide complete
   - [ ] Rollback procedures documented
   - [ ] Monitoring alerts configured
   - [ ] Success criteria defined
   - [ ] Support contacts listed
   
10. **Production Readiness:**
    - [ ] All tests passing
    - [ ] Staging validation complete
    - [ ] Performance requirements met
    - [ ] Security review passed
    - [ ] Documentation complete
    - [ ] Team trained

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
train-wireframe/src/lib/theme.ts (NEW)
train-wireframe/src/App.tsx (UPDATE)
train-wireframe/src/index.css (UPDATE)
train-wireframe/src/components/dashboard/DashboardView.tsx (UPDATE)
src/app/api/generate/route.ts (NEW or UPDATE)
src/lib/services/__tests__/ (NEW - multiple test files)
train-wireframe/src/components/views/__tests__/ (NEW - multiple test files)
src/app/api/**/__tests__/ (NEW - multiple test files)
__tests__/integration/ (NEW)
MIGRATION_DEPLOYMENT_GUIDE.md (NEW)
```

**Testing Strategy:**
- Unit tests for all services (Vitest)
- Component tests for all views (React Testing Library)
- API route tests for all endpoints
- Integration tests for critical flows
- Manual testing for user experience
- Performance testing for database queries
- Security testing for RLS policies

**Deployment Strategy:**
- Stage 1: Deploy code to staging
- Stage 2: Validate in staging (24 hours)
- Stage 3: Apply migrations to production
- Stage 4: Deploy code to production
- Stage 5: Monitor (1 hour intensive, 24 hour normal)
- Stage 6: User acceptance testing
- Stage 7: Full rollout

**Performance Targets:**
- Theme application: < 50ms
- Preference load: < 100ms
- Preference update: < 200ms
- AI config load: < 100ms
- Database health query: < 500ms
- Table render with preferences: < 200ms

**Security Considerations:**
- RLS policies prevent cross-user access
- Audit trail immutable (append-only)
- API keys encrypted in database
- Authentication required for all routes
- Validation on client and server
- CSRF protection via Supabase

**VALIDATION REQUIREMENTS:**

1. **Manual Testing:**
   - Change theme → verify applies immediately
   - Change rowsPerPage → verify tables update
   - Enable default filters → verify dashboard loads with filters
   - Update AI config → verify generation uses new config
   - Check audit trail → verify all changes logged
   - Test cross-tab sync → verify changes propagate
   
2. **Automated Testing:**
   - Run all unit tests: `npm test`
   - Run all component tests: `npm test:components`
   - Run all API tests: `npm test:api`
   - Run integration tests: `npm test:integration`
   - Check coverage: `npm run coverage`
   
3. **Staging Validation:**
   - Deploy code to staging
   - Apply migrations to staging database
   - Run full test suite in staging
   - Perform manual testing in staging
   - Verify performance in staging
   - Test rollback in staging
   
4. **Production Validation:**
   - Monitor error rates
   - Monitor query performance
   - Monitor audit log growth
   - Verify user preferences load
   - Verify theme application
   - Verify no RLS violations
   
5. **Rollback Testing:**
   - Test rollback scripts in staging
   - Verify data integrity after rollback
   - Verify application works after rollback
   - Document rollback timing

**DELIVERABLES:**

1. [ ] `train-wireframe/src/lib/theme.ts` - Theme application utility
2. [ ] Theme application integrated in App.tsx
3. [ ] Dark mode styles in index.css
4. [ ] rowsPerPage preference applied to all tables
5. [ ] Default filters applied on dashboard load
6. [ ] AI configuration integrated with generation
7. [ ] Unit tests for all services (5+ test files)
8. [ ] Component tests for all views (3+ test files)
9. [ ] API route tests for all endpoints (6+ test files)
10. [ ] Integration tests for critical flows
11. [ ] `MIGRATION_DEPLOYMENT_GUIDE.md` complete
12. [ ] All tests passing
13. [ ] Staging validation complete
14. [ ] Production deployment ready
15. [ ] Post-deployment monitoring configured

Implement this comprehensive integration, testing, and deployment phase completely, ensuring all preference systems work throughout the application, all functionality is thoroughly tested, and the system is ready for safe production deployment with proper monitoring and rollback procedures.


++++++++++++++++++


## Document Summary

This Part 4 document provides detailed execution instructions for **Prompts 7-8** of the Settings & Administration Module (E08):

**Prompt 7: Database Health Dashboard UI (T-3.3.0)**
- New DatabaseHealthView component with comprehensive monitoring
- Database overview metrics (size, cache hit ratio, connections, transactions)
- Tables health table with maintenance action buttons
- Indexes health table with unused index highlighting
- Slow queries table with execution statistics
- Connection pool visualization with utilization metrics
- Health recommendations section
- Maintenance operation confirmation dialogs
- Operation history tracking
- Real-time auto-refresh (30-second interval)
- Alert management (acknowledge/resolve)
- Navigation integration
- **Estimated Time**: 12-14 hours

**Prompt 8: Integration, Testing & Deployment (T-4.1.0, T-5.1.0, T-6.1.0)**
- Theme application logic with system preference support
- rowsPerPage preference applied to all table views
- Default filters auto-applied on dashboard load
- AI configuration integrated with generation endpoints
- Comprehensive unit test suite for all services
- Component tests for all views
- API route tests for all endpoints
- Integration tests for critical workflows
- Database migration deployment procedures
- Rollback procedures and monitoring alerts
- Production readiness validation
- **Estimated Time**: 12-16 hours

**Total Implementation Time**: 24-30 hours (3-4 days)

**Complete E08 Module Summary:**
- **Prompt 1**: User Preferences Foundation (6-8 hours)
- **Prompt 2**: AI Configuration Foundation (8-10 hours)
- **Prompt 3**: Database Health Monitoring Foundation (10-12 hours)
- **Prompt 4**: Configuration Change Management (8-10 hours)
- **Prompt 5**: Settings View UI Enhancement (12-14 hours)
- **Prompt 6**: AI Configuration Settings UI (10-12 hours)
- **Prompt 7**: Database Health Dashboard UI (12-14 hours)
- **Prompt 8**: Integration, Testing & Deployment (12-16 hours)

**Total Module Time**: 78-96 hours (approximately 10-12 working days)

**Module Completion Criteria:**
- All 8 prompts implemented successfully
- User preferences working throughout application
- AI configuration controlling generation behavior
- Database health monitoring operational
- Configuration change management tracking all changes
- All UI views functional and tested
- Theme application working correctly
- Preferences applied to all relevant components
- Comprehensive test coverage (>85% services, >80% components)
- Database migrations deployed safely to production
- Post-deployment monitoring configured
- Rollback procedures tested and documented
- User acceptance testing completed

**Next Steps After E08:**
The Settings & Administration Module provides foundational infrastructure used by all other modules. With this complete, the platform has:
- Comprehensive user customization capabilities
- Enterprise-grade configuration management
- Production-ready database monitoring
- Complete audit trails for compliance
- Robust testing and deployment procedures

This enables confident deployment and scaling of the Train platform for LoRA training data generation workflows.

---

**Document Status**: Complete (Prompts 7-8 Detailed)  
**Output Location**: `pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E08-part4.md`  
**Total Lines**: 2400+
**Ready for**: Implementation by development team using Claude-4.5-sonnet

**All E08 Execution Documents:**
- Part 1 (Main): `04-FR-wireframes-execution-E08.md` (Prompts 1-2 detailed, 3-8 summarized)
- Part 2: `04-FR-wireframes-execution-E08-part2.md` (Prompts 3-4 detailed)
- Part 3: `04-FR-wireframes-execution-E08-part3.md` (Prompts 5-6 detailed)
- Part 4: `04-FR-wireframes-execution-E08-part4.md` (Prompts 7-8 detailed)

