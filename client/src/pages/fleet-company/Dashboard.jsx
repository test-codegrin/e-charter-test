import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Car,
  MapPin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      console.log('Dashboard stats:', response.data);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const numValue = Number(value) || 0;
    return numValue.toFixed(2);
  };

  const formatPercentage = (value) => {
    const numValue = Number(value) || 0;
    if (numValue === 0) return '+0%';
    return numValue >= 0 ? `+${numValue.toFixed(1)}%` : `${numValue.toFixed(1)}%`;
  };

  if (loading) {
    return <Loader text="Preparing Dashboard..." />;
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Drivers',
      value: stats.drivers.total,
      icon: Users,
      color: 'bg-ice-500',
      change: formatPercentage(stats.drivers.total > 0 ? 10 : 0),
      trend: 'up',
    },
    {
      title: 'Total Vehicles',
      value: stats.vehicles.total,
      icon: Car,
      color: 'bg-ice-600',
      change: formatPercentage(stats.vehicles.total > 0 ? 8 : 0),
      trend: 'up',
    },
    {
      title: 'Fleet Companies',
      value: stats.fleet_companies.total,
      icon: Building2,
      color: 'bg-ice-500',
      change: formatPercentage(stats.fleet_companies.total > 0 ? 5 : 0),
      trend: 'up',
    },
    {
      title: 'Total Trips',
      value: stats.trips.total,
      icon: MapPin,
      color: 'bg-ice-700',
      change: formatPercentage(stats.trips.growth),
      trend: stats.trips.growth >= 0 ? 'up' : 'down',
    },
    {
      title: 'Total Revenue',
      value: `$${formatCurrency(stats.revenue.total)}`,
      icon: DollarSign,
      color: 'bg-ice-800',
      change: formatPercentage(stats.revenue.growth),
      trend: stats.revenue.growth >= 0 ? 'up' : 'down',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-dark-800">Admin Dashboard</h1>
        <p className="text-secondary-600">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid - Updated to 5 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <div key={index} className="stat-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-dark-800 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendIcon
                      className={`w-4 h-4 ${stat.trend === 'up' ? 'text-ice-600' : 'text-red-500'}`}
                    />
                    <span
                      className={`text-sm ml-1 ${stat.trend === 'up' ? 'text-ice-600' : 'text-red-600'}`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-secondary-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center shadow-glow floating-icon`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals - Show only items with pending > 0 */}
<div className="card slide-in">
  <h3 className="text-lg font-semibold text-dark-800 mb-4 flex items-center">
    <AlertTriangle className="w-5 h-5 text-warning-500 mr-2" />
    Pending Approvals
  </h3>
  <div className="space-y-3">
    {/* Driver Applications - Only show if pending > 0 */}
    {stats.drivers.pending > 0 && (
      <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
        <div className="flex-1">
          <p className="font-medium text-warning-800">Driver Applications</p>
          <p className="text-sm text-warning-600">Requires review</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-warning-200 text-warning-800 px-2 py-1 rounded-full text-sm font-medium">
            {stats.drivers.pending}
          </span>
          <button
            onClick={() => navigate('/admin/drivers')}
            className="px-3 py-1 bg-warning-600 text-white rounded-lg text-xs hover:bg-warning-700 transition-colors"
          >
            Review
          </button>
        </div>
      </div>
    )}

    {/* Vehicle Applications - Only show if pending > 0 */}
    {stats.vehicles.pending > 0 && (
      <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
        <div className="flex-1">
          <p className="font-medium text-warning-800">Vehicle Applications</p>
          <p className="text-sm text-warning-600">Requires review</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-warning-200 text-warning-800 px-2 py-1 rounded-full text-sm font-medium">
            {stats.vehicles.pending}
          </span>
          <button
            onClick={() => navigate('/admin/vehicles')}
            className="px-3 py-1 bg-warning-600 text-white rounded-lg text-xs hover:bg-warning-700 transition-colors"
          >
            Review
          </button>
        </div>
      </div>
    )}

    {/* Fleet Company Applications - Only show if pending > 0 */}
    {stats.fleet_companies.pending > 0 && (
      <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
        <div className="flex-1">
          <p className="font-medium text-warning-800">Fleet Companies</p>
          <p className="text-sm text-warning-600">Requires review</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-warning-200 text-warning-800 px-2 py-1 rounded-full text-sm font-medium">
            {stats.fleet_companies.pending}
          </span>
          <button
            onClick={() => navigate('/admin/fleet-companies')}
            className="px-3 py-1 bg-warning-600 text-white rounded-lg text-xs hover:bg-warning-700 transition-colors"
          >
            Review
          </button>
        </div>
      </div>
    )}

    {/* Show message when no pending approvals */}
    {stats.drivers.pending === 0 && 
     stats.vehicles.pending === 0 && 
     stats.fleet_companies.pending === 0 && (
      <div className="flex items-center justify-center pt-10">
        <div>
          <CheckCircle className="w-8 h-8 text-success-500 mx-auto mb-2" />
        <p className="text-sm text-secondary-600">No pending approvals</p>
        </div>
      </div>
    )}
  </div>
</div>


        {/* System Overview - Updated with fleet companies */}
        <div className="card slide-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-semibold text-dark-800 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-ice-500 mr-2" />
            System Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Approved Drivers</span>
              <span className="font-bold text-ice-600">{stats.drivers.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Approved Vehicles</span>
              <span className="font-bold text-ice-600">{stats.vehicles.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Approved Fleet Companies</span>
              <span className="font-bold text-ice-600">{stats.fleet_companies.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Completed Trips</span>
              <span className="font-bold text-ice-600">{stats.trips.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Upcoming Trips</span>
              <span className="font-bold text-ice-600">{stats.trips.upcoming}</span>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="card slide-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-dark-800 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 text-ice-500 mr-2" />
            Revenue Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Total Revenue</span>
              <span className="font-bold text-ice-600">${formatCurrency(stats.revenue.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">This Month</span>
              <span className="font-bold text-ice-600">${formatCurrency(stats.revenue.thisMonth)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Last Month</span>
              <span className="font-bold text-ice-600">${formatCurrency(stats.revenue.lastMonth)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Avg per Trip</span>
              <span className="font-bold text-ice-600">${formatCurrency(stats.revenue.average)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Month vs Last Month */}
        <div className="card fade-in">
          <h3 className="text-lg font-semibold text-dark-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 text-ice-500 mr-2" />
            Monthly Comparison
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary-600">This Month Trips</span>
                <span className="font-bold text-ice-600">{stats.trips.thisMonth}</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div
                  className="bg-ice-600 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.trips.thisMonth + stats.trips.lastMonth > 0
                        ? (stats.trips.thisMonth / (stats.trips.thisMonth + stats.trips.lastMonth)) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary-600">Last Month Trips</span>
                <span className="font-bold text-secondary-600">{stats.trips.lastMonth}</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div
                  className="bg-secondary-400 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.trips.thisMonth + stats.trips.lastMonth > 0
                        ? (stats.trips.lastMonth / (stats.trips.thisMonth + stats.trips.lastMonth)) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="pt-3 border-t border-secondary-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">Growth</span>
                <div className="flex items-center">
                  {stats.trips.growth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-ice-600 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`font-bold ${stats.trips.growth >= 0 ? 'text-ice-600' : 'text-red-600'}`}
                  >
                    {formatPercentage(stats.trips.growth)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Status Breakdown */}
        <div className="card fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-semibold text-dark-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-ice-500 mr-2" />
            Trip Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
              <div>
                <p className="font-medium text-success-800">Completed</p>
                <p className="text-xs text-success-600">{stats.trips.completionRate}% completion rate</p>
              </div>
              <span className="text-xl font-bold text-success-600">{stats.trips.completed}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-info-50 rounded-lg">
              <div>
                <p className="font-medium text-info-800">Upcoming</p>
                <p className="text-xs text-info-600">Scheduled trips</p>
              </div>
              <span className="text-xl font-bold text-info-600">{stats.trips.upcoming}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
              <div>
                <p className="font-medium text-warning-800">Running</p>
                <p className="text-xs text-warning-600">In progress</p>
              </div>
              <span className="text-xl font-bold text-warning-600">{stats.trips.running}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
              <div>
                <p className="font-medium text-danger-800">Canceled</p>
                <p className="text-xs text-danger-600">Total cancellations</p>
              </div>
              <span className="text-xl font-bold text-danger-600">{stats.trips.canceled}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
