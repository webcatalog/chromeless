document.addEventListener('DOMContentLoaded', () => {
  // https://bulma.io/documentation/components/navbar/
  // Get all "navbar-burger" elements
  const navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.burger'), 0);

  // Check if there are any navbar burgers
  if (navbarBurgers.length > 0) {
    // Add a click event on each of them
    navbarBurgers.forEach((el) => {
      el.addEventListener('click', () => {
        // Get the target from the "data-target" attribute
        const { target } = el.dataset;
        const targetEl = document.getElementById(target);
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle('is-active');
        targetEl.classList.toggle('is-active');
      });
    });
  }

  // Dropdown for More Apps
  const dropdown = document.querySelector('#dropdown-more-apps-root');
  dropdown.querySelector('.dropdown-trigger').addEventListener('click', (event) => {
    event.stopPropagation();
    dropdown.classList.toggle('is-active');
    navbarBurgers.forEach((el) => {
      const { target } = el.dataset;
      const targetEl = document.getElementById(target);
      targetEl.classList.remove('is-active');
    });
  });
  document.addEventListener('click', () => {
    if (dropdown.classList.contains('is-active')) {
      dropdown.classList.remove('is-active');
    }
  });
});
