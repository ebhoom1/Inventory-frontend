import React, { useEffect, useMemo, useState } from "react";

export default function ReportModal({ open, onClose, item, onSubmitted }) {
  useEffect(() => {
    if (!open) return;
    // lock background scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const schema = useMemo(
    () => [
      { key: "branchLocation", label: "Branch/Location", type: "text" },
      { key: "address", label: "Address", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "pincode", label: "Pincode/Area", type: "text" },
      { key: "brand", label: "Brand", type: "text" },
      { key: "type", label: "Type", type: "text" },
      { key: "capacity", label: "Capacity", type: "text" },
      { key: "installationDate", label: "Instalation Date", type: "date" },
      { key: "canSerialNumber", label: "Can Serial Number.", type: "text" },
      { key: "refillingDue", label: "Refilling Due", type: "date" },
       { key: "product", label: "Product", type: "text" },
      { key: "others", label: "Others", type: "text" },
      { key: "tag", label: "Tag", type: "select", options: ["yes", "no", "na"] },
      { key: "safetyPin", label: "Safety pin", type: "select", options: ["yes", "no", "na"] },
      { key: "pressureGuage", label: "Pressure Guage", type: "select", options: ["Green", "Red", "NA"] },
      { key: "valveSupport", label: "Valve support", type: "select", options: ["yes", "no", "na"] },
      { key: "corrossion", label: "Corrossion", type: "select", options: ["Fine", "Moderate", "Severe", "NA"] },
      { key: "baseCap", label: "Base Cap", type: "select", options: ["Ok", "Damaged", "Missing", "NA"] },
      { key: "powderFlow", label: "Powder Flow", type: "select", options: ["good", "average", "poor", "NA"] },
      { key: "remarks", label: "Remarks", type: "textarea" },
    ],
    []
  );

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    branchLocation: item?.site || item?.branch || "",
    address: item?.address || "",
    location: item?.location || "",
    pincode: item?.pincode || "",
    brand: item?.brand || item?.modelSeries || "",
    type: item?.type || "",
    capacity: item?.capacity || "",
    installationDate: item?.installationDate
      ? new Date(item.installationDate).toISOString().slice(0, 10)
      : "",
    canSerialNumber: item?.serialNumber || item?.serialNo || "",
    refillingDue: item?.refDue ? new Date(item.refDue).toISOString().slice(0, 10) : "",
    others: "",
    tag: "yes",
    safetyPin: "yes",
    pressureGuage: "Green",
    valveSupport: "yes",
    corrossion: "Fine",
    baseCap: "Ok",
    powderFlow: "good",
    remarks: "",
  }));

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        equipmentId: item?._id || item?.equipmentId,
        equipmentName: item?.equipmentName,
        modelSeries: item?.modelSeries,
        report: form,
      };
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      onSubmitted?.();
      onClose();
    } catch (err) {
      alert(`Save failed: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    // make viewport scrollable when content taller than screen
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      {/* Modal card */}
      <div className="relative w-[95vw] max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Add Report</h3>
            <p className="text-sm text-gray-500">
              {item?.equipmentName} {item?.modelSeries ? `• ${item.modelSeries}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schema.map((f) => (
              <div key={f.key} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    value={form[f.key] ?? ""}
                    onChange={(e) => update(f.key, e.target.value)}
                    className="rounded-md border-gray-300 focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
                  >
                    {(f.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={form[f.key] ?? ""}
                    onChange={(e) => update(f.key, e.target.value)}
                    className="rounded-md border-gray-300 focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
                    placeholder="Add remarks…"
                  />
                ) : (
                  <input
                    type={f.type}
                    value={form[f.key] ?? ""}
                    onChange={(e) => update(f.key, e.target.value)}
                    className="rounded-md border-gray-300 focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
                    placeholder={f.type === "date" ? "dd / mm / yyyy" : ""}
                  />
                )}
              </div>
            ))}
          </div>

        {/* Sticky footer */}
          <div className="sticky bottom-0 mt-6 -mx-6 px-6 py-3 border-t bg-white rounded-b-2xl flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#DC6D18] text-white font-semibold hover:bg-[#B85B14] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
