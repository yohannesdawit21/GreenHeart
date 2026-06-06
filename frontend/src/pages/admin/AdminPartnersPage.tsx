import { useState, useEffect, useCallback } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import {
  appShellMainClass,
  DashboardHeader,
  DashboardAlert,
  DashboardSection,
  EmptyState,
  FormError,
  LoadingSpinner,
} from '../../components/layout/dashboard-ui'
import { btnDanger, btnOutline, btnPrimary } from '../../components/layout/buttonStyles'
import { MaterialIcon } from '../../components/MaterialIcon'
import { PasswordInput } from '../../components/PasswordInput'
import { AdminSubNav } from '../../components/admin/AdminSubNav'
import { verificationService } from '../../api/verification.service'
import { getApiErrorMessage } from '../../utils/apiError'
import type { PartnerDoctorDto } from '@shared/contracts/verification.api'

type PartnerFormMode = 'create' | 'edit'

interface PartnerFormState {
  email: string
  username: string
  password: string
}

const emptyForm = (): PartnerFormState => ({ email: '', username: '', password: '' })

export function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerDoctorDto[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [modalError, setModalError] = useState('')
  const [actionError, setActionError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formMode, setFormMode] = useState<PartnerFormMode>('create')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PartnerFormState>(emptyForm)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const loadPartners = useCallback(async () => {
    try {
      const data = await verificationService.getPartners()
      setPartners(data.partners)
      setPageError('')
    } catch (err) {
      setPageError(getApiErrorMessage(err, 'Failed to load partner doctors.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPartners()
  }, [loadPartners])

  const openCreate = () => {
    setFormMode('create')
    setEditingId(null)
    setForm(emptyForm())
    setModalError('')
    setShowModal(true)
  }

  const openEdit = (partner: PartnerDoctorDto) => {
    setFormMode('edit')
    setEditingId(partner.id)
    setForm({ email: partner.email, username: partner.username, password: '' })
    setModalError('')
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')
    try {
      if (formMode === 'create') {
        await verificationService.registerPartner({
          email: form.email,
          username: form.username,
          password: form.password,
        })
      } else if (editingId) {
        await verificationService.updatePartner(editingId, {
          email: form.email,
          username: form.username,
          ...(form.password ? { password: form.password } : {}),
        })
      }
      setShowModal(false)
      await loadPartners()
    } catch (err) {
      setModalError(getApiErrorMessage(err, 'Could not save partner doctor.'))
    }
  }

  const handleDelete = async (id: string) => {
    setActionError('')
    try {
      await verificationService.deletePartner(id)
      setDeleteConfirmId(null)
      await loadPartners()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not delete partner doctor.'))
    }
  }

  return (
    <AppShell activeNav="admin-partners" showSearch={false}>
      <main className={`${appShellMainClass} flex flex-col gap-stack-lg`}>
        <DashboardHeader
          title="Partner doctors"
          description="Medical partners who run verification video interviews with advisor applicants."
          action={
            <button
              type="button"
              onClick={openCreate}
              className={`${btnPrimary} text-sm py-3 px-6 flex items-center justify-center gap-2 w-full sm:w-auto`}
            >
              <MaterialIcon name="person_add" className="text-sm" />
              Add partner
            </button>
          }
        />

        <AdminSubNav />

        {pageError && (
          <DashboardAlert variant="error" icon="error">
            {pageError}
          </DashboardAlert>
        )}
        {actionError && (
          <DashboardAlert variant="error" icon="error">
            {actionError}
          </DashboardAlert>
        )}

        <DashboardSection
          title="Registered partners"
          badge={
            <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-md text-xs">
              {partners.length} total
            </span>
          }
        >
          {loading ? (
            <LoadingSpinner label="Loading partner doctors…" />
          ) : partners.length === 0 ? (
            <EmptyState
              icon="group"
              title="No partner doctors"
              description="Add a partner doctor so they can verify advisor applicants."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-outline-variant/50 bg-surface-container-low/50">
                    <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant text-xs uppercase tracking-wide">
                      Name
                    </th>
                    <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant text-xs uppercase tracking-wide">
                      Email
                    </th>
                    <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant text-xs uppercase tracking-wide">
                      Joined
                    </th>
                    <th className="py-stack-sm px-stack-lg font-label-md text-on-surface-variant text-xs uppercase tracking-wide text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low/40">
                      <td className="py-stack-md px-stack-lg font-bold text-on-surface">{p.username}</td>
                      <td className="py-stack-md px-stack-lg text-sm text-on-surface-variant font-mono">{p.email}</td>
                      <td className="py-stack-md px-stack-lg text-sm text-on-surface-variant whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-stack-md px-stack-lg">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(p)}
                            className={`${btnOutline} text-xs px-3 py-2 inline-flex items-center gap-1`}
                          >
                            <MaterialIcon name="edit" className="text-sm" />
                            Edit
                          </button>
                          {deleteConfirmId === p.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDelete(p.id)}
                                className={`${btnDanger} text-xs px-3 py-2`}
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className={`${btnOutline} text-xs px-3 py-2`}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(p.id)}
                              className={`${btnOutline} text-xs px-3 py-2 inline-flex items-center gap-1 text-error border-error/30 hover:bg-error-container/20`}
                            >
                              <MaterialIcon name="delete" className="text-sm" />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardSection>

        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-xl border border-outline-variant shadow-2xl">
              <div className="p-stack-lg">
                <h2 className="font-headline-md text-headline-md mb-1">
                  {formMode === 'create' ? 'Add partner doctor' : 'Edit partner doctor'}
                </h2>
                <p className="text-sm text-on-surface-variant mb-stack-md">
                  Partners log in at /auth and use Partner Portal to verify advisors.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
                  {modalError && <FormError>{modalError}</FormError>}
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-unit text-sm">Full name</label>
                    <input
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5"
                      value={form.username}
                      onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-unit text-sm">Email</label>
                    <input
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-unit text-sm">
                      {formMode === 'create' ? 'Password' : 'New password (optional)'}
                    </label>
                    {formMode === 'create' ? (
                      <PasswordInput
                        value={form.password}
                        onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                        minLength={8}
                        required
                      />
                    ) : (
                      <PasswordInput
                        value={form.password}
                        onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                        placeholder="Leave blank to keep current"
                        minLength={8}
                      />
                    )}
                  </div>
                  <div className="flex gap-stack-sm pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className={`${btnOutline} flex-1 py-3`}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={`${btnPrimary} flex-1 py-3`}>
                      {formMode === 'create' ? 'Create' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  )
}
