const URL = 'https://192.168.0.9:8002/portal/local/index.html?uplcyid=2&weburl=';
async function ensureAlarm() {
  if (!await chrome.alarms.get('check')) await chrome.alarms.create('check', {periodInMinutes: 1});
}
chrome.runtime.onInstalled.addListener(ensureAlarm);
chrome.runtime.onStartup.addListener(ensureAlarm);
ensureAlarm();
chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== 'check') return;
  const tabs = await chrome.tabs.query({url: 'https://192.168.0.9/portal/local/*'});
  for (const tab of tabs) {
    if (!tab.url || new globalThis.URL(tab.url).port !== '8002') continue;
    try {
      const state = await chrome.tabs.sendMessage(tab.id, {type:'check'});
      if (state?.online) await chrome.tabs.reload(tab.id);
    } catch (_) {
      // A discarded or errored portal tab can be restored; never bypass certificate errors.
      if (tab.status !== 'loading') await chrome.tabs.update(tab.id, {url:URL});
    }
    break; // Only operate one portal tab.
  }
});
