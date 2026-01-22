const { loadProfile } = require('./user_profile');

function parseTimeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function isWithinRange(now, start, end) {
  if (start <= end) {
    return now >= start && now <= end;
  }
  // faixa cruzando meia-noite
  return now >= start || now <= end;
}

function canNotifyNow() {
  const profile = loadProfile();
  const prefs = profile.preferences;

  if (!prefs) {
    return { allowed: true, reason: 'no_preferences' };
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // ⏰ Janela de notificação
  if (prefs.notification_window) {
    const start = parseTimeToMinutes(prefs.notification_window.start);
    const end = parseTimeToMinutes(prefs.notification_window.end);

    if (!isWithinRange(nowMinutes, start, end)) {
      return { allowed: false, reason: 'outside_notification_window' };
    }
  }

  // 💤 Horário silencioso
  if (prefs.silent_hours?.enabled) {
    const silentStart = parseTimeToMinutes(prefs.silent_hours.start);
    const silentEnd = parseTimeToMinutes(prefs.silent_hours.end);

    if (isWithinRange(nowMinutes, silentStart, silentEnd)) {
      return { allowed: false, reason: 'silent_hours' };
    }
  }

  return { allowed: true, reason: 'ok' };
}

module.exports = {
  canNotifyNow
};
