import React, { useState, useEffect } from 'react'
import { Search, Filter, Eye, Download, DollarSign, Calendar, X } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const Invoices = () => {
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, searchTerm, statusFilter])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllInvoices()
      console.log('Invoices API response:', response.data)
      
      // Ensure all invoices have proper numeric values
      const invoicesData = (response.data.invoices || []).map(invoice => ({
        ...invoice,
        total_amount: parseFloat(invoice.total_amount) || 0,
        subtotal: parseFloat(invoice.subtotal) || 0,
        tax_amount: parseFloat(invoice.tax_amount) || 0
      }))
      
      setInvoices(invoicesData)
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('Failed to fetch invoices')
      setInvoices([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = invoices

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    setFilteredInvoices(filtered)
  }

  const updateInvoiceStatus = async (invoiceId, status) => {
    try {
      await adminAPI.updateInvoiceStatus(invoiceId, status)
      toast.success(`Invoice status updated to ${status}`)
      fetchInvoices()
    } catch (error) {
      console.error('Error updating invoice status:', error)
      toast.error('Failed to update invoice status')
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'status-pending',
      'paid': 'status-approved',
      'cancelled': 'status-cancelled',
      'refunded': 'status-rejected'
    }
    
    return (
      <span className={`status-badge ${statusMap[status] || 'status-pending'}`}>
        {status || 'Unknown'}
      </span>
    )
  }

  const openInvoiceModal = (invoice) => {
    setSelectedInvoice(invoice)
    setShowModal(true)
  }

  // Safe formatting functions
  const formatCurrency = (value) => {
    const numValue = parseFloat(value) || 0
    return numValue.toFixed(2)
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Invalid Date'
    }
  }

  // Calculate totals safely
  const totalRevenue = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0)

  const pendingAmount = filteredInvoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Invoice Management</h1>
          <p className="text-secondary-600">Track payments and billing information</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-secondary-600">Total: {invoices.length}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            ${formatCurrency(totalRevenue)}
          </div>
          <div className="text-sm text-secondary-600">Total Revenue</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-warning-600">
            ${formatCurrency(pendingAmount)}
          </div>
          <div className="text-sm text-secondary-600">Pending Amount</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {invoices.filter(inv => inv.status === 'paid').length}
          </div>
          <div className="text-sm text-secondary-600">Paid Invoices</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {invoices.filter(inv => inv.status === 'pending').length}
          </div>
          <div className="text-sm text-secondary-600">Pending Invoices</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-secondary-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="table-header">Invoice #</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Trip Details</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.invoice_id} className="hover:bg-secondary-50">
                  <td className="table-cell font-medium">
                    {invoice.invoice_number}
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium text-secondary-900">
                        {invoice.firstName} {invoice.lastName}
                      </p>
                      <p className="text-sm text-secondary-500">{invoice.email}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Trip #{invoice.trip_id}</p>
                      <p className="text-xs text-secondary-500 truncate max-w-32">
                        {invoice.pickupLocation} → {invoice.dropLocation}
                      </p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-secondary-400" />
                        <span className="font-bold text-lg">
                          {formatCurrency(invoice.total_amount)}
                        </span>
                      </div>
                      <p className="text-xs text-secondary-500">
                        Tax: ${formatCurrency(invoice.tax_amount)}
                      </p>
                    </div>
                  </td>
                  <td className="table-cell">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-secondary-400" />
                      <span className="text-sm">
                        {formatDate(invoice.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openInvoiceModal(invoice)}
                        className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary-500">
                {invoices.length === 0 ? 'No invoices found.' : 'No invoices found matching your criteria.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900">
                  Invoice Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="border-b border-secondary-200 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-secondary-900">
                        {selectedInvoice.invoice_number}
                      </h4>
                      <p className="text-secondary-600">Trip #{selectedInvoice.trip_id}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(selectedInvoice.status)}
                      <p className="text-sm text-secondary-500 mt-1">
                        {formatDate(selectedInvoice.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">Bill To</h4>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {selectedInvoice.firstName} {selectedInvoice.lastName}
                    </p>
                    <p className="text-secondary-600">{selectedInvoice.email}</p>
                  </div>
                </div>

                {/* Trip Information */}
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">Trip Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">From:</span>
                      <span className="text-secondary-900">{selectedInvoice.pickupLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">To:</span>
                      <span className="text-secondary-900">{selectedInvoice.dropLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">Pricing Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Subtotal:</span>
                      <span className="text-secondary-900">
                        ${formatCurrency(selectedInvoice.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Tax (13%):</span>
                      <span className="text-secondary-900">
                        ${formatCurrency(selectedInvoice.tax_amount)}
                      </span>
                    </div>
                    <div className="border-t border-secondary-200 pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-secondary-900">Total:</span>
                        <span className="text-secondary-900">
                          ${formatCurrency(selectedInvoice.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {selectedInvoice.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-secondary-200">
                    <button
                      onClick={() => {
                        updateInvoiceStatus(selectedInvoice.invoice_id, 'paid')
                        setShowModal(false)
                      }}
                      className="btn-success flex-1"
                    >
                      Mark as Paid
                    </button>
                    <button
                      onClick={() => {
                        updateInvoiceStatus(selectedInvoice.invoice_id, 'cancelled')
                        setShowModal(false)
                      }}
                      className="btn-danger flex-1"
                    >
                      Cancel Invoice
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Invoices