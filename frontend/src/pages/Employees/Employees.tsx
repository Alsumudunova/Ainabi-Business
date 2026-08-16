import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, UserCog } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { InviteEmployeeModal } from "./InviteEmployeeModal";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import * as employeeService from "../../services/employee.service";
import { extractErrorMessage } from "../../services/api";
import { formatDateTime } from "../../utils/format";
import { employeeStatusLabels, roleLabels } from "../../utils/labels";
import type { Employee, Role } from "../../types";

export default function Employees() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canManage = session?.role === "OWNER" || session?.role === "ADMIN";

  const load = useCallback(() => {
    setEmployees(null);
    employeeService
      .listEmployees()
      .then(setEmployees)
      .catch((error) => showToast({ variant: "error", title: "Жүктөлгөн жок", message: extractErrorMessage(error) }));
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInvite(values: { name: string; email: string; phone: string; password: string; role: Exclude<Role, "OWNER"> }) {
    setSubmitting(true);
    try {
      await employeeService.inviteEmployee({ ...values, phone: values.phone || undefined });
      showToast({ variant: "success", title: "Кызматкер кошулду" });
      setInviteOpen(false);
      load();
    } catch (error) {
      showToast({ variant: "error", title: "Сакталган жок", message: extractErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusToggle(employee: Employee) {
    try {
      await employeeService.updateEmployee(employee.id, { status: employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
      showToast({ variant: "success", title: "Статус өзгөртүлдү" });
      load();
    } catch (error) {
      showToast({ variant: "error", title: "Өзгөртүлгөн жок", message: extractErrorMessage(error) });
    }
  }

  async function handleRoleChange(employee: Employee, role: Exclude<Role, "OWNER">) {
    try {
      await employeeService.updateEmployee(employee.id, { role });
      showToast({ variant: "success", title: "Роль өзгөртүлдү" });
      load();
    } catch (error) {
      showToast({ variant: "error", title: "Өзгөртүлгөн жок", message: extractErrorMessage(error) });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await employeeService.deleteEmployee(deleteTarget.id);
      showToast({ variant: "success", title: "Кызматкер өчүрүлдү" });
      setDeleteTarget(null);
      load();
    } catch (error) {
      showToast({ variant: "error", title: "Өчүрүлгөн жок", message: extractErrorMessage(error) });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="stack gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Кызматкерлер</h1>
          <p className="page-subtitle">Командаңызды жана алардын укуктарын башкарыңыз</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setInviteOpen(true)}>
            <Plus size={18} />
            Кызматкер кошуу
          </button>
        )}
      </div>

      <div className="card">
        {employees === null ? (
          <div className="card-pad">
            <SkeletonRows rows={5} height={52} />
          </div>
        ) : employees.length === 0 ? (
          <EmptyState icon={<UserCog size={26} />} title="Кызматкер жок" subtitle="Командаңызга кызматкер кошуңуз." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Аты</th>
                  <th>Байланыш</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th>Акыркы кирүү</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 700 }}>{e.name}</td>
                    <td className="text-muted stack gap-1">
                      <span>{e.email}</span>
                      {e.phone && <span style={{ fontSize: "var(--font-size-xs)" }}>{e.phone}</span>}
                    </td>
                    <td>
                      {canManage && e.role !== "OWNER" ? (
                        <select
                          className="select"
                          style={{ height: 34, fontSize: "var(--font-size-sm)" }}
                          value={e.role}
                          onChange={(ev) => handleRoleChange(e, ev.target.value as Exclude<Role, "OWNER">)}
                        >
                          <option value="ADMIN">Админ</option>
                          <option value="CASHIER">Кассир</option>
                        </select>
                      ) : (
                        <Badge variant={e.role === "OWNER" ? "info" : "neutral"}>{roleLabels[e.role]}</Badge>
                      )}
                    </td>
                    <td>
                      {canManage && e.role !== "OWNER" ? (
                        <button className={`badge ${e.status === "ACTIVE" ? "badge-success" : "badge-neutral"}`} style={{ cursor: "pointer", border: "none" }} onClick={() => handleStatusToggle(e)}>
                          {employeeStatusLabels[e.status]}
                        </button>
                      ) : (
                        <Badge variant={e.status === "ACTIVE" ? "success" : "neutral"}>{employeeStatusLabels[e.status]}</Badge>
                      )}
                    </td>
                    <td className="text-muted">{e.lastLoginAt ? formatDateTime(e.lastLoginAt) : "Кире элек"}</td>
                    <td>
                      {canManage && e.role !== "OWNER" && (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteTarget(e)}>
                          <Trash2 size={16} color="var(--color-danger-text)" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InviteEmployeeModal open={inviteOpen} onClose={() => setInviteOpen(false)} submitting={submitting} onSubmit={handleInvite} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Кызматкерди өчүрөсүзбү?"
        description={`"${deleteTarget?.name}" системага кире албай калат.`}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
