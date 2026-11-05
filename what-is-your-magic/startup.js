// Runs before the ordered, deferred dependencies. Never leave a dead Start button.
(function () {
  'use strict';
  let failed = false;
  function fail() {
    failed = true;
    document.getElementById('start').disabled = true;
    const status = document.getElementById('startup-status');
    status.hidden = false;
    status.textContent = 'โหลดแบบสอบถามไม่สำเร็จ โปรดโหลดหน้านี้ใหม่ หากยังไม่ได้ ให้ตรวจว่าเปิด Preview ของ branch feature/wizard-discovery-v1';
  }
  window.addEventListener('error', event => {
    if (event.target instanceof HTMLScriptElement || event.filename) fail();
  }, true);
  document.addEventListener('DOMContentLoaded', () => {
    if (failed || document.getElementById('start').disabled) fail();
  });
})();
