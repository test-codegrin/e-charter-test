import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  FileText,
  User,
  AlertTriangle,
  Users,
  Fuel,
  Mail,
  Phone,
  MapPin,
  Globe,
  Wind,
  Zap,
  Wifi,
  Monitor,
  Navigation,
  Armchair,
  Accessibility,
  Info,
  Upload,
  FileImage,
  File,
  Edit3,
  Save,
  X as XIcon,
  Shield,
  ChevronRight,
  Camera,
} from "lucide-react";
import { driverAPI } from "../../services/api";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

const DriverViewVehicle = () => {
  const { vehicle_id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingFeatures, setEditingFeatures] = useState(false);
  const [tempFeatures, setTempFeatures] = useState(null);
  const [showFeatureVerifyModal, setShowFeatureVerifyModal] = useState(false);
  const [savingFeatures, setSavingFeatures] = useState(false);
  
  // Vehicle image states
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageConfirmModal, setShowImageConfirmModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);
  
  // Document upload states
  const [showDocModal, setShowDocModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [docFormData, setDocFormData] = useState({
    document_file: null,
    document_number: '',
    document_expiry_date: ''
  });
  const [uploading, setUploading] = useState(false);

  const allFeatures = [
    { key: "has_air_conditioner", label: "Air Conditioner", icon: Wind },
    { key: "has_charging_port", label: "Charging Port", icon: Zap },
    { key: "has_wifi", label: "WiFi", icon: Wifi },
    { key: "has_entertainment_system", label: "Entertainment", icon: Monitor },
    { key: "has_gps", label: "GPS", icon: Navigation },
    { key: "has_recliner_seats", label: "Recliner Seats", icon: Armchair },
    { key: "is_wheelchair_accessible", label: "Wheelchair", icon: Accessibility },
  ];

  const requiredDocuments = [
    { type: 'registration', label: 'Registration Certificate', icon: FileText, color: 'blue' },
    { type: 'insurance', label: 'Insurance Policy', icon: FileText, color: 'green' },
    { type: 'fitness', label: 'Fitness Certificate', icon: FileText, color: 'purple' },
    { type: 'permit', label: 'Commercial Permit', icon: FileText, color: 'orange' },
    { type: 'pollution', label: 'Pollution Certificate', icon: FileText, color: 'teal' }
  ];

  useEffect(() => {
    fetchVehicleDetails();
  }, [vehicle_id]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const response = await driverAPI.getVehicleById(vehicle_id);
      setVehicle(response.data.vehicle);
      
      if (!response.data.vehicle.features) {
        const defaultFeatures = { vehicle_features_id: null };
        allFeatures.forEach(feature => {
          defaultFeatures[feature.key] = 0;
        });
        setVehicle({ ...response.data.vehicle, features: defaultFeatures });
      }
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      toast.error("Failed to fetch vehicle details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Functions
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG and PNG images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setShowImageEditModal(false);
    setShowImageConfirmModal(true);
  };

  const handleImageUpload = async () => {
    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('vehicle_id', vehicle_id);
      formData.append('document', selectedImage);

      await driverAPI.updateVehicleImage(formData);
      
      toast.success('Vehicle image updated successfully! Your vehicle is now under review.');
      
      setShowImageConfirmModal(false);
      setSelectedImage(null);
      setImagePreview(null);
      await fetchVehicleDetails();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditFeatures = () => {
    setEditingFeatures(true);
    setTempFeatures({ ...vehicle.features });
  };

  const handleFeatureToggle = (featureKey) => {
    setTempFeatures(prev => ({
      ...prev,
      [featureKey]: prev[featureKey] === 1 ? 0 : 1
    }));
  };

  const handleCancelFeatureEdit = () => {
    setEditingFeatures(false);
    setTempFeatures(null);
  };

  const handleSaveFeaturesClick = () => {
    setShowFeatureVerifyModal(true);
  };

  const handleConfirmFeatureSave = async () => {
    try {
      setSavingFeatures(true);
      
      await driverAPI.updateVehicleFeatures(vehicle_id, tempFeatures);
      
      toast.success('Features updated successfully. Your vehicle is now under review.');
      
      await fetchVehicleDetails();
      
      setEditingFeatures(false);
      setTempFeatures(null);
      setShowFeatureVerifyModal(false);
    } catch (error) {
      console.error('Error updating features:', error);
      toast.error('Failed to update features');
    } finally {
      setSavingFeatures(false);
    }
  };

  const openDocumentModal = (docType) => {
    setSelectedDocType(docType);
    setModalStep(1);
    setDocFormData({
      document_file: null,
      document_number: '',
      document_expiry_date: ''
    });
    setShowDocModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setDocFormData({ ...docFormData, document_file: file });
  };

  const handleNextStep = () => {
    if (!docFormData.document_file) {
      toast.error('Please select a file');
      return;
    }
    if (!docFormData.document_number) {
      toast.error('Please enter document number');
      return;
    }
    if (!docFormData.document_expiry_date) {
      toast.error('Please select expiry date');
      return;
    }
    setModalStep(2);
  };

  const handleDocumentUpload = async () => {
    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('document', docFormData.document_file);
      uploadFormData.append('vehicle_id', vehicle_id);
      uploadFormData.append('document_type', selectedDocType.type);
      uploadFormData.append('document_number', docFormData.document_number);
      uploadFormData.append('document_expiry_date', docFormData.document_expiry_date);

      await driverAPI.uploadVehicleDocument(uploadFormData);
      toast.success('Document uploaded successfully! Your vehicle is now under review.');
      
      setShowDocModal(false);
      setModalStep(1);
      await fetchVehicleDetails();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file) => {
    if (!file) return Upload;
    const fileType = file.type;
    if (fileType.includes('pdf')) return File;
    if (fileType.includes('image')) return FileImage;
    return FileText;
  };

  const getFileTypeLabel = (file) => {
    if (!file) return '';
    const fileType = file.type;
    if (fileType.includes('pdf')) return 'PDF Document';
    if (fileType.includes('jpeg') || fileType.includes('jpg')) return 'JPEG Image';
    if (fileType.includes('png')) return 'PNG Image';
    return 'File';
  };

  const getDocumentByType = (type) => {
    return vehicle?.documents?.find(doc => doc.document_type === type);
  };

  const allDocumentsUploaded = () => {
    return requiredDocuments.every(reqDoc => getDocumentByType(reqDoc.type));
  };

  const isDocumentExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isDocumentExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status || "in_review";

    switch (normalizedStatus) {
      case "approved":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border-2 border-green-300">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border-2 border-red-300">
            <XCircle className="w-4 h-4 mr-2" />
            Rejected
          </span>
        );
      case "in_review":
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border-2 border-yellow-300">
            <Clock className="w-4 h-4 mr-2" />
            In Review
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vehicle not found</p>
      </div>
    );
  }

  const currentFeatures = editingFeatures ? tempFeatures : vehicle.features;
  const FileIcon = getFileIcon(docFormData.document_file);
  const selectedDocInfo = requiredDocuments.find(d => d.type === selectedDocType?.type);

  return (
    <div className="space-y-6">
      {/* Image Edit Modal */}
      {showImageEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden">
            <div className="bg-primary-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Update Vehicle Image</h3>
                    <p className="text-sm text-blue-100">Choose a new image</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowImageEditModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              <button
                onClick={() => imageInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer"
              >
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-10 h-10 text-primary-600" />
                </div>
                <p className="text-sm font-semibold text-secondary-700 mb-1">Click to select image</p>
                <p className="text-xs text-secondary-500">JPG or PNG (max. 5MB)</p>
              </button>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Image Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Clear view of the entire vehicle</li>
                      <li>Good lighting conditions</li>
                      <li>No filters or heavy editing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-200">
              <button
                onClick={() => setShowImageEditModal(false)}
                className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Confirmation Modal */}
      {showImageConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in overflow-hidden">
            <div className="bg-yellow-500 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Confirm Image Update</h3>
                  <p className="text-sm text-orange-100">Review will be required</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {imagePreview && (
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">New Vehicle Image:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-contain rounded-lg border-2 border-gray-300"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                    <span>{selectedImage?.name}</span>
                    <span>{(selectedImage?.size / 1024).toFixed(0)} KB</span>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900 mb-1">
                    Important Notice
                  </p>
                  <p className="text-sm text-yellow-700">
                    Updating your vehicle image will set the vehicle status to "In Review". 
                    Your vehicle will require admin approval before it can be used for bookings again.
                  </p>
                </div>
              </div>

             
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end space-x-3 border-t-2 border-gray-200">
              <button
                onClick={() => {
                  setShowImageConfirmModal(false);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                disabled={uploadingImage}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImageUpload}
                disabled={uploadingImage}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold shadow-md disabled:opacity-50 flex items-center space-x-2"
              >
                {uploadingImage ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Confirm & Update</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in overflow-hidden">
            <div className={`bg-gradient-to-r from-${selectedDocInfo?.color}-500 to-${selectedDocInfo?.color}-600 p-6 pb-0 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Upload {selectedDocInfo?.label}</h3>
                    <p className="text-sm text-white text-opacity-90">Step {modalStep} of 2</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDocModal(false);
                    setModalStep(1);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mt-4 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${(modalStep / 2) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-6">
              {modalStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-3">
                      Document File *
                    </label>
                    <label className={`flex flex-col items-center justify-center w-full h-40 px-4 transition-all border-2 border-dashed rounded-xl appearance-none cursor-pointer ${
                      docFormData.document_file 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-secondary-300 bg-secondary-50 hover:border-primary-400 hover:bg-primary-50'
                    }`}>
                      <div className="flex flex-col items-center space-y-3">
                        {docFormData.document_file ? (
                          <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                              <FileIcon className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-green-700">{docFormData.document_file.name}</p>
                              <p className="text-xs text-green-600 mt-1">{getFileTypeLabel(docFormData.document_file)} • {(docFormData.document_file.size / 1024).toFixed(0)} KB</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setDocFormData({ ...docFormData, document_file: null });
                              }}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Remove file
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                              <Upload className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-secondary-700">Click to upload or drag and drop</p>
                              <p className="text-xs text-secondary-500 mt-1">JPG, PNG or PDF (max. 5MB)</p>
                            </div>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-2">
                      Document Number *
                    </label>
                    <input
                      type="text"
                      value={docFormData.document_number}
                      onChange={(e) => setDocFormData({ ...docFormData, document_number: e.target.value.toUpperCase() })}
                      className="input-field font-mono text-lg"
                      placeholder="Enter document number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-2">
                      Expiry Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="date"
                        value={docFormData.document_expiry_date}
                        onChange={(e) => setDocFormData({ ...docFormData, document_expiry_date: e.target.value })}
                        className="input-field pl-10"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Document Guidelines:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                          <li>Ensure document is clear and readable</li>
                          <li>All text and numbers should be visible</li>
                          <li>Document must be valid and not expired</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => {
                        setShowDocModal(false);
                        setModalStep(1);
                      }}
                      className="flex-1 px-4 py-3 bg-secondary-100 text-secondary-700 rounded-xl hover:bg-secondary-200 transition-all font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold flex items-center justify-center space-x-2"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {modalStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-10 h-10 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-secondary-900 mb-2">Verify Your Information</h4>
                    <p className="text-sm text-secondary-600">Please review your document details before submitting</p>
                  </div>

                  <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-secondary-200">
                      <span className="text-sm font-medium text-secondary-600">Document Type</span>
                      <span className="text-sm font-bold text-secondary-900">{selectedDocInfo?.label}</span>
                    </div>

                    <div className="flex items-start justify-between pb-3 border-b border-secondary-200">
                      <span className="text-sm font-medium text-secondary-600">File</span>
                      <div className="flex items-center space-x-2">
                        <FileIcon className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm font-medium text-secondary-900 max-w-[200px] truncate">{docFormData.document_file?.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-secondary-200">
                      <span className="text-sm font-medium text-secondary-600">Document Number</span>
                      <span className="text-sm font-bold text-secondary-900 font-mono">{docFormData.document_number}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-secondary-600">Expiry Date</span>
                      <span className="text-sm font-bold text-secondary-900">{new Date(docFormData.document_expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Important Notice:</p>
                        <p className="text-yellow-700">
                          Your vehicle will be under review after document submission. You'll be notified once verification is complete.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setModalStep(1)}
                      disabled={uploading}
                      className="flex-1 px-4 py-3 bg-secondary-100 text-secondary-700 rounded-xl hover:bg-secondary-200 transition-all font-semibold disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleDocumentUpload}
                      disabled={uploading}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Confirm & Upload</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feature Verification Modal */}
      {showFeatureVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Confirm Feature Changes</h3>
                  <p className="text-orange-100 text-sm">Review will be required</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900 mb-1">
                    Important Notice
                  </p>
                  <p className="text-sm text-yellow-700">
                    Changing vehicle features will set your vehicle status to "In Review". 
                    Your vehicle will need admin approval before being available for bookings again.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Are you sure you want to update the features?
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end space-x-3 border-t-2 border-gray-200">
              <button
                onClick={() => setShowFeatureVerifyModal(false)}
                disabled={savingFeatures}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFeatureSave}
                disabled={savingFeatures}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold shadow-md disabled:opacity-50"
              >
                {savingFeatures ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the component continues... */}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Vehicle Details</h1>
            <p className="text-secondary-600">View and manage your vehicle information</p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Vehicle Status
            </h3>
            {getStatusBadge(vehicle.status)}
          </div>
          {vehicle.status_description && (vehicle.status === "rejected" || vehicle.status === "in_review") && (
            <div
              className={`flex-1 max-w-2xl ml-6 flex items-start space-x-3 p-4 rounded-xl border-2 ${
                vehicle.status === "rejected"
                  ? "bg-red-50 border-red-300"
                  : "bg-yellow-50 border-yellow-300"
              }`}
            >
              <Info
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  vehicle.status === "rejected" ? "text-red-600" : "text-yellow-600"
                }`}
              />
              <div>
                <p
                  className={`text-sm font-semibold mb-1 ${
                    vehicle.status === "rejected" ? "text-red-900" : "text-yellow-900"
                  }`}
                >
                  Status Reason:
                </p>
                <p
                  className={`text-sm ${
                    vehicle.status === "rejected" ? "text-red-700" : "text-yellow-700"
                  }`}
                >
                  {vehicle.status_description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

  {/* Vehicle Image with Edit Button */}
      {vehicle.car_image && (
        <div className="relative bg-gray-50 rounded-xl shadow-md p-8 border-2 border-gray-200 transition-all hover:shadow-lg group">
          <img
            src={vehicle.car_image}
            alt={`${vehicle.maker} ${vehicle.model}`}
            className="w-full h-96 object-contain rounded-xl"
          />
          <button
            onClick={() => setShowImageEditModal(true)}
            className="absolute top-4 right-4 flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium shadow-lg"
          >
            <Camera className="w-5 h-5" />
            <span>Edit Photo</span>
          </button>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200 transition-all hover:shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
              <Car className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {vehicle.maker} {vehicle.model}
              </h2>
              {vehicle.name && <p className="text-gray-500 text-sm">{vehicle.name}</p>}
              <p className="text-gray-500 text-sm">Vehicle ID: #{vehicle.vehicle_id}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 ${
                    vehicle.ownership === "fleet_company"
                      ? "bg-blue-50 text-blue-800 border-blue-300"
                      : "bg-purple-50 text-purple-800 border-purple-300"
                  }`}
                >
                  {vehicle.ownership === "fleet_company" ? (
                    <>
                      <Building2 className="w-3 h-3 mr-1" />
                      Fleet Company
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 mr-1" />
                      Individual
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Specifications */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Vehicle Specifications
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-500">Registration Number</label>
              <span className="font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded-lg border-2 border-gray-300 inline-block">
                {vehicle.registration_number}
              </span>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-500">Vehicle Type</label>
              <span className="text-gray-900 capitalize block">{vehicle.vehicle_type}</span>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-500">Number of Seats</label>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{vehicle.number_of_seats}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-500">Fuel Type</label>
              <div className="flex items-center space-x-2">
                <Fuel className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 capitalize">{vehicle.fuel_type}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-500">Availability</label>
              <span className="text-gray-900">
                {vehicle.is_available ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border-2 border-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Available
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border-2 border-red-300">
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Available
                  </span>
                )}
              </span>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-500">Registered On</label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{formatDate(vehicle.created_at)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-500">Last Updated</label>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{formatDate(vehicle.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Features */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200 transition-all hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Vehicle Features
          </h3>
          {!editingFeatures ? (
            <button
              onClick={handleEditFeatures}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium shadow-md"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Features</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancelFeatureEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
              >
                <XIcon className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveFeaturesClick}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {allFeatures.map((feature) => {
            const Icon = feature.icon;
            const isActive = currentFeatures && currentFeatures[feature.key] === 1;

            return (
              <div
                key={feature.key}
                onClick={() => editingFeatures && handleFeatureToggle(feature.key)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  editingFeatures ? 'cursor-pointer hover:scale-105' : ''
                } ${
                  isActive
                    ? "bg-green-50 border-green-300"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <Icon
                  className={`w-8 h-8 mb-2 ${
                    isActive ? "text-green-600" : "text-gray-400"
                  }`}
                />
                <p
                  className={`text-sm font-medium text-center ${
                    isActive ? "text-green-900" : "text-gray-500"
                  }`}
                >
                  {feature.label}
                </p>
                {isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400 mt-1" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t-2 border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">
              {currentFeatures ? Object.values(currentFeatures).filter((v) => v === 1).length : 0}
            </span>{" "}
            of 7 features available
          </p>
        </div>
      </div>

      {/* Fleet Company */}
      {vehicle.ownership === "fleet_company" && vehicle.fleet_company_details && (
        <div className="bg-blue-50 rounded-xl shadow-md p-6 border-2 border-blue-200 transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Fleet Company Information
          </h3>

          <div className="flex items-start space-x-6">
            {vehicle.fleet_company_details.profile_image && (
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-white rounded-xl shadow-md p-3 flex items-center justify-center border-2 border-gray-200">
                  <img
                    src={vehicle.fleet_company_details.profile_image}
                    alt={vehicle.fleet_company_details.company_name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Company Name</label>
                <p className="text-gray-900 font-semibold">
                  {vehicle.fleet_company_details.company_name}
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-900">{vehicle.fleet_company_details.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Phone</label>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-900">{vehicle.fleet_company_details.phone_no}</p>
                </div>
              </div>

              {vehicle.fleet_company_details.website && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Website</label>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a
                      href={`https://${vehicle.fleet_company_details.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {vehicle.fleet_company_details.website}
                    </a>
                  </div>
                </div>
              )}

              <div className="space-y-1 col-span-2">
                <label className="block text-sm font-medium text-gray-600">Address</label>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{vehicle.fleet_company_details.address}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {vehicle.fleet_company_details.city_name} -{" "}
                      {vehicle.fleet_company_details.postal_code}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Documents */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-secondary-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-secondary-900">Required Documents</h3>
            <p className="text-sm text-secondary-600 mt-1">Upload and manage your vehicle verification documents</p>
          </div>
          {allDocumentsUploaded() && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-800">All documents uploaded</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
          {requiredDocuments.map((reqDoc) => {
            const uploadedDoc = getDocumentByType(reqDoc.type);
            const isExpired = uploadedDoc && isDocumentExpired(uploadedDoc.document_expiry_date);
            const isExpiringSoon = uploadedDoc && isDocumentExpiringSoon(uploadedDoc.document_expiry_date);
            const Icon = reqDoc.icon;

            return (
              <div 
                key={reqDoc.type}
                className={`p-6 border-2 rounded-xl transition-all shadow-sm hover:shadow-lg ${
                  uploadedDoc && !isExpired
                    ? 'border-green-300 bg-green-50'
                    : isExpired
                    ? 'border-red-300 bg-red-50'
                    : 'border-secondary-200 bg-secondary-50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${
                      uploadedDoc && !isExpired 
                        ? 'bg-green-200' 
                        : isExpired 
                        ? 'bg-red-200' 
                        : 'bg-secondary-200'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        uploadedDoc && !isExpired ? 'text-green-700' : isExpired ? 'text-red-700' : 'text-secondary-500'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-secondary-900 text-sm">{reqDoc.label}</h4>
                      <p className="text-xs text-secondary-600 font-medium">Required</p>
                    </div>
                  </div>
                  {uploadedDoc && !isExpired && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  {isExpired && (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                </div>

                {uploadedDoc ? (
                  <div className="space-y-3">
                    <div className="bg-white bg-opacity-60 rounded-lg p-3 space-y-2 shadow-sm">
                      <div>
                        <p className="text-xs text-secondary-600 font-medium">Document Number</p>
                        <p className="font-bold text-secondary-900 text-sm">{uploadedDoc.document_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-600 font-medium">Expiry Date</p>
                        <p className={`font-bold flex items-center text-sm ${
                          isExpired ? 'text-red-700' : isExpiringSoon ? 'text-yellow-700' : 'text-secondary-900'
                        }`}>
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(uploadedDoc.document_expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {uploadedDoc.document_url && (
                        <a
                          href={uploadedDoc.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                        >
                          View
                        </a>
                      )}
                      <button
                        onClick={() => openDocumentModal(reqDoc)}
                        className="flex-1 px-3 py-2 bg-secondary-600 text-white text-sm rounded-lg hover:bg-secondary-700 transition-colors font-semibold shadow-sm"
                      >
                        Re-upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openDocumentModal(reqDoc)}
                    className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Document Upload Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Accepted formats: JPG, PNG, PDF (Max 5MB)</li>
                <li>Documents must be clear and readable</li>
                <li>Ensure expiry dates are visible and valid</li>
                <li>Vehicle will be reviewed after document upload</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverViewVehicle;
