// utils/qrLabelData.js
// Single source of truth for "which date rows belong on a printed/previewed
// QR label", driven by the equipment unit's lifecycle stage (New Installation
// / Refill / Service). Used by every QR rendering path (preview, individual
// print, bulk print) so they can never show different rows for the same unit.
//
// The QR *code* itself always encodes just the equipmentId (see
// getQrTextOnlyEquipmentId in EquipmentList.jsx) — this module only decides
// what text is printed next to it.

export const LIFECYCLE_TYPES = ["NEW_INSTALLATION", "REFILL", "SERVICE"];

function pick(...values) {
  for (const v of values) {
    if (v) return v;
  }
  return null;
}

/**
 * Infers the lifecycle stage for legacy records that predate
 * `latestActionType`, by comparing which of the lifecycle dates is most
 * recent. Falls back to NEW_INSTALLATION if nothing is set.
 */
export function inferLatestActionType(unit, equipment) {
  const explicit = unit?.latestActionType || equipment?.latestActionType;
  if (explicit && LIFECYCLE_TYPES.includes(explicit)) return explicit;

  const servicedOn = pick(unit?.servicedOn, equipment?.servicedOn);
  const refilledOn = pick(unit?.refilledOn, equipment?.refilledOn);
  const installedOn = pick(
    unit?.installedOn,
    equipment?.installedOn,
    unit?.installationDate,
    equipment?.installationDate,
  );

  const dates = [
    servicedOn && { type: "SERVICE", date: new Date(servicedOn) },
    refilledOn && { type: "REFILL", date: new Date(refilledOn) },
    installedOn && { type: "NEW_INSTALLATION", date: new Date(installedOn) },
  ].filter(Boolean);

  if (dates.length === 0) return "NEW_INSTALLATION";

  dates.sort((a, b) => b.date - a.date);
  return dates[0].type;
}

/**
 * Builds the ordered set of label rows for a QR label, based on the unit's
 * lifecycle stage. Never returns a row with an empty value — callers should
 * just render whatever comes back, no blank/"-" placeholders.
 *
 * @param {object} unit - the per-serial Equipment document
 * @param {object} [equipment] - the parent/summary equipment record to fall
 *   back to for fields not set directly on the unit (defaults to `unit`)
 */
export function buildQrLabelRows(unit, equipment) {
  const eq = equipment || unit || {};
  const u = unit || {};

  const latestActionType = inferLatestActionType(u, eq);

  const expiryValue = pick(u.expiryDate, eq.expiryDate);
  const hpTestedValue = pick(u.hpTestedDate, eq.hpTestedDate);

  let primaryDateLabel = "Installed";
  let primaryDateValue = pick(u.installedOn, eq.installedOn, u.installationDate, eq.installationDate);
  let dueDateLabel = "Due On";
  let dueDateValue = pick(u.nextRefillDue, eq.nextRefillDue, u.refDue, eq.refDue);
  let serviceType = null;

  if (latestActionType === "REFILL") {
    primaryDateLabel = "Refilled";
    primaryDateValue = pick(u.refilledOn, eq.refilledOn);
    dueDateLabel = "Refill Due";
    dueDateValue = pick(u.nextRefillDue, eq.nextRefillDue, u.refDue, eq.refDue);
  } else if (latestActionType === "SERVICE") {
    primaryDateLabel = "Serviced";
    primaryDateValue = pick(u.servicedOn, eq.servicedOn);
    dueDateLabel = "Service Due";
    dueDateValue = pick(u.nextServiceDue, eq.nextServiceDue);
    serviceType = pick(u.serviceType, eq.serviceType);
  }

  return {
    latestActionType,
    primaryDateLabel,
    primaryDateValue,
    dueDateLabel,
    dueDateValue,
    expiryValue,
    hpTestedValue,
    serviceType,
  };
}
