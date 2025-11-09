// User management functions
class UserManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.MAX_COURSES = 2; // Limit to 2 courses per student
        this.init();
    }

    init() {
        this.updateNavigation();
    }

    // Register new user
    register(userData) {
        // Check if user already exists
        const existingUser = this.users.find(user => user.email === userData.email);
        if (existingUser) {
            return { success: false, message: 'User already exists with this email' };
        }

        // Validate required fields
        if (!userData.name || !userData.email || !userData.password || !userData.interest) {
            return { success: false, message: 'Please fill in all required fields' };
        }

        // Validate password length
        if (userData.password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters long' };
        }

        // Add new user
        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone || '',
            interest: userData.interest,
            enrolledCourses: [],
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();
        
        // Auto login after registration
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        this.updateNavigation();
        
        return { success: true, user: newUser };
    }

    // Login user
    login(email, password) {
        console.log('Attempting login for:', email);
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            // Update last login
            user.lastLogin = new Date().toISOString();
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.saveUsers();
            this.updateNavigation();
            console.log('Login successful for:', email);
            return { success: true, user };
        }
        console.log('Login failed for:', email);
        return { success: false, message: 'Invalid email or password' };
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateNavigation();
        window.location.href = 'index.html';
    }

    // Enroll in course
    enrollCourse(courseName) {
        if (!this.currentUser) {
            showLoginModal(courseName);
            return { success: false, message: 'Please login to enroll in courses' };
        }

        // Check if user has reached course limit
        if (this.currentUser.enrolledCourses.length >= this.MAX_COURSES) {
            return { 
                success: false, 
                message: `You can only enroll in ${this.MAX_COURSES} courses at a time. Please unenroll from a course first.` 
            };
        }

        // Check if already enrolled in this course
        const alreadyEnrolled = this.currentUser.enrolledCourses.find(course => course.name === courseName);
        if (alreadyEnrolled) {
            return { success: false, message: 'You are already enrolled in this course' };
        }

        const course = {
            id: Date.now().toString(),
            name: courseName,
            enrolledAt: new Date().toISOString(),
            status: 'enrolled',
            progress: 0,
            lastAccessed: new Date().toISOString()
        };

        this.currentUser.enrolledCourses.push(course);
        
        // Update user in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
        }

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.saveUsers();
        
        return { success: true, message: `Successfully enrolled in ${courseName}` };
    }

    // Unenroll from course
    unenrollCourse(courseId) {
        if (!this.currentUser) {
            return { success: false, message: 'User not logged in' };
        }

        const courseIndex = this.currentUser.enrolledCourses.findIndex(course => course.id === courseId);
        if (courseIndex === -1) {
            return { success: false, message: 'Course not found' };
        }

        const courseName = this.currentUser.enrolledCourses[courseIndex].name;
        this.currentUser.enrolledCourses.splice(courseIndex, 1);
        
        // Update user in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
        }

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.saveUsers();
        
        return { success: true, message: `Successfully unenrolled from ${courseName}` };
    }

    // Get enrollment count
    getEnrollmentCount() {
        return this.currentUser ? this.currentUser.enrolledCourses.length : 0;
    }

    // Get remaining slots
    getRemainingSlots() {
        return this.MAX_COURSES - this.getEnrollmentCount();
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // Update navigation based on login status
    updateNavigation() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                if (userName) userName.textContent = `Welcome, ${this.currentUser.name}`;
            }
        } else {
            // User is not logged in
            if (loginBtn) loginBtn.style.display = 'block';
            if (registerBtn) registerBtn.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Course Management
class CourseManager {
    constructor() {
        this.courses = this.getAllCourses();
        this.filteredCourses = [...this.courses];
    }

    getAllCourses() {
        return [
            {
                id: 1,
                name: "Full Stack Web Development",
                description: "Learn front-end and back-end development with modern technologies",
                duration: "6 months",
                price: "$1,200",
                level: "beginner",
                category: "programming",
                requirements: ["Basic computer knowledge", "Logical thinking", "No prior coding experience required"],
                icon: "fas fa-code"
            },
            {
                id: 2,
                name: "Digital Marketing Specialist",
                description: "Master SEO, social media, email marketing, and digital advertising",
                duration: "4 months",
                price: "$900",
                level: "beginner",
                category: "marketing",
                requirements: ["Basic computer skills", "Understanding of social media", "Creative thinking"],
                icon: "fas fa-bullhorn"
            },
            {
                id: 3,
                name: "Graphic Design Professional",
                description: "Adobe Creative Suite, branding, and visual communication design",
                duration: "5 months",
                price: "$1,000",
                level: "beginner",
                category: "design",
                requirements: ["Creative mindset", "Basic computer skills", "No design experience required"],
                icon: "fas fa-palette"
            },
            {
                id: 4,
                name: "Data Science & Analytics",
                description: "Python, machine learning, data visualization, and statistical analysis",
                duration: "7 months",
                price: "$1,500",
                level: "intermediate",
                category: "data",
                requirements: ["Basic mathematics", "Logical thinking", "No prior programming experience required"],
                icon: "fas fa-chart-line"
            },
            {
                id: 5,
                name: "Cybersecurity Fundamentals",
                description: "Network security, ethical hacking, and information protection",
                duration: "6 months",
                price: "$1,300",
                level: "intermediate",
                category: "security",
                requirements: ["Basic networking knowledge", "Problem-solving skills", "No security experience required"],
                icon: "fas fa-shield-alt"
            },
            {
                id: 6,
                name: "Mobile App Development",
                description: "iOS and Android app development with React Native",
                duration: "5 months",
                price: "$1,100",
                level: "intermediate",
                category: "programming",
                requirements: ["Basic programming knowledge", "Understanding of JavaScript", "No mobile development experience required"],
                icon: "fas fa-mobile-alt"
            },
            {
                id: 7,
                name: "UI/UX Design",
                description: "User interface and experience design principles and tools",
                duration: "4 months",
                price: "$950",
                level: "beginner",
                category: "design",
                requirements: ["Creative thinking", "Basic computer skills", "No design experience required"],
                icon: "fas fa-pencil-ruler"
            },
            {
                id: 8,
                name: "Cloud Computing with AWS",
                description: "Amazon Web Services, cloud architecture, and deployment",
                duration: "5 months",
                price: "$1,400",
                level: "intermediate",
                category: "cloud",
                requirements: ["Basic networking knowledge", "Understanding of web technologies", "No cloud experience required"],
                icon: "fas fa-cloud"
            },
            {
                id: 9,
                name: "Python Programming",
                description: "Python programming language from basics to advanced topics",
                duration: "3 months",
                price: "$700",
                level: "beginner",
                category: "programming",
                requirements: ["Basic computer knowledge", "Logical thinking", "No programming experience required"],
                icon: "fab fa-python"
            },
            {
                id: 10,
                name: "Social Media Marketing",
                description: "Facebook, Instagram, Twitter, and LinkedIn marketing strategies",
                duration: "3 months",
                price: "$600",
                level: "beginner",
                category: "marketing",
                requirements: ["Social media familiarity", "Creative writing skills", "No marketing experience required"],
                icon: "fas fa-hashtag"
            },
            {
                id: 11,
                name: "Video Editing & Production",
                description: "Adobe Premiere Pro, After Effects, and video production techniques",
                duration: "4 months",
                price: "$850",
                level: "beginner",
                category: "media",
                requirements: ["Creative mindset", "Basic computer skills", "No video editing experience required"],
                icon: "fas fa-video"
            },
            {
                id: 12,
                name: "JavaScript Mastery",
                description: "Advanced JavaScript, ES6+, and modern frameworks",
                duration: "4 months",
                price: "$900",
                level: "intermediate",
                category: "programming",
                requirements: ["Basic programming knowledge", "Understanding of HTML/CSS", "No JavaScript experience required"],
                icon: "fab fa-js-square"
            },
            {
                id: 13,
                name: "Content Writing & SEO",
                description: "Professional writing, blogging, and search engine optimization",
                duration: "3 months",
                price: "$550",
                level: "beginner",
                category: "writing",
                requirements: ["Good writing skills in English", "Basic computer knowledge", "No SEO experience required"],
                icon: "fas fa-pen-fancy"
            },
            {
                id: 14,
                name: "Network Administration",
                description: "Network setup, maintenance, and troubleshooting",
                duration: "5 months",
                price: "$1,100",
                level: "intermediate",
                category: "networking",
                requirements: ["Basic computer knowledge", "Problem-solving skills", "No networking experience required"],
                icon: "fas fa-network-wired"
            },
            {
                id: 15,
                name: "E-commerce Management",
                description: "Online store setup, management, and digital sales strategies",
                duration: "3 months",
                price: "$750",
                level: "beginner",
                category: "business",
                requirements: ["Basic computer skills", "Understanding of online shopping", "No e-commerce experience required"],
                icon: "fas fa-shopping-cart"
            },
            {
                id: 16,
                name: "React.js Development",
                description: "Modern React development with hooks, context, and Redux",
                duration: "4 months",
                price: "$950",
                level: "intermediate",
                category: "programming",
                requirements: ["JavaScript knowledge", "HTML/CSS understanding", "No React experience required"],
                icon: "fab fa-react"
            },
            {
                id: 17,
                name: "Photography & Editing",
                description: "Digital photography techniques and Adobe Lightroom editing",
                duration: "3 months",
                price: "$650",
                level: "beginner",
                category: "media",
                requirements: ["Access to a camera", "Creative eye", "No photography experience required"],
                icon: "fas fa-camera"
            },
            {
                id: 18,
                name: "Database Management",
                description: "SQL, database design, and management with MySQL and MongoDB",
                duration: "4 months",
                price: "$800",
                level: "intermediate",
                category: "data",
                requirements: ["Basic computer knowledge", "Logical thinking", "No database experience required"],
                icon: "fas fa-database"
            },
            {
                id: 19,
                name: "Project Management",
                description: "Agile, Scrum, and traditional project management methodologies",
                duration: "4 months",
                price: "$900",
                level: "beginner",
                category: "business",
                requirements: ["Basic organizational skills", "Communication skills", "No management experience required"],
                icon: "fas fa-tasks"
            },
            {
                id: 20,
                name: "Artificial Intelligence",
                description: "Machine learning, neural networks, and AI applications",
                duration: "6 months",
                price: "$1,600",
                level: "advanced",
                category: "ai",
                requirements: ["Python programming knowledge", "Mathematics background", "Basic statistics understanding"],
                icon: "fas fa-robot"
            },
            {
                id: 21,
                name: "Web Design with WordPress",
                description: "Professional website creation using WordPress and Elementor",
                duration: "2 months",
                price: "$400",
                level: "beginner",
                category: "design",
                requirements: ["Basic computer skills", "No coding experience required", "Creative thinking"],
                icon: "fab fa-wordpress"
            },
            {
                id: 22,
                name: "Digital Illustration",
                description: "Digital drawing and illustration with Adobe Illustrator",
                duration: "3 months",
                price: "$700",
                level: "beginner",
                category: "design",
                requirements: ["Drawing interest", "Basic computer skills", "No illustration experience required"],
                icon: "fas fa-paint-brush"
            },
            {
                id: 23,
                name: "Business Analytics",
                description: "Data analysis for business decision making and strategy",
                duration: "4 months",
                price: "$1,000",
                level: "intermediate",
                category: "business",
                requirements: ["Basic Excel knowledge", "Analytical thinking", "No analytics experience required"],
                icon: "fas fa-chart-bar"
            },
            {
                id: 24,
                name: "Game Development",
                description: "2D and 3D game development with Unity engine",
                duration: "5 months",
                price: "$1,100",
                level: "intermediate",
                category: "programming",
                requirements: ["Basic programming knowledge", "Creative thinking", "No game development experience required"],
                icon: "fas fa-gamepad"
            },
            {
                id: 25,
                name: "Technical Writing",
                description: "Documentation, manuals, and technical communication",
                duration: "3 months",
                price: "$600",
                level: "beginner",
                category: "writing",
                requirements: ["Good writing skills", "Technical aptitude", "No technical writing experience required"],
                icon: "fas fa-file-alt"
            },
            {
                id: 26,
                name: "DevOps Engineering",
                description: "CI/CD, Docker, Kubernetes, and infrastructure automation",
                duration: "6 months",
                price: "$1,500",
                level: "advanced",
                category: "cloud",
                requirements: ["Linux knowledge", "Basic programming", "Networking understanding"],
                icon: "fas fa-server"
            }
        ];
    }

    filterCourses(category = 'all') {
        if (category === 'all') {
            this.filteredCourses = [...this.courses];
        } else {
            this.filteredCourses = this.courses.filter(course => course.category === category);
        }
        this.renderCourses();
    }

    searchCourses(query) {
        const searchTerm = query.toLowerCase();
        this.filteredCourses = this.courses.filter(course => 
            course.name.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm) ||
            course.category.toLowerCase().includes(searchTerm)
        );
        this.renderCourses();
    }

    renderCourses() {
        const coursesGrid = document.getElementById('coursesGrid');
        if (!coursesGrid) return;

        coursesGrid.innerHTML = '';

        this.filteredCourses.forEach(course => {
            const courseCard = this.createCourseCard(course);
            coursesGrid.appendChild(courseCard);
        });
    }

    createCourseCard(course) {
        const card = document.createElement('div');
        card.className = 'course-card';
        
        // Check if user is enrolled in this course
        const isEnrolled = userManager.getCurrentUser()?.enrolledCourses?.some(enrolled => enrolled.name === course.name);
        
        card.innerHTML = `
            <div class="course-icon">
                <i class="${course.icon}"></i>
            </div>
            <h3>${course.name}</h3>
            <p>${course.description}</p>
            <div class="course-details">
                <div class="course-info">
                    <span class="info-label">Duration:</span>
                    <span class="info-value duration">${course.duration}</span>
                </div>
                <div class="course-info">
                    <span class="info-label">Price:</span>
                    <span class="info-value price">${course.price}</span>
                </div>
                <div class="course-info">
                    <span class="info-label">Level:</span>
                    <span class="info-value level level-${course.level}">${course.level}</span>
                </div>
                <div class="requirements">
                    <h4>Requirements:</h4>
                    <ul class="requirements-list">
                        ${course.requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
            </div>
            ${isEnrolled ? 
                '<button class="btn btn-success enrolled-btn" disabled><i class="fas fa-check"></i> Already Enrolled</button>' :
                `<button class="btn btn-primary enroll-btn" onclick="enrollCourse('${course.name}')">
                    Enroll Now ${userManager.getCurrentUser() ? `(${userManager.getRemainingSlots()} slots left)` : ''}
                </button>`
            }
        `;
        return card;
    }
}

// Initialize UserManager and CourseManager
const userManager = new UserManager();
const courseManager = new CourseManager();

// Course enrollment function
function enrollCourse(courseName) {
    const result = userManager.enrollCourse(courseName);
    
    if (result.success) {
        alert(result.message);
        // Refresh the course display to show updated enrollment status
        if (document.getElementById('coursesGrid')) {
            courseManager.renderCourses();
        }
        // Refresh dashboard if on dashboard
        if (window.location.href.includes('dashboard.html')) {
            window.location.reload();
        }
    } else {
        if (result.message.includes('login')) {
            showLoginModal(courseName);
        } else {
            alert(result.message);
        }
    }
}

// Course unenrollment function
function unenrollCourse(courseId, courseName) {
    if (confirm(`Are you sure you want to unenroll from "${courseName}"?`)) {
        const result = userManager.unenrollCourse(courseId);
        
        if (result.success) {
            alert(result.message);
            // Refresh dashboard
            if (window.location.href.includes('dashboard.html')) {
                window.location.reload();
            }
            // Refresh courses page if open
            if (document.getElementById('coursesGrid')) {
                courseManager.renderCourses();
            }
        } else {
            alert(result.message);
        }
    }
}

// Show login modal
function showLoginModal(courseName) {
    const modal = document.getElementById('loginModal');
    const modalContent = document.getElementById('modalContent');
    
    if (modal && modalContent) {
        modalContent.innerHTML = `
            <button class="close-modal" onclick="closeModal()">&times;</button>
            <div class="modal-icon">
                <i class="fas fa-lock"></i>
            </div>
            <h3>Login Required</h3>
            <p>You need to login to enroll in "${courseName}"</p>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <a href="auth.html?type=login" class="btn btn-primary" style="flex: 1;">Login</a>
                <a href="auth.html?type=register" class="btn btn-outline" style="flex: 1;">Register</a>
            </div>
        `;
        modal.style.display = 'flex';
    } else {
        // Fallback: redirect to login page
        window.location.href = `auth.html?type=login&course=${encodeURIComponent(courseName)}`;
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Logout function
function logout() {
    userManager.logout();
}

// Redirect to dashboard if logged in
function checkAuthRedirect() {
    if (userManager.isLoggedIn() && window.location.href.includes('auth.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, checking auth state...');
    
    // Check if user should be redirected
    checkAuthRedirect();
    
    // Add logout event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Update navigation
    userManager.updateNavigation();

    // Initialize course manager
    if (document.getElementById('coursesGrid')) {
        courseManager.renderCourses();
        
        // Add category filter event listeners
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                // Filter courses
                const category = this.getAttribute('data-category');
                courseManager.filterCourses(category);
            });
        });

        // Add search functionality
        const searchInput = document.getElementById('courseSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                courseManager.searchCourses(this.value);
            });
        }
    }

    // Close modal when clicking outside
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});