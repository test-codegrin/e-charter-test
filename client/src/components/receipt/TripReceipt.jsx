import React from 'react';

const TripReceipt = ({ trip }) => {
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
      hour12: true,
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return `${formatDate(dateString)}, ${formatTime(dateString)}`;
  };

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return 'N/A';
    const cardStr = String(cardNumber);
    const lastFour = cardStr.slice(-4);
    return `•••• •••• •••• ${lastFour}`;
  };

  return (
    <div
      style={{
        fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
        maxWidth: '800px',
        margin: '0 auto',
        padding: '30px',
        backgroundColor: '#ffffff',
        color: '#000000',
      }}
    >
      {/* Professional Header */}
      <div
        style={{
          borderBottom: '3px solid #1e293b',
          paddingBottom: '15px',
          marginBottom: '20px',
          pageBreakInside: 'avoid',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <img
              src="/assets/images/logo.png"
              alt="E-Charter Logo"
              style={{
                height: '45px',
                width: 'auto',
                marginBottom: '6px',
                display: 'block',
              }}
            />
            <p
              style={{
                margin: '0',
                fontSize: '10px',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Professional Transportation Services
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 3px 0', fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>INVOICE</p>
          </div>
        </div>
      </div>

      {/* Invoice Details Grid with Borders */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '20px',
          pageBreakInside: 'avoid',
        }}
      >
        {/* Bill To */}
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '12px',
            backgroundColor: '#f8fafc',
          }}
        >
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '9px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Bill To
          </p>
          <div style={{ fontSize: '11px', color: '#1e293b', lineHeight: '1.5' }}>
            <p style={{ margin: '0 0 3px 0', fontWeight: '600' }}>
              {trip?.user_details?.firstname} {trip?.user_details?.lastname}
            </p>
            <p style={{ margin: '0 0 3px 0' }}>{trip?.user_details?.email}</p>
            <p style={{ margin: '0' }}>{trip?.user_details?.phone_no}</p>
          </div>
        </div>

        {/* Invoice Info */}
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '12px',
            backgroundColor: '#f8fafc',
          }}
        >
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '9px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Invoice Details
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '2px 0', color: '#64748b' }}>Invoice Date:</td>
                <td style={{ padding: '2px 0', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>
                  {formatDate(trip?.created_at || new Date())}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: '#64748b' }}>Downloaded:</td>
                <td style={{ padding: '2px 0', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>
                  {formatDateTime(new Date())}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: '#64748b' }}>Trip ID:</td>
                <td style={{ padding: '2px 0', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>
                  #{trip?.trip_id}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: '#64748b' }}>Status:</td>
                <td style={{ padding: '2px 0', textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      backgroundColor: '#22c55e',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: '600',
                      borderRadius: '3px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    PAID
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Service Date */}
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            gridColumn: 'span 2',
          }}
        >
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '9px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Service Date & Time
          </p>
          <div style={{ fontSize: '11px', color: '#1e293b', lineHeight: '1.5' }}>
            <p style={{ margin: '0', fontWeight: '600' }}>{formatDateTime(trip?.pickup_datetime)}</p>
          </div>
        </div>
      </div>

      {/* Service Details - Enhanced Layout */}
      <div
        style={{
          marginBottom: '15px',
          pageBreakInside: 'avoid',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          padding: '16px',
          backgroundColor: '#f8fafc',
        }}
      >
        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '9px',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Service Description
        </p>
        
        <div style={{ fontSize: '11px', color: '#1e293b', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
            {trip?.trip_name || 'Transportation Service'}
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '3px 0', color: '#64748b', width: '30%' }}>Trip Type:</td>
                <td style={{ padding: '3px 0', color: '#1e293b', fontWeight: '500' }}>
                  {trip?.trip_type?.replace('_', ' ').toUpperCase()}
                  {trip?.trip_event_type && ` • ${trip?.trip_event_type}`}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', color: '#64748b' }}>Pickup Location:</td>
                <td style={{ padding: '3px 0', color: '#1e293b', fontWeight: '500' }}>
                  {trip?.pickup_location_name}
                </td>
              </tr>
              {trip?.stops && trip.stops.length > 0 && (
                <tr>
                  <td style={{ padding: '3px 0', color: '#64748b', verticalAlign: 'top' }}>Stops:</td>
                  <td style={{ padding: '3px 0', color: '#1e293b', fontWeight: '500' }}>
                    {trip.stops.map((s, idx) => (
                      <span key={idx}>
                        {s.stop_location_name}
                        {idx < trip.stops.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '3px 0', color: '#64748b' }}>Dropoff Location:</td>
                <td style={{ padding: '3px 0', color: '#1e293b', fontWeight: '500' }}>
                  {trip?.dropoff_location_name}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', color: '#64748b' }}>Distance:</td>
                <td style={{ padding: '3px 0', color: '#1e293b', fontWeight: '600' }}>
                  {trip?.total_distance} km
                </td>
              </tr>
              {trip?.total_persons !== undefined && (
                <tr>
                  <td style={{ padding: '3px 0', color: '#64748b' }}>Passengers:</td>
                  <td style={{ padding: '3px 0', color: '#1e293b', fontWeight: '600' }}>
                    {trip.total_persons} {trip.total_persons === 1 ? 'person' : 'persons'}
                  </td>
                </tr>
              )}
              {trip?.total_luggages !== undefined && (
                <tr>
                  <td style={{ padding: '3px 0', color: '#64748b' }}>Luggage:</td>
                  <td style={{ padding: '3px 0', color: '#1e293b', fontWeight: '600' }}>
                    {trip.total_luggages} {trip.total_luggages === 1 ? 'piece' : 'pieces'}
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '3px 0', color: '#64748b' }}>Vehicle:</td>
                <td style={{ padding: '3px 0', color: '#1e293b', fontWeight: '500' }}>
                  {trip?.vehicle_details?.maker} {trip?.vehicle_details?.model} (
                  {trip?.vehicle_details?.registration_number})
                </td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', color: '#64748b' }}>Driver:</td>
                <td style={{ padding: '3px 0', color: '#1e293b', fontWeight: '500' }}>
                  {trip?.driver_details?.firstname} {trip?.driver_details?.lastname} •{' '}
                  {trip?.driver_details?.phone_no}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Information - Compact */}
      {trip?.payment_transaction && trip?.payment_transaction?.transaction_id && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '15px',
            border: '1px solid #e2e8f0',
            pageBreakInside: 'avoid',
          }}
        >
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '9px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Payment Information
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '2px 0', color: '#64748b', width: '140px' }}>Payment Method:</td>
                <td style={{ padding: '2px 0', color: '#1e293b', fontWeight: '600' }}>
                  {trip?.payment_transaction?.payment_gateway || 'N/A'}
                </td>
                <td style={{ padding: '2px 0 2px 15px', color: '#64748b', width: '120px' }}>Transaction ID:</td>
                <td style={{ padding: '2px 0', color: '#1e293b', fontFamily: 'monospace', fontSize: '9px' }}>
                  {trip?.payment_transaction?.gateway_transaction_id || 'N/A'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: '#64748b' }}>Card Number:</td>
                <td style={{ padding: '2px 0', color: '#1e293b', fontFamily: 'monospace' }}>
                  {maskCardNumber(trip?.payment_transaction?.card_number)}
                </td>
                <td style={{ padding: '2px 0 2px 15px', color: '#64748b' }}>Status:</td>
                <td style={{ padding: '2px 0', color: '#1e293b', fontWeight: '600' }}>
                  {trip?.payment_status === 'completed' ? 'Completed' : trip?.payment_status || 'N/A'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: '#64748b' }}>Payment Date:</td>
                <td style={{ padding: '2px 0', color: '#1e293b' }} colSpan="3">
                  {formatDateTime(trip?.payment_transaction?.processed_at)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Summary - Compact */}
      <div style={{ marginBottom: '15px', pageBreakInside: 'avoid' }}>
        <div style={{ maxWidth: '300px', marginLeft: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '5px 0', fontSize: '11px', color: '#64748b' }}>Subtotal:</td>
                <td style={{ padding: '5px 0', textAlign: 'right', fontSize: '11px', color: '#1e293b' }}>
                  CAD ${parseFloat(trip?.total_price - trip?.tax_amount || 0).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '5px 0', fontSize: '11px', color: '#64748b' }}>Tax:</td>
                <td style={{ padding: '5px 0', textAlign: 'right', fontSize: '11px', color: '#1e293b' }}>
                  CAD ${parseFloat(trip?.tax_amount || 0).toFixed(2)}
                </td>
              </tr>
              <tr style={{ borderTop: '2px solid #1e293b' }}>
                <td style={{ padding: '8px 0 0 0', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                  TOTAL PAID:
                </td>
                <td
                  style={{
                    padding: '8px 0 0 0',
                    textAlign: 'right',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#1e293b',
                  }}
                >
                  CAD ${parseFloat(trip?.total_price || 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Terms & Footer - Compact */}
      <div
        style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '12px',
          fontSize: '9px',
          color: '#64748b',
          lineHeight: '1.5',
          pageBreakInside: 'avoid',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e293b' }}>Terms & Conditions</p>
        <p style={{ margin: '0 0 6px 0' }}>
          Payment is due upon receipt. All services are non-refundable unless cancelled 24 hours in advance.
        </p>
        <p style={{ margin: '0 0 12px 0' }}>
          For questions, contact support@echarter.com or call +1 (555) 123-4567.
        </p>
        <div style={{ textAlign: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 3px 0', fontSize: '10px', color: '#1e293b', fontWeight: '600' }}>
            Thank you for your business!
          </p>
          <p style={{ margin: '0', fontSize: '8px' }}>
            This is a computer-generated invoice and does not require a signature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TripReceipt;
