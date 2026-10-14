/**
 * The legacy Sadaka/BCT theme is a jQuery site: `script.js` enhances the
 * server-rendered markup on load (meanmenu, Swiper, WOW, magnific-popup, …).
 *
 * These definitions mirror `frontend/layouts/header.blade.php` (the `<script>`
 * order) and `footer.blade.php` (the inline handlers) so the behaviour matches
 * the Laravel app byte-for-byte.
 */

// jQuery must stay first so the plugins below find it.
export const LEGACY_SCRIPTS = [
  "/assets/frontend/js/jquery-3.7.1.min.js",
  "/assets/frontend/js/bootstrap.min.js",
  "/assets/frontend/js/meanmenu.js",
  "/assets/frontend/js/swiper-bundle.min.js",
  "/assets/frontend/js/jquery.counterup.min.js",
  "/assets/frontend/js/wow.min.js",
  "/assets/frontend/js/magnific-popup.min.js",
  "/assets/frontend/js/nice-select.min.js",
  "/assets/frontend/js/isotope.pkgd.min.html",
  "/assets/frontend/js/jquery.waypoints.js",
  "/assets/frontend/js/script.js",
  "https://cdn.jsdelivr.net/npm/toastify-js",
];

export const TOASTIFY_STYLESHEET =
  "https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css";

/*
 * The Blade kept these handlers in `DOMContentLoaded` listeners because the
 * scripts loaded at parse time. They now load after React hydrates, so the
 * wrapper is dropped and the body runs directly (the DOM is already present).
 */

export const CAREER_FORM_SCRIPT = `
// Form submission handler
$('#careerForm').submit(function(e) {
    e.preventDefault();

    // Validate form
    if (!this.checkValidity()) {
        e.stopPropagation();
        $(this).addClass('was-validated');

        Toastify({
            text: "Please fill all required fields correctly",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: "#dc3545",
        }).showToast();
        return;
    }

    var formData = new FormData(this);

    // Add CSRF token to form data
    formData.append('_token', $('meta[name="csrf-token"]').attr('content'));

    // Show loading toast
    var loadingToast = Toastify({
        text: "Submitting your application...",
        duration: -1,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "#0d6efd",
    }).showToast();

    $.ajax({
        url: '/careers', // Update this to your actual endpoint
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            loadingToast.hideToast();

            Toastify({
                text: "Application submitted successfully!",
                duration: 5000,
                close: true,
                gravity: "top",
                position: "right",
                backgroundColor: "#28a745",
            }).showToast();

            // Reset form and close modal
            $('#careerForm')[0].reset();
            $('#careerForm').removeClass('was-validated');
            $('#careerModal').modal('hide');
        },
        error: function(xhr) {
            loadingToast.hideToast();

            let errorMessage = "An error occurred. Please try again.";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            } else if (xhr.status === 419) {
                errorMessage = "Session expired. Please refresh the page and try again.";
            }

            Toastify({
                text: errorMessage,
                duration: 5000,
                close: true,
                gravity: "top",
                position: "right",
                backgroundColor: "#dc3545",
            }).showToast();
        }
    });
});

// Reset form when modal is closed
$('#careerModal').on('hidden.bs.modal', function() {
    $('#careerForm')[0].reset();
    $('#careerForm').removeClass('was-validated');
});
`;

export const CONSULT_FORM_SCRIPT = `
// Form submission handler
$('#consultForm').submit(function(e) {
    e.preventDefault();

    // Validate form
    if (!this.checkValidity()) {
        e.stopPropagation();
        $(this).addClass('was-validated');

        Toastify({
            text: "Please fill all required fields correctly",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: "#dc3545",
        }).showToast();
        return;
    }

    var formData = new FormData(this);

    // Add CSRF token to form data
    formData.append('_token', $('meta[name="csrf-token"]').attr('content'));

    // Show loading toast
    var loadingToast = Toastify({
        text: "Submitting your application...",
        duration: -1,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "#0d6efd",
    }).showToast();

    $.ajax({
        url: '/consults', // Update this to your actual endpoint
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            loadingToast.hideToast();

            Toastify({
                text: "Application submitted successfully!",
                duration: 5000,
                close: true,
                gravity: "top",
                position: "right",
                backgroundColor: "#28a745",
            }).showToast();

            // Reset form and close modal
            $('#consultForm')[0].reset();
            $('#consultForm').removeClass('was-validated');
            $('#consultModal').modal('hide');
        },
        error: function(xhr) {
            loadingToast.hideToast();

            let errorMessage = "An error occurred. Please try again.";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            } else if (xhr.status === 419) {
                errorMessage = "Session expired. Please refresh the page and try again.";
            }

            Toastify({
                text: errorMessage,
                duration: 5000,
                close: true,
                gravity: "top",
                position: "right",
                backgroundColor: "#dc3545",
            }).showToast();
        }
    });
});

// Reset form when modal is closed
$('#consultModal').on('hidden.bs.modal', function() {
    $('#consultForm')[0].reset();
    $('#consultForm').removeClass('was-validated');
});
`;

export const ACTIVE_MENU_SCRIPT = `
const currentPath = window.location.pathname;

const menuLinks = document.querySelectorAll(".main-menu nav ul li a");

menuLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;

    // Normalize trailing slashes
    if (
        linkPath.replace(/\\/+$/, '') === currentPath.replace(/\\/+$/, '') ||
        (linkPath === "/" && currentPath === "/")
    ) {
        link.classList.add("active");
    }
});
`;

/** Inline handlers that the site layout runs once after hydration. */
export const SITE_INLINE_SCRIPTS = [
  CAREER_FORM_SCRIPT,
  CONSULT_FORM_SCRIPT,
  ACTIVE_MENU_SCRIPT,
];
