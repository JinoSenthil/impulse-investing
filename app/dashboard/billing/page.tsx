'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import DashboardPageWrapper from '@/components/ui/DashboardPageWrapper'
import Pagination from '@/components/ui/Pagination'
import ApiService from '@/services/ApiService'
import { RootState } from '@/lib/store'
import { Payment } from '@/types'

interface Invoice {
  transactionId: string | null
  amount: number
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED'
  paymentMethod: string | null
  paymentDetail: string
  createdAt: string
}

export default function BillingPage() {
  const { user } = useSelector((state: RootState) => state.auth)
  const userId = user?.id

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    const fetchPayments = async () => {
      if (typeof userId !== 'number') {
        setLoading(false)
        return
      }

      try {
        const data: Payment[] = await ApiService.getAllPayments(String(userId))

        const mapped: Invoice[] = (data || []).map((p) => ({
          transactionId: p.transactionId ?? '-',
          amount: p.amount ?? 0,
          paymentStatus:
            (p.paymentStatus as Invoice['paymentStatus']) ?? 'PENDING',
          paymentMethod: p.paymentMethod ?? '-',
          paymentDetail: p.paymentDetail ?? '-',
          createdAt: p.createdDate ?? '',
        }))

        mapped.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        setInvoices(mapped)
      } catch (err) {
        console.error('Failed to fetch payments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [userId])


  const totalPages = Math.ceil(invoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentInvoices = invoices.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => setCurrentPage(page)

  const formatAmount = (amount: number) => `${amount.toLocaleString('en-IN')}`

  const formatStatus = (status: Invoice['paymentStatus']) => {
    if (status === 'SUCCESS') return 'Paid'
    if (status === 'FAILED') return 'Failed'
    return 'Pending'
  }

  const statusStyles: Record<Invoice['paymentStatus'], string> = {
    SUCCESS: 'bg-accent-green/10 text-accent-green border border-accent-green/20',
    FAILED: 'bg-red-500/10 text-red-500 border border-red-500/20',
    PENDING: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  }

  const formatPaymentMethod = (method: string | null) => {
    if (!method) return 'N/A'
    return method.replaceAll('_', ' ')
  }

  return (
    <DashboardPageWrapper title="Billing">
      <div className="space-y-6 md:space-y-8">
        <div className="bg-bg-card border-2 border-border rounded-2xl overflow-hidden">
          <div className="p-5 md:p-6 border-b border-border">
            <h2 className="text-xl md:text-2xl font-bold">Billing History</h2>
            <p className="text-sm text-text-secondary mt-2">
              View and download your past invoices
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-6 text-sm text-text-secondary">
              Loading billing history...
            </div>
          )}

          {/* Empty */}
          {!loading && invoices.length === 0 && (
            <div className="p-6 text-sm text-text-secondary">
              No billing history yet.
            </div>
          )}

          {!loading && invoices.length > 0 && (
            <>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full">
                  <thead className="bg-bg-secondary">
                    <tr>
                      <th className="px-5 md:px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-5 md:px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="hidden sm:table-cell px-5 md:px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Amount (₹)
                      </th>
                      <th className="px-5 md:px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {currentInvoices.map((invoice, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-bg-secondary transition group"
                      >
                        <td className="px-5 md:px-6 py-4 text-xs md:text-sm whitespace-nowrap">
                          {new Date(invoice.createdAt).toLocaleDateString(
                            'en-IN',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </td>

                        <td className="px-5 md:px-6 py-4 font-semibold text-xs md:text-sm whitespace-nowrap">
                          {formatPaymentMethod(invoice.paymentMethod)}
                        </td>

                        <td className="hidden sm:table-cell px-5 md:px-6 py-4 font-bold text-sm whitespace-nowrap ">
                          {formatAmount(invoice.amount)}
                        </td>

                        <td className="px-5 md:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyles[invoice.paymentStatus]}`}
                          >
                            {formatStatus(invoice.paymentStatus)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="p-5 md:p-6 border-t border-border">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardPageWrapper>
  )
}
