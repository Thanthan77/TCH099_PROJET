document.addEventListener("DOMContentLoaded", function () {
  function showTab(id) {
    const sections = document.querySelectorAll('.tab-content');
    sections.forEach(sec => sec.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
  }

  window.showTab = showTab;
});
