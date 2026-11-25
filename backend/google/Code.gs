// Paste into a private Google Apps Script project owned by the sender.
const WORKER_URL = "https://medschedule-1-3kvn.onrender.com/api/reminder-worker";

function workerRequest(path, payload) {
  const key = PropertiesService.getScriptProperties().getProperty("REMINDER_WORKER_SECRET");
  if (!key) throw new Error("Set REMINDER_WORKER_SECRET in Script Properties.");
  const response = UrlFetchApp.fetch(WORKER_URL + path, {
    method: "post", contentType: "application/json", payload: JSON.stringify(payload),
    headers: { Authorization: "Bearer " + key }, muteHttpExceptions: true,
  });
  const status = response.getResponseCode();
  if (status === 204) return null;
  if (status === 200) return JSON.parse(response.getContentText());
  throw new Error("Reminder worker " + path + " returned HTTP " + status);
}

function checkReminders() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const properties = PropertiesService.getScriptProperties();
    // Finish an interrupted acknowledgement before requesting a new email.
    const pending = properties.getProperty("PENDING_ACK");
    if (pending) {
      workerRequest("/sent", JSON.parse(pending));
      properties.deleteProperty("PENDING_ACK");
    }
    const deadline = Date.now() + 120000;
    while (Date.now() < deadline && MailApp.getRemainingDailyQuota() > 0) {
      const reminder = workerRequest("/claim", {});
      if (!reminder) break;
      MailApp.sendEmail({ to: reminder.to, subject: reminder.subject, body: reminder.body, name: "MedSchedule" });
      const receipt = { id: reminder.id, token: reminder.token };
      properties.setProperty("PENDING_ACK", JSON.stringify(receipt));
      workerRequest("/sent", receipt);
      properties.deleteProperty("PENDING_ACK");
    }
  } finally {
    lock.releaseLock();
  }
}

// Run this once from the editor to authorize Gmail and install one timer.
function installReminderTimer() {
  checkReminders();
  const exists = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === "checkReminders");
  if (!exists) ScriptApp.newTrigger("checkReminders").timeBased().everyMinutes(1).create();
}
