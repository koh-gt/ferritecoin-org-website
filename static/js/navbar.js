document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    const navbarMenu = document.getElementById('navbar-menu');

    const mobileWidth = 1080

    // Function to handle dropdown visibility on hover for desktop
    function handleHover() {
        this.querySelector('.dropdown-content').classList.add('fade-in');
        this.querySelector('.dropdown-content').classList.remove('fade-out');
        this.querySelector('.dropdown-content').style.display = 'block';
    }

    function handleHoverOut() {
        const dropdownContent = this.querySelector('.dropdown-content');
        dropdownContent.classList.add('fade-out');
        dropdownContent.classList.remove('fade-in');
        //dropdownContent.addEventListener('animationend', function() {
            dropdownContent.style.display = 'none';
        //}, { once: true });
    }

    // Function to handle dropdown visibility on click for mobile
    function handleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        const dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === 'block') {
            dropdownContent.classList.add('fade-out');
            dropdownContent.classList.remove('fade-in');
            //dropdownContent.addEventListener('animationend', function() {
                dropdownContent.style.display = 'none';
            //}, { once: true });
        } else {
            dropdownContent.classList.add('fade-in');
            dropdownContent.classList.remove('fade-out');
            dropdownContent.style.display = 'block';
        }
    }

    // Function to set event listeners based on screen width
    function setEventListeners() {
        if (window.innerWidth > mobileWidth) {
            dropdowns.forEach(dropdown => {
                dropdown.removeEventListener('click', handleClick);
                dropdown.querySelector('.nav-link').removeEventListener('click', handleClick);
                dropdown.removeEventListener('mouseenter', handleHover);
                dropdown.removeEventListener('mouseleave', handleHoverOut);

                dropdown.addEventListener('mouseenter', handleHover);
                dropdown.addEventListener('mouseleave', handleHoverOut);
            });
        } else {
            dropdowns.forEach(dropdown => {
                dropdown.removeEventListener('mouseenter', handleHover);
                dropdown.removeEventListener('mouseleave', handleHoverOut);
                dropdown.querySelector('.nav-link').removeEventListener('click', handleClick);
                
                dropdown.querySelector('.nav-link').addEventListener('click', handleClick);
                
                const dropdownContent = dropdown.querySelector('.dropdown-content');
                dropdownContent.addEventListener('click', function(event) {
                    event.stopPropagation();
                });
            });
        }
    }

    // Toggle mobile menu visibility
    mobileMenuIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        navbarMenu.classList.toggle('list--inline');
    });

    // Close all dropdowns if clicking outside
    document.addEventListener('click', function() {
        if (window.innerWidth <= mobileWidth) {
            dropdowns.forEach(function(dropdown) {
                const dropdownContent = dropdown.querySelector('.dropdown-content');
                if (dropdownContent.style.display === 'block') {
                    dropdownContent.classList.add('fade-out');
                    dropdownContent.classList.remove('fade-in');
                    dropdownContent.addEventListener('animationend', function() {
                        dropdownContent.style.display = 'none';
                    }, { once: true });
                }
            });
        }
    });

    // Set initial event listeners
    setEventListeners();

    // Update event listeners on window resize
    window.addEventListener('resize', setEventListeners);
});
