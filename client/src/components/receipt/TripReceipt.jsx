import React from "react";

const TripReceipt = ({ trip }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return "N/A";
    const cardStr = String(cardNumber);
    const lastFour = cardStr.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  // ============= CUSTOMIZABLE SPACING VARIABLES =============
  
  // Container Spacing
  const containerPadding = "40px";
  const maxWidth = "800px";
  
  // Header Spacing
  const headerMarginBottom = "30px";
  const headerPaddingBottom = "20px";
  const headerBorderWidth = "3px";
  const logoWidth = "100px";
  const logoMarginBottom = "10px";
  
  // Section Spacing
  const sectionMarginBottom = "20px"; // Reduced from 30px to fit better
  const sectionPadding = "20px";
  const sectionBorderRadius = "none";
  
  // Table Spacing
  const tableRowPaddingVertical = "4px"; // Reduced from 6px
  const tableRowPaddingHorizontal = "0";
  const tableTitleWidth = "25%";
  
  // Receipt Details Table (Top Right)
  const receiptTableRowPadding = "3px 0";
  
  // Heading Spacing
  const headingMarginBottom = "12px"; // Reduced from 15px
  const headingFontSize = "16px";
  
  // Font Sizes
  const bodyFontSize = "13px"; // Reduced from 14px
  const smallFontSize = "12px";
  const headerTitleFontSize = "20px";
  const summaryTitleFontSize = "18px";
  const summaryAmountFontSize = "20px";
  
  // Footer Spacing
  const footerPaddingTop = "20px"; // Reduced from 30px
  const footerTextMargin = "0 0 6px 0"; // Reduced from 8px
  
  // Amount Summary Spacing
  const summaryRowPaddingVertical = "8px"; // Reduced from 10px
  const summaryRowPaddingHorizontal = "0";
  const summaryBorderWidth = "2px";
  
  // Colors
  const primaryColor = "#059669";
  const lightBackgroundColor = "#F9FAFB";
//   const successBackgroundColor = "#ECFDF5";
  const successBackgroundColor = "#FFFFFF";
  const textPrimaryColor = "#111827";
  const textSecondaryColor = "#6B7280";
  const borderColor = "#E5E7EB";

  // =========================================================

  return (
    <div
      style={{
        padding: containerPadding,
        fontFamily: "Arial, sans-serif",
        maxWidth: maxWidth,
        margin: "0 auto",
        backgroundColor: "white",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: headerMarginBottom,
          borderBottom: `${headerBorderWidth} solid ${primaryColor}`,
          paddingBottom: headerPaddingBottom,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <img
          src="/assets/images/logo.png"
          alt="E-Charter Logo"
          style={{ 
            width: logoWidth, 
            marginBottom: logoMarginBottom 
          }}
        />
        <p
          style={{
            fontSize: headerTitleFontSize,
            color: textPrimaryColor,
            margin: "0",
            fontWeight: "bold",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Trip Receipt & Invoice
        </p>
        <div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    padding: receiptTableRowPadding,
                    fontSize: bodyFontSize,
                    color: textSecondaryColor,
                  }}
                >
                  Receipt Number:
                </td>
                <td
                  style={{
                    padding: "0",
                    fontSize: bodyFontSize,
                    color: textPrimaryColor,
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  #
                  {trip?.payment_transaction?.gateway_transaction_id ||
                    trip?.trip_id}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: receiptTableRowPadding,
                    fontSize: bodyFontSize,
                    color: textSecondaryColor,
                  }}
                >
                  Trip ID:
                </td>
                <td
                  style={{
                    padding: "0",
                    fontSize: bodyFontSize,
                    color: textPrimaryColor,
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  #{trip?.trip_id}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: receiptTableRowPadding,
                    fontSize: bodyFontSize,
                    color: textSecondaryColor,
                  }}
                >
                  Date Issued:
                </td>
                <td
                  style={{
                    padding: "0",
                    fontSize: bodyFontSize,
                    color: textPrimaryColor,
                    textAlign: "right",
                  }}
                >
                  {formatDate(new Date())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Information */}
      <div
        style={{
          marginBottom: sectionMarginBottom,
          padding: sectionPadding,
          backgroundColor: lightBackgroundColor,
          borderRadius: sectionBorderRadius,
          pageBreakInside: "avoid", // Prevent page break inside this section
        }}
      >
        <h3
          style={{
            fontSize: headingFontSize,
            fontWeight: "bold",
            color: textPrimaryColor,
            marginBottom: headingMarginBottom,
            margin: `0 0 ${headingMarginBottom} 0`,
          }}
        >
          Customer Information
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                  width: tableTitleWidth,
                }}
              >
                Name:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {trip?.user_details?.firstname} {trip?.user_details?.lastname}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Email:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {trip?.user_details?.email}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Phone:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {trip?.user_details?.phone_no}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Trip Details */}
      <div
        style={{
          marginBottom: sectionMarginBottom,
          padding: sectionPadding,
          backgroundColor: lightBackgroundColor,
          borderRadius: sectionBorderRadius,
          pageBreakInside: "avoid", // Prevent page break inside this section
        }}
      >
        <h3
          style={{
            fontSize: headingFontSize,
            fontWeight: "bold",
            color: textPrimaryColor,
            marginBottom: headingMarginBottom,
            margin: `0 0 ${headingMarginBottom} 0`,
          }}
        >
          Trip Details
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                  width: tableTitleWidth,
                }}
              >
                Trip Name:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {trip?.trip_name || "Unnamed Trip"}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Trip Type:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                  textTransform: "capitalize",
                }}
              >
                {trip?.trip_type?.replace("_", " ")}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Event Type:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {trip?.trip_event_type || "N/A"}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Pickup Location:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {trip?.pickup_location_name}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Pickup Date/Time:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {formatDateTime(trip?.pickup_datetime)}
              </td>
            </tr>

            {/* Multi-Stop Locations */}
            {trip?.stops &&
              trip.stops.length > 0 &&
              trip.stops.map((stop, index) => (
                <tr key={stop.trip_stop_id}>
                  <td
                    style={{
                      padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                      fontSize: bodyFontSize,
                      color: textSecondaryColor,
                    }}
                  >
                    Stop {index + 1}:
                  </td>
                  <td
                    style={{
                      padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                      fontSize: bodyFontSize,
                      color: textPrimaryColor,
                    }}
                  >
                    {stop.stop_location_name} - {formatDate(stop.stop_date)}
                  </td>
                </tr>
              ))}

            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Drop-off Location:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {trip?.dropoff_location_name}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Total Distance:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {trip?.total_distance} km
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Vehicle & Driver Details */}
      <div
        style={{
          marginBottom: sectionMarginBottom,
          padding: sectionPadding,
          backgroundColor: lightBackgroundColor,
          borderRadius: sectionBorderRadius,
          pageBreakInside: "avoid", // PREVENT PAGE BREAK INSIDE THIS SECTION
          breakInside: "avoid", // Additional support for other browsers
        }}
      >
        <h3
          style={{
            fontSize: headingFontSize,
            fontWeight: "bold",
            color: textPrimaryColor,
            marginBottom: headingMarginBottom,
            margin: `0 0 ${headingMarginBottom} 0`,
          }}
        >
          Vehicle & Driver
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                  width: tableTitleWidth,
                }}
              >
                Driver Name:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {trip?.driver_details?.firstname}{" "}
                {trip?.driver_details?.lastname}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Driver Phone:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {trip?.driver_details?.phone_no}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Driver Type:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                  textTransform: "capitalize",
                }}
              >
                {trip?.driver_details?.driver_type?.replace("_", " ")}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Vehicle:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {trip?.vehicle_details?.maker} {trip?.vehicle_details?.model}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Registration Number:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {trip?.vehicle_details?.registration_number}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Vehicle Type:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                  textTransform: "uppercase",
                }}
              >
                {trip?.vehicle_details?.vehicle_type}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Seating Capacity:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                }}
              >
                {trip?.vehicle_details?.number_of_seats} passengers
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Fuel Type:
              </td>
              <td
                style={{
                  padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                  textTransform: "capitalize",
                }}
              >
                {trip?.vehicle_details?.fuel_type}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Information */}
      {trip?.payment_transaction &&
        trip?.payment_transaction?.transaction_id && (
          <div
            style={{
              marginBottom: sectionMarginBottom,
              padding: sectionPadding,
              backgroundColor: lightBackgroundColor,
              borderRadius: sectionBorderRadius,
              pageBreakInside: "avoid", // Prevent page break inside this section
            }}
          >
            <h3
              style={{
                fontSize: headingFontSize,
                fontWeight: "bold",
                color: textPrimaryColor,
                marginBottom: headingMarginBottom,
                margin: `0 0 ${headingMarginBottom} 0`,
              }}
            >
              Payment Information
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                      fontSize: bodyFontSize,
                      color: textSecondaryColor,
                      width: tableTitleWidth,
                    }}
                  >
                    Payment Gateway:
                  </td>
                  <td
                    style={{
                      padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                      fontSize: bodyFontSize,
                      color: textPrimaryColor,
                    }}
                  >
                    {trip?.payment_transaction?.payment_gateway}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                      fontSize: bodyFontSize,
                      color: textSecondaryColor,
                    }}
                  >
                    Card Number:
                  </td>
                  <td
                    style={{
                      padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                      fontSize: bodyFontSize,
                      color: textPrimaryColor,
                      fontFamily: "Courier, monospace",
                    }}
                  >
                    {maskCardNumber(trip?.payment_transaction?.card_number)}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                      fontSize: bodyFontSize,
                      color: textSecondaryColor,
                    }}
                  >
                    Transaction ID:
                  </td>
                  <td
                    style={{
                      padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                      fontSize: bodyFontSize,
                      color: textPrimaryColor,
                      fontFamily: "Courier, monospace",
                    }}
                  >
                    {trip?.payment_transaction?.gateway_transaction_id}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                      fontSize: bodyFontSize,
                      color: textSecondaryColor,
                    }}
                  >
                    Transaction Date:
                  </td>
                  <td
                    style={{
                      padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                      fontSize: bodyFontSize,
                      color: textPrimaryColor,
                    }}
                  >
                    {formatDateTime(trip?.payment_transaction?.processed_at)}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                      fontSize: bodyFontSize,
                      color: textSecondaryColor,
                    }}
                  >
                    Gateway Response:
                  </td>
                  <td
                    style={{
                      padding: `${tableRowPaddingVertical} ${tableRowPaddingHorizontal}`,
                      fontSize: bodyFontSize,
                      color: textPrimaryColor,
                    }}
                  >
                    {trip?.payment_transaction?.gateway_response}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      {/* Amount Summary */}
      <div
        style={{
          marginBottom: sectionMarginBottom,
          padding: sectionPadding,
          backgroundColor: successBackgroundColor,
          borderRadius: sectionBorderRadius,
          border: `${summaryBorderWidth} solid ${primaryColor}`,
          pageBreakInside: "avoid", // Prevent page break inside this section
        }}
      >
        <h3
          style={{
            fontSize: headingFontSize,
            fontWeight: "bold",
            color: textPrimaryColor,
            marginBottom: headingMarginBottom,
            margin: `0 0 ${headingMarginBottom} 0`,
          }}
        >
          Amount Summary
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td
                style={{
                  padding: `${summaryRowPaddingVertical} ${summaryRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textSecondaryColor,
                }}
              >
                Tax Amount:
              </td>
              <td
                style={{
                  padding: `${summaryRowPaddingVertical} ${summaryRowPaddingHorizontal}`,
                  fontSize: bodyFontSize,
                  color: textPrimaryColor,
                  textAlign: "right",
                }}
              >
                CAD ${parseFloat(trip?.tax_amount || 0).toFixed(2)}
              </td>
            </tr>
            <tr style={{ borderTop: `${summaryBorderWidth} solid ${primaryColor}` }}>
              <td
                style={{
                  padding: `${summaryRowPaddingVertical} ${summaryRowPaddingHorizontal}`,
                  fontSize: summaryTitleFontSize,
                  color: textPrimaryColor,
                  fontWeight: "bold",
                }}
              >
                Total Amount Paid:
              </td>
              <td
                style={{
                  padding: `${summaryRowPaddingVertical} ${summaryRowPaddingHorizontal}`,
                  fontSize: summaryAmountFontSize,
                  color: primaryColor,
                  fontWeight: "bold",
                  textAlign: "right",
                }}
              >
                CAD ${parseFloat(trip?.total_price || 0).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          paddingTop: footerPaddingTop,
          borderTop: `1px solid ${borderColor}`,
          color: textSecondaryColor,
          fontSize: smallFontSize,
        }}
      >
        <p style={{ margin: footerTextMargin }}>
          Thank you for choosing E-Charter!
        </p>
        <p style={{ margin: footerTextMargin }}>
          For any queries, please contact us at support@echarter.com
        </p>
        <p style={{ margin: "0" }}>
          This is a computer-generated receipt and does not require a
          signature.
        </p>
      </div>
    </div>
  );
};

export default TripReceipt;
