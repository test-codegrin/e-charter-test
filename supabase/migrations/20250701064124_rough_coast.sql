-- Create comprehensive system settings table
CREATE TABLE IF NOT EXISTS system_settings (
  setting_id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',
  description TEXT DEFAULT NULL,
  is_sensitive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_setting (category, setting_key),
  INDEX idx_category (category),
  INDEX idx_category_key (category, setting_key)
);

-- Insert default system settings
INSERT IGNORE INTO system_settings (category, setting_key, setting_value, setting_type, description, is_sensitive) VALUES
-- Commission Settings
('commission', 'individual_driver_rate', '20', 'number', 'Commission rate for individual drivers (%)', FALSE),
('commission', 'fleet_partner_rate', '15', 'number', 'Commission rate for fleet partners (%)', FALSE),
('commission', 'tax_rate', '13', 'number', 'Tax rate (HST) (%)', FALSE),
('commission', 'currency', 'CAD', 'string', 'Default currency', FALSE),
('commission', 'payment_processing_fee', '2.9', 'number', 'Payment processing fee (%)', FALSE),

-- System Settings
('system', 'company_name', 'eCharter', 'string', 'Company name', FALSE),
('system', 'company_email', 'admin@echarter.co', 'string', 'Company email address', FALSE),
('system', 'company_phone', '+1-800-CHARTER', 'string', 'Company phone number', FALSE),
('system', 'support_email', 'support@echarter.co', 'string', 'Support email address', FALSE),
('system', 'website_url', 'https://echarter.co', 'string', 'Company website URL', FALSE),
('system', 'timezone', 'America/Toronto', 'string', 'Default timezone', FALSE),
('system', 'date_format', 'YYYY-MM-DD', 'string', 'Date format', FALSE),
('system', 'time_format', '24h', 'string', 'Time format (12h/24h)', FALSE),
('system', 'app_version', '1.0.0', 'string', 'Application version', FALSE),
('system', 'maintenance_mode', 'false', 'boolean', 'Maintenance mode status', FALSE),

-- Email Settings
('email', 'smtp_enabled', 'true', 'boolean', 'Enable SMTP email', FALSE),
('email', 'smtp_host', 'smtp.gmail.com', 'string', 'SMTP server host', FALSE),
('email', 'smtp_port', '587', 'number', 'SMTP server port', FALSE),
('email', 'smtp_user', '', 'string', 'SMTP username', TRUE),
('email', 'smtp_password', '', 'string', 'SMTP password', TRUE),
('email', 'smtp_secure', 'true', 'boolean', 'Use secure connection', FALSE),
('email', 'from_name', 'eCharter', 'string', 'Email sender name', FALSE),
('email', 'from_email', 'noreply@echarter.co', 'string', 'Email sender address', FALSE),
('email', 'reply_to', 'support@echarter.co', 'string', 'Reply-to email address', FALSE),

-- SMS Settings
('sms', 'enabled', 'false', 'boolean', 'Enable SMS notifications', FALSE),
('sms', 'provider', 'twilio', 'string', 'SMS provider (twilio)', FALSE),
('sms', 'twilio_sid', '', 'string', 'Twilio Account SID', TRUE),
('sms', 'twilio_token', '', 'string', 'Twilio Auth Token', TRUE),
('sms', 'twilio_phone', '', 'string', 'Twilio phone number', FALSE),
('sms', 'test_mode', 'true', 'boolean', 'SMS test mode', FALSE),

-- Security Settings
('security', 'jwt_expiry', '24h', 'string', 'JWT token expiry time', FALSE),
('security', 'jwt_refresh_expiry', '7d', 'string', 'JWT refresh token expiry', FALSE),
('security', 'password_min_length', '8', 'number', 'Minimum password length', FALSE),
('security', 'password_require_uppercase', 'true', 'boolean', 'Require uppercase in password', FALSE),
('security', 'password_require_lowercase', 'true', 'boolean', 'Require lowercase in password', FALSE),
('security', 'password_require_numbers', 'true', 'boolean', 'Require numbers in password', FALSE),
('security', 'password_require_symbols', 'false', 'boolean', 'Require symbols in password', FALSE),
('security', 'require_email_verification', 'false', 'boolean', 'Require email verification', FALSE),
('security', 'max_login_attempts', '5', 'number', 'Maximum login attempts', FALSE),
('security', 'lockout_duration', '15', 'number', 'Account lockout duration (minutes)', FALSE),
('security', 'session_timeout', '30', 'number', 'Session timeout (minutes)', FALSE),
('security', 'two_factor_enabled', 'false', 'boolean', 'Enable two-factor authentication', FALSE),

-- Business Rules
('business', 'auto_approve_drivers', 'false', 'boolean', 'Auto-approve driver registrations', FALSE),
('business', 'auto_approve_vehicles', 'false', 'boolean', 'Auto-approve vehicle registrations', FALSE),
('business', 'auto_approve_fleet_partners', 'false', 'boolean', 'Auto-approve fleet partners', FALSE),
('business', 'require_driver_documents', 'true', 'boolean', 'Require driver documents', FALSE),
('business', 'require_vehicle_documents', 'true', 'boolean', 'Require vehicle documents', FALSE),
('business', 'min_trip_amount', '25', 'number', 'Minimum trip amount ($)', FALSE),
('business', 'max_trip_amount', '10000', 'number', 'Maximum trip amount ($)', FALSE),
('business', 'max_trip_duration', '24', 'number', 'Maximum trip duration (hours)', FALSE),
('business', 'booking_advance_hours', '2', 'number', 'Minimum booking advance notice (hours)', FALSE),
('business', 'cancellation_hours', '4', 'number', 'Cancellation notice required (hours)', FALSE),
('business', 'max_passengers', '50', 'number', 'Maximum passengers per trip', FALSE),
('business', 'allow_same_day_booking', 'true', 'boolean', 'Allow same-day bookings', FALSE),
('business', 'require_trip_confirmation', 'true', 'boolean', 'Require trip confirmation', FALSE),

-- Notification Settings
('notifications', 'email_booking_confirmation', 'true', 'boolean', 'Email booking confirmations', FALSE),
('notifications', 'email_trip_updates', 'true', 'boolean', 'Email trip status updates', FALSE),
('notifications', 'email_payment_receipts', 'true', 'boolean', 'Email payment receipts', FALSE),
('notifications', 'sms_booking_confirmation', 'true', 'boolean', 'SMS booking confirmations', FALSE),
('notifications', 'sms_trip_started', 'true', 'boolean', 'SMS when trip starts', FALSE),
('notifications', 'sms_trip_completed', 'true', 'boolean', 'SMS when trip completes', FALSE),
('notifications', 'admin_new_bookings', 'true', 'boolean', 'Notify admin of new bookings', FALSE),
('notifications', 'admin_driver_registrations', 'true', 'boolean', 'Notify admin of driver registrations', FALSE),
('notifications', 'admin_vehicle_registrations', 'true', 'boolean', 'Notify admin of vehicle registrations', FALSE),

-- Payment Settings
('payment', 'stripe_enabled', 'false', 'boolean', 'Enable Stripe payments', FALSE),
('payment', 'stripe_public_key', '', 'string', 'Stripe publishable key', FALSE),
('payment', 'stripe_secret_key', '', 'string', 'Stripe secret key', TRUE),
('payment', 'stripe_webhook_secret', '', 'string', 'Stripe webhook secret', TRUE),
('payment', 'paypal_enabled', 'false', 'boolean', 'Enable PayPal payments', FALSE),
('payment', 'paypal_client_id', '', 'string', 'PayPal client ID', TRUE),
('payment', 'paypal_client_secret', '', 'string', 'PayPal client secret', TRUE),
('payment', 'payment_methods', '["credit_card", "debit_card"]', 'json', 'Accepted payment methods', FALSE),
('payment', 'require_payment_upfront', 'false', 'boolean', 'Require payment before trip', FALSE),
('payment', 'refund_policy_days', '7', 'number', 'Refund policy (days)', FALSE),

-- API Settings
('api', 'rate_limit_enabled', 'true', 'boolean', 'Enable API rate limiting', FALSE),
('api', 'rate_limit_requests', '100', 'number', 'Requests per minute limit', FALSE),
('api', 'api_version', 'v1', 'string', 'Current API version', FALSE),
('api', 'cors_origins', '["http://localhost:5173", "https://echarter.co"]', 'json', 'Allowed CORS origins', FALSE),
('api', 'webhook_timeout', '30', 'number', 'Webhook timeout (seconds)', FALSE),

-- Feature Flags
('features', 'fleet_partners_enabled', 'true', 'boolean', 'Enable fleet partner features', FALSE),
('features', 'multi_stop_trips', 'true', 'boolean', 'Enable multi-stop trips', FALSE),
('features', 'real_time_tracking', 'true', 'boolean', 'Enable real-time tracking', FALSE),
('features', 'driver_ratings', 'true', 'boolean', 'Enable driver ratings', FALSE),
('features', 'trip_scheduling', 'true', 'boolean', 'Enable trip scheduling', FALSE),
('features', 'loyalty_program', 'false', 'boolean', 'Enable loyalty program', FALSE),
('features', 'referral_program', 'false', 'boolean', 'Enable referral program', FALSE),
('features', 'corporate_accounts', 'false', 'boolean', 'Enable corporate accounts', FALSE),

-- Pricing Settings
('pricing', 'dynamic_pricing', 'false', 'boolean', 'Enable dynamic pricing', FALSE),
('pricing', 'surge_pricing', 'false', 'boolean', 'Enable surge pricing', FALSE),
('pricing', 'distance_calculation', 'haversine', 'string', 'Distance calculation method', FALSE),
('pricing', 'round_to_nearest', '0.25', 'number', 'Round prices to nearest amount', FALSE),
('pricing', 'minimum_fare', '15', 'number', 'Minimum fare amount', FALSE),
('pricing', 'cancellation_fee', '10', 'number', 'Cancellation fee amount', FALSE),
('pricing', 'waiting_time_rate', '0.5', 'number', 'Waiting time rate per minute', FALSE),

-- Maintenance Settings
('maintenance', 'backup_enabled', 'true', 'boolean', 'Enable automatic backups', FALSE),
('maintenance', 'backup_frequency', 'daily', 'string', 'Backup frequency', FALSE),
('maintenance', 'backup_retention_days', '30', 'number', 'Backup retention period', FALSE),
('maintenance', 'log_level', 'info', 'string', 'Application log level', FALSE),
('maintenance', 'log_retention_days', '7', 'number', 'Log retention period', FALSE),
('maintenance', 'health_check_enabled', 'true', 'boolean', 'Enable health checks', FALSE),
('maintenance', 'health_check_interval', '5', 'number', 'Health check interval (minutes)', FALSE);

-- Create settings audit log table
CREATE TABLE IF NOT EXISTS settings_audit_log (
  audit_id INT AUTO_INCREMENT PRIMARY KEY,
  setting_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT NOT NULL,
  changed_by INT DEFAULT NULL,
  change_reason VARCHAR(255) DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (setting_id) REFERENCES system_settings(setting_id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES admin(admin_id) ON DELETE SET NULL,
  INDEX idx_setting_id (setting_id),
  INDEX idx_category (category),
  INDEX idx_changed_by (changed_by),
  INDEX idx_created_at (created_at)
);

-- Create settings cache table for performance
CREATE TABLE IF NOT EXISTS settings_cache (
  cache_id INT AUTO_INCREMENT PRIMARY KEY,
  cache_key VARCHAR(100) NOT NULL UNIQUE,
  cache_value TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cache_key (cache_key),
  INDEX idx_expires_at (expires_at)
);