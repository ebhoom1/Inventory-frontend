import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { API_URL } from "../../../utils/apiConfig";

const getRecordId = (record) =>
  typeof record === "string" ? record : record?._id;

const getDisplayName = (account) =>
  account?.firstName ||
  account?.userId ||
  account?.companyName ||
  account?.email ||
  "Unnamed account";

const UserAssignmentModal = ({
  open,
  user,
  onClose,
  onSaved,
}) => {
  const { userInfo } = useSelector(
    (state) => state.users || {}
  );

  const [admins, setAdmins] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedAdminIds, setSelectedAdminIds] =
    useState([]);
  const [selectedTechnicianIds, setSelectedTechnicianIds] =
    useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user?._id) {
      return;
    }

    const loadOptions = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${API_URL}/api/auth/assignment-options`,
          {
            headers: {
              Authorization: `Bearer ${userInfo?.token}`,
            },
          }
        );

        setAdmins(response.data?.admins || []);
        setTechnicians(
          response.data?.technicians || []
        );

        const freshUser = (
          response.data?.users || []
        ).find(
          (item) =>
            String(item._id) === String(user._id)
        );

        const sourceUser = freshUser || user;

        setSelectedAdminIds(
          (sourceUser.assignedAdmins || [])
            .map(getRecordId)
            .filter(Boolean)
            .map(String)
        );

        setSelectedTechnicianIds(
          (sourceUser.assignedTechnicians || [])
            .map(getRecordId)
            .filter(Boolean)
            .map(String)
        );
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Unable to load assignments",
          text:
            error?.response?.data?.message ||
            "Please try again.",
        });

        onClose();
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [open, user, userInfo?.token, onClose]);

  const toggleSelection = (
    id,
    selectedIds,
    setSelectedIds
  ) => {
    const normalizedId = String(id);

    setSelectedIds(
      selectedIds.includes(normalizedId)
        ? selectedIds.filter(
            (selectedId) =>
              selectedId !== normalizedId
          )
        : [...selectedIds, normalizedId]
    );
  };

  const saveAssignments = async () => {
    try {
      setSaving(true);

      await axios.put(
        `${API_URL}/api/auth/users/${user._id}/assignments`,
        {
          adminIds: selectedAdminIds,
          technicianIds: selectedTechnicianIds,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Assignments updated",
        text: `${user.companyName || user.userId} has been updated successfully.`,
        timer: 1800,
        showConfirmButton: false,
      });

      onSaved?.();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Assignment failed",
        text:
          error?.response?.data?.message ||
          "Unable to update assignments.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#DC6D18]">
              Assign Team
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {user.companyName || user.userId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading assignment options...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            <section>
              <h3 className="mb-3 font-semibold text-gray-800">
                Assigned Admins
              </h3>

              <div className="space-y-2 rounded-xl border p-3">
                {admins.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No Admin accounts available.
                  </p>
                ) : (
                  admins.map((admin) => {
                    const checked =
                      selectedAdminIds.includes(
                        String(admin._id)
                      );

                    return (
                      <label
                        key={admin._id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-orange-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleSelection(
                              admin._id,
                              selectedAdminIds,
                              setSelectedAdminIds
                            )
                          }
                          className="mt-1 h-4 w-4 accent-[#DC6D18]"
                        />

                        <span>
                          <span className="block text-sm font-semibold text-gray-800">
                            {getDisplayName(admin)}
                          </span>

                          <span className="block text-xs text-gray-500">
                            {admin.email}
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-3 font-semibold text-gray-800">
                Assigned Technicians
              </h3>

              <div className="space-y-2 rounded-xl border p-3">
                {technicians.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No Technician accounts available.
                  </p>
                ) : (
                  technicians.map((technician) => {
                    const checked =
                      selectedTechnicianIds.includes(
                        String(technician._id)
                      );

                    return (
                      <label
                        key={technician._id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-orange-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleSelection(
                              technician._id,
                              selectedTechnicianIds,
                              setSelectedTechnicianIds
                            )
                          }
                          className="mt-1 h-4 w-4 accent-[#DC6D18]"
                        />

                        <span>
                          <span className="block text-sm font-semibold text-gray-800">
                            {getDisplayName(technician)}
                          </span>

                          <span className="block text-xs text-gray-500">
                            {technician.email}
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        )}

        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-5 py-2 font-semibold text-gray-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={saveAssignments}
            disabled={loading || saving}
            className="rounded-lg bg-[#DC6D18] px-5 py-2 font-semibold text-white disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save Assignments"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAssignmentModal;