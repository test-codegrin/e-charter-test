import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  User,
  Phone,
  Mail,
  Navigation,
  DollarSign,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [tripTypeFilter, setTripTypeFilter] = useState('all');

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [trips, searchTerm, statusFilter, paymentFilter, tripTypeFilter]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllTrips();
      console.log('Trips response:', response.data);
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const filterTrips = () => {
    let filtered = trips;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((trip) => {
        const userName = `${trip.user_firstname} ${trip.user_lastname}`.toLowerCase();
        const driverName = `${trip.driver_firstname} ${trip.driver_lastname}`.toLowerCase();
        const pickupLocation = trip.pickup_location_name?.toLowerCase() || '';
        const dropoffLocation = trip.dropoff_location_name?.toLowerCase() || '';
        const tripName = trip.trip_name?.toLowerCase() || '';

        return (
          userName.includes(searchTerm.toLowerCase()) ||
          driverName.includes(searchTerm.toLowerCase()) ||
          pickupLocation.includes(searchTerm.toLowerCase()) ||
          dropoffLocation.includes(searchTerm.toLowerCase()) ||
          tripName.includes(searchTerm.toLowerCase()) ||
          trip.trip_id?.toString().includes(searchTerm)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((trip) => trip.trip_status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter((trip) => trip.payment_status === paymentFilter);
    }

    // Trip type filter
    if (tripTypeFilter !== 'all') {
      filtered = filtered.filter((trip) => trip.trip_type === tripTypeFilter);
    }

    setFilteredTrips(filtered);
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status || 'upcoming';

    switch (normalizedStatus) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Upcoming
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Navigation className="w-3 h-3 mr-1" />
            Running
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (status) => {
    return status === 'completed' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Paid
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
  };

  const getTripTypeBadge = (type) => {
    const typeMap = {
      single_trip: { label: 'Single Trip', color: 'bg-blue-100 text-blue-800' },
      round_trip: { label: 'Round Trip', color: 'bg-purple-100 text-purple-800' },
      multi_stop: { label: 'Multi-Stop', color: 'bg-orange-100 text-orange-800' },
    };

    const typeInfo = typeMap[type] || { label: type, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Trip Management</h1>
        <p className="text-secondary-600">Monitor and manage all trip bookings</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Trips</p>
          <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
          <p className="text-xs text-blue-700 uppercase tracking-wide mb-1">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">
            {trips.filter((t) => t.trip_status === 'upcoming').length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4 border border-purple-200">
          <p className="text-xs text-purple-700 uppercase tracking-wide mb-1">Running</p>
          <p className="text-2xl font-bold text-purple-600">
            {trips.filter((t) => t.trip_status === 'running').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <p className="text-xs text-green-700 uppercase tracking-wide mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {trips.filter((t) => t.trip_status === 'completed').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
          <p className="text-xs text-red-700 uppercase tracking-wide mb-1">Canceled</p>
          <p className="text-2xl font-bold text-red-600">
            {trips.filter((t) => t.trip_status === 'canceled').length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
          <p className="text-xs text-yellow-700 uppercase tracking-wide mb-1 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Payment Pending
          </p>
          <p className="text-2xl font-bold text-yellow-600">
            {trips.filter((t) => t.payment_status === 'pending').length}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-lg shadow p-4 border border-emerald-200">
          <p className="text-xs text-emerald-700 uppercase tracking-wide mb-1 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Payment Completed
          </p>
          <p className="text-2xl font-bold text-emerald-600">
            {trips.filter((t) => t.payment_status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by trip name, user, driver, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || tripTypeFilter !== 'all') && (
              <div className="mt-5">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPaymentFilter('all');
                    setTripTypeFilter('all');
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Trip Status Filter */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">Trip Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Payment Status Filter */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment</label>
              <div className="relative">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
                >
                  <option value="all">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Trip Type Filter */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">Trip Type</label>
              <div className="relative">
                <select
                  value={tripTypeFilter}
                  onChange={(e) => setTripTypeFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="single_trip">Single Trip</option>
                  <option value="round_trip">Round Trip</option>
                  <option value="multi_stop">Multi-Stop</option>
                </select>
                <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle & Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrips.map((trip) => (
                <tr key={trip.trip_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">#{trip.trip_id}</p>
                      <p className="text-sm text-gray-600">{trip.trip_name || 'Unnamed Trip'}</p>
                      <div className="mt-1">{getTripTypeBadge(trip.trip_type)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {trip.user_firstname} {trip.user_lastname}
                        </p>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Mail className="w-3 h-3" />
                          <span>{trip.user_email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-900">{trip.pickup_location_name}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-900">{trip.dropoff_location_name}</span>
                      </div>
                      {trip.stops && trip.stops.length > 0 && (
                        <span className="text-xs text-blue-600 font-medium">
                          +{trip.stops.length} stop{trip.stops.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{formatDate(trip.pickup_datetime)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{formatTime(trip.pickup_datetime)}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {trip.total_distance} km • {formatDuration(trip.total_travel_time)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {trip.vehicle_maker} {trip.vehicle_model}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">
                          {trip.driver_firstname} {trip.driver_lastname}
                        </span>
                      </div>
                      {trip.fleet_company_name && (
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-orange-500" />
                          <span className="text-xs text-gray-500">{trip.fleet_company_name}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {getStatusBadge(trip.trip_status)}
                      {getPaymentBadge(trip.payment_status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-lg font-bold text-gray-900">₹{parseFloat(trip.total_price || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Tax: ₹{parseFloat(trip.tax_amount || 0).toFixed(2)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/admin/view-trip/${trip.trip_id}`}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                      title="View Details"
                    >
                      <span>View</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTrips.length === 0 && (
            <div className="text-center py-12">
              <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No trips found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trips;
