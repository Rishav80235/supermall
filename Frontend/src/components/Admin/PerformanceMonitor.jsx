import React, { useState, useEffect, useContext } from 'react';
import { Activity, Database, Zap, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { AppContext } from '../../App';

const PerformanceMonitor = () => {
  const { performanceService, cacheService, databaseService } = useContext(AppContext);
  const [metrics, setMetrics] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [dbMetrics, setDbMetrics] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      if (performanceService) {
        setMetrics(performanceService.getPerformanceReport());
      }
      if (cacheService) {
        setCacheStats(cacheService.getStats());
      }
      if (databaseService) {
        setDbMetrics(databaseService.getPerformanceMetrics());
      }
    };

    // Update metrics immediately
    updateMetrics();

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [performanceService, cacheService, databaseService]);

  const getStatusColor = (value, threshold, reverse = false) => {
    const isGood = reverse ? value < threshold : value < threshold;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (value, threshold, reverse = false) => {
    const isGood = reverse ? value < threshold : value < threshold;
    return isGood ? CheckCircle : AlertTriangle;
  };

  if (!metrics && !cacheStats && !dbMetrics) {
    return (
      <div className="tab-content">
        <div className="admin-actions">
          <h3>Performance Monitor</h3>
          <p className="text-gray-600">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="admin-actions">
        <h3>Performance Monitor</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (isMonitoring) {
                performanceService?.stopMonitoring();
                setIsMonitoring(false);
              } else {
                performanceService?.startMonitoring();
                setIsMonitoring(true);
              }
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isMonitoring 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
          <button
            onClick={() => {
              cacheService?.clear();
              setCacheStats(cacheService?.getStats());
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Cache
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        {metrics && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-6 w-6 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">Performance Metrics</h4>
            </div>
            
            <div className="space-y-4">
              {metrics.pageLoad && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Page Load Time</span>
                  <div className="flex items-center gap-2">
                    {React.createElement(getStatusIcon(metrics.pageLoad.average, 3000), {
                      className: `h-4 w-4 ${getStatusColor(metrics.pageLoad.average, 3000)}`
                    })}
                    <span className={`font-medium ${getStatusColor(metrics.pageLoad.average, 3000)}`}>
                      {metrics.pageLoad.average}ms
                    </span>
                  </div>
                </div>
              )}
              
              {metrics.apiResponse && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Response Time</span>
                  <div className="flex items-center gap-2">
                    {React.createElement(getStatusIcon(metrics.apiResponse.average, 2000), {
                      className: `h-4 w-4 ${getStatusColor(metrics.apiResponse.average, 2000)}`
                    })}
                    <span className={`font-medium ${getStatusColor(metrics.apiResponse.average, 2000)}`}>
                      {metrics.apiResponse.average}ms
                    </span>
                  </div>
                </div>
              )}
              
              {metrics.render && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Render Time</span>
                  <div className="flex items-center gap-2">
                    {React.createElement(getStatusIcon(metrics.render.average, 100), {
                      className: `h-4 w-4 ${getStatusColor(metrics.render.average, 100)}`
                    })}
                    <span className={`font-medium ${getStatusColor(metrics.render.average, 100)}`}>
                      {metrics.render.average}ms
                    </span>
                  </div>
                </div>
              )}
              
              {metrics.memory && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <div className="flex items-center gap-2">
                    {React.createElement(getStatusIcon(metrics.memory.average, 50 * 1024 * 1024, true), {
                      className: `h-4 w-4 ${getStatusColor(metrics.memory.average, 50 * 1024 * 1024, true)}`
                    })}
                    <span className={`font-medium ${getStatusColor(metrics.memory.average, 50 * 1024 * 1024, true)}`}>
                      {performanceService?.formatBytes(metrics.memory.average)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cache Statistics */}
        {cacheStats && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-green-600" />
              <h4 className="text-lg font-semibold text-gray-900">Cache Statistics</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cache Size</span>
                <span className="font-medium text-gray-900">
                  {cacheStats.size} / {cacheStats.maxSize}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Size</span>
                <span className="font-medium text-gray-900">{cacheStats.totalSize}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expired Items</span>
                <span className="font-medium text-orange-600">{cacheStats.expiredCount}</span>
              </div>
              
              {cacheStats.oldestItem && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Oldest Item</span>
                  <span className="font-medium text-gray-900">
                    {Math.round(cacheStats.oldestItem.age / 1000)}s ago
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Database Metrics */}
        {dbMetrics && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Database Metrics</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mode</span>
                <span className={`font-medium px-2 py-1 rounded text-xs ${
                  dbMetrics.mode === 'realtime' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {dbMetrics.mode}
                </span>
              </div>
              
              {dbMetrics.cacheSize !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cache Size</span>
                  <span className="font-medium text-gray-900">{dbMetrics.cacheSize}</span>
                </div>
              )}
              
              {dbMetrics.activeListeners !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Listeners</span>
                  <span className="font-medium text-gray-900">{dbMetrics.activeListeners}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Network Statistics */}
        {metrics?.network && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              <h4 className="text-lg font-semibold text-gray-900">Network Statistics</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Requests</span>
                <span className="font-medium text-gray-900">{metrics.network.totalRequests}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Size</span>
                <span className="font-medium text-gray-900">{metrics.network.totalSize}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Duration</span>
                <span className="font-medium text-gray-900">{metrics.network.averageDuration}ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {metrics?.recommendations && metrics.recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2 xl:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <h4 className="text-lg font-semibold text-gray-900">Performance Recommendations</h4>
            </div>
            
            <div className="space-y-3">
              {metrics.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-orange-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
