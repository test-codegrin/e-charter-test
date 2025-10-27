import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Car,
  User,
  Phone,
  Mail,
  Navigation,
  Building2,
  MapPinned,
  Route,
  Timer,
  Receipt,
  CreditCard,
  Printer,
  Star,
  MessageSquare,
  Users,
  Briefcase,
  ArrowDown,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { useReactToPrint } from 'react-to-print';
import TripReceipt from '../../components/receipt/TripReceipt';
import { ADMIN_ROUTES } from '../../constants/routes';

const ViewTripDetails = () => {
  const { trip_id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef(null);

  useEffect(() => {
    fetchTripDetails();
  }, [trip_id]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTripById(trip_id);
      console.log('Trip details:', response.data);

      const tripData = response.data.trip;

      if (!tripData.stops) {
        tripData.stops = [];
      }

      setTrip(tripData);
    } catch (error) {
      console.error('Error fetching trip details:', error);
      toast.error('Failed to fetch trip details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Trip-Receipt-${trip_id}`,
  });

  const getStatusBadge = (status) => {
    const normalizedStatus = status || 'upcoming';

    switch (normalizedStatus) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4 mr-2" />
            Upcoming
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <Navigation className="w-4 h-4 mr-2" />
            Running
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            Completed
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-2" />
            Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (status) => {
    return status === 'completed' ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-4 h-4 mr-2" />
        Paid
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-4 h-4 mr-2" />
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
        <Navigation className="w-4 h-4 mr-2" />
        {typeInfo.label}
      </span>
    );
  };

  const StarRating = ({ rating, size = 'md' }) => {
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating - fullStars >= 0.5;
    const starSize = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';

    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => {
          const isFilled = index < fullStars;
          const isHalf = index === fullStars && hasHalfStar;
          return (
            <div key={index} className="relative">
              {isHalf ? (
                <div className="relative">
                  <Star className={`${starSize} text-gray-300 fill-current`} />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className={`${starSize} text-yellow-400 fill-current`} />
                  </div>
                </div>
              ) : (
                <Star className={`${starSize} ${isFilled ? 'text-yellow-400' : 'text-gray-300'} fill-current`} />
              )}
            </div>
          );
        })}
        <span className={`font-bold text-gray-900 ${size === 'lg' ? 'text-2xl ml-2' : 'text-base ml-1'}`}>
          {numericRating.toFixed(1)}
        </span>
      </div>
    );
  };

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return 'N/A';
    const cardStr = String(cardNumber);
    const lastFour = cardStr.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <Loader text="Getting Trip Details..." />;
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Trip not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden Receipt Component for Printing */}
      <div style={{ display: 'none' }}>
        <div ref={receiptRef}>
          <TripReceipt trip={trip} />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Trip Details</h1>
            <p className="text-secondary-600">View and manage trip information</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(trip.trip_status)}
          {getPaymentBadge(trip.payment_status)}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md hover:shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Single Column Full Width Layout */}
      <div className="space-y-6">
        {/* Trip Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{trip.trip_name || 'Unnamed Trip'}</h2>
              <p className="text-gray-500 text-sm">Trip ID: #{trip.trip_id}</p>
              <div className="flex items-center space-x-2 mt-2">
                {getTripTypeBadge(trip.trip_type)}
                {trip.trip_event_type && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {trip.trip_event_type}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Route Information - HORIZONTAL DESIGN */}
<div className="mb-6">
  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center">
    <Route className="w-4 h-4 mr-2" />
    Route Details
  </h4>

  {/* Horizontal Timeline Design */}
  <div className="relative">
    {/* Horizontal Line */}

    {(trip.trip_type === 'single_trip' || trip.trip_type === 'round_trip') && (
      <div className="absolute w-[50%] top-5 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-green-400 to-red-400"></div>
    )}
    {trip.trip_type === 'multi_stop' && (
      <div className="absolute w-[75%] top-5 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-green-400 via-blue-400 to-red-400"></div>
    )}

    {/* Route Stops Container */}
    <div className="relative flex items-start justify-between gap-4">
      {/* Pickup Location */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-10 mb-3">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200 w-full">
            <span className="text-xs font-bold text-green-700 uppercase tracking-wide block mb-2">
              Pickup
            </span>
            <p className="text-gray-900 font-semibold text-sm mb-2 line-clamp-2">
              {trip.pickup_location_name}
            </p>
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(trip.pickup_datetime)}</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                <span>{formatTime(trip.pickup_datetime)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Stop Locations */}
      {trip.stops && trip.stops.length > 0 && (
        <>
          {trip.stops.map((stop, index) => (
            <div key={stop.trip_stop_id} className="flex-1 min-w-0">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10 mb-3">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 w-full">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wide block mb-2">
                    Stop {index + 1}
                  </span>
                  <p className="text-gray-900 font-semibold text-sm mb-2 line-clamp-2">
                    {stop.stop_location_name}
                  </p>
                  {stop.stop_date && (
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(stop.stop_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Drop-off Location */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10 mb-3">
            <MapPinned className="w-6 h-6 text-white" />
          </div>
          <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200 w-full">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wide block mb-2">
              Drop-off
            </span>
            <p className="text-gray-900 font-semibold text-sm mb-2 line-clamp-2">
              {trip.dropoff_location_name}
            </p>
            {trip.return_pickup_datetime && (
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <Calendar className="w-3 h-3" />
                <span>Return: {formatDate(trip.return_pickup_datetime)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


          {/* Trip Metrics */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center">
              <Timer className="w-4 h-4 mr-2" />
              Trip Metrics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Total Distance</label>
                <p className="text-2xl font-bold text-gray-900">
                  {trip.total_distance} <span className="text-sm font-normal text-gray-600">km</span>
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Travel Time</label>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(trip.total_travel_time)}</p>
              </div>
              {/* Persons */}
              {trip.total_persons !== undefined && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">Passengers</label>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <p className="text-2xl font-bold text-gray-900">{trip.total_persons}</p>
                  </div>
                </div>
              )}
              {/* Luggage */}
              {trip.total_luggages !== undefined && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">Luggage</label>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-orange-500" />
                    <p className="text-2xl font-bold text-gray-900">{trip.total_luggages}</p>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Created On</label>
                <p className="text-sm text-gray-900">{formatDate(trip.created_at)}</p>
                <p className="text-xs text-gray-500">{formatTime(trip.created_at)}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-sm text-gray-900">{formatDate(trip.updated_at)}</p>
                <p className="text-xs text-gray-500">{formatTime(trip.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Rating & Review Card */}
        {(trip.trip_rating || trip.trip_review) && (
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg shadow-md p-6 border-2 border-yellow-200 transition-all hover:shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
              Trip Rating & Review
            </h3>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Rating Section */}
              {trip.trip_rating && (
                <div className="flex-shrink-0">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Customer Rating</label>
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-yellow-200">
                    <StarRating rating={trip.trip_rating} size="lg" />
                  </div>
                  {trip.rating_created_at && (
                    <p className="text-xs text-gray-500 mt-2">Rated on {formatDateTime(trip.rating_created_at)}</p>
                  )}
                </div>
              )}

              {/* Review Section */}
              {trip.trip_review && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Customer Review
                  </label>
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-yellow-200">
                    <p className="text-gray-900 leading-relaxed italic">"{trip.trip_review}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customer Information Card */}
        {trip.user_details && trip.user_details.user_id && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200 transition-all hover:shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900 font-semibold">
                  {trip.user_details.firstname} {trip.user_details.lastname}
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Customer ID</label>
                <p className="text-gray-900">#{trip.user_details.user_id}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-900">{trip.user_details.email}</p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Phone</label>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-900">{trip.user_details.phone_no}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to={`/admin/view-user/${trip.user_details.user_id}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
              >
                <span>View Customer Profile</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        )}

        {/* Driver & Vehicle Information Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border border-purple-200 transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2 text-purple-600" />
            Driver & Vehicle Information
          </h3>

          {trip.driver_details && trip.driver_details.driver_id && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Driver Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900 font-semibold">
                    {trip.driver_details.firstname} {trip.driver_details.lastname}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Driver ID</label>
                  <p className="text-gray-900">#{trip.driver_details.driver_id}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Type</label>
                  <p className="text-gray-900 capitalize">{trip.driver_details.driver_type?.replace('_', ' ')}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{trip.driver_details.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{trip.driver_details.phone_no}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Overall Rating</label>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <p className="text-gray-900 font-semibold">{trip.driver_details.average_rating || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to={ADMIN_ROUTES.DRIVERS.VIEW_DRIVER + trip.driver_details.driver_id}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center space-x-1"
                >
                  <span>View Driver Profile</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          )}

          {trip.vehicle_details && trip.vehicle_details.vehicle_id && (
            <div className="pt-6 border-t border-purple-200">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Vehicle Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Vehicle</label>
                  <p className="text-gray-900 font-semibold">
                    {trip.vehicle_details.maker} {trip.vehicle_details.model}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Registration Number</label>
                  <p className="text-gray-900 font-mono">{trip.vehicle_details.registration_number}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Type</label>
                  <p className="text-gray-900 capitalize">{trip.vehicle_details.vehicle_type}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Seats</label>
                  <p className="text-gray-900">{trip.vehicle_details.number_of_seats} passengers</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Fuel Type</label>
                  <p className="text-gray-900 capitalize">{trip.vehicle_details.fuel_type}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to={ADMIN_ROUTES.VEHICLES.VIEW_VEHICLE + trip.vehicle_details.vehicle_id}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center space-x-1"
                >
                  <span>View Vehicle Details</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          )}

          {trip.fleet_company_details && trip.fleet_company_details.fleet_company_id && (
            <div className="pt-6 border-t border-purple-200 mt-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Fleet Company</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-gray-900 font-semibold">{trip.fleet_company_details.company_name}</p>
                    <p className="text-sm text-gray-600">{trip.fleet_company_details.phone_no}</p>
                  </div>
                </div>
                <Link
                  to={ADMIN_ROUTES.FLEET_PARTNER.VIEW_FLEET_PARTNER + trip.fleet_company_details.fleet_company_id}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center space-x-1"
                >
                  <span>View Fleet Company</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Payment Summary Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border border-green-200 transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Receipt className="w-5 h-5 mr-2 text-green-600" />
            Payment Summary
          </h3>

          {/* Payment Transaction Details */}
          {trip.payment_transaction && trip.payment_transaction.transaction_id && (
            <div className="mb-6 p-4 bg-white rounded-lg border border-green-200">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Transaction Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Transaction ID</label>
                  <p className="text-gray-900 font-mono">#{trip.payment_transaction.gateway_transaction_id}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Payment Gateway</label>
                  <p className="text-gray-900">{trip.payment_transaction.payment_gateway}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Card Number</label>
                  <p className="text-gray-900 font-mono">{maskCardNumber(trip.payment_transaction.card_number)}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Gateway Response</label>
                  <p className="text-gray-900">{trip.payment_transaction.gateway_response}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Processed At</label>
                  <p className="text-gray-900 text-sm">{formatDateTime(trip.payment_transaction.processed_at)}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Transaction Date</label>
                  <p className="text-gray-900 text-sm">{formatDateTime(trip.payment_transaction.created_at)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Amount Summary */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Payment Status</label>
                {getPaymentBadge(trip.payment_status)}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Tax Amount</label>
                <p className="text-lg font-semibold text-gray-900">CAD ${parseFloat(trip.tax_amount || 0).toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Total Amount</label>
                <p className="text-2xl font-bold text-green-600">CAD ${parseFloat(trip.total_price || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTripDetails;
