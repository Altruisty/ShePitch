// ============================================================
// CONFIGURATION
// ============================================================

const RAZORPAY_KEY = "rzp_live_Sss0YAeeJBz6Iq"; 

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx1guPrYizvmTTOkSWZAJczxBrqMTYLG7xDqqe5dwpttC8cvHjcQtDpaM8U2igmstpC/exec';

// ============================================================
// MAIN REGISTRATION LOGIC
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    // ===== SCROLL-TRIGGERED ANIMATIONS =====
    
    const sections = [
        '.she-about-section',
        '.she-categories-section', 
        '.she-stats-section',
        '.she-timeline-section',
        '.she-partners-section',
        '.she-register-section',
        '.she-collaboration-section',
        '.she-finale-section',
        '.she-benefits-wrapper',
        '.she-benefit-card'
    ];
    
    const animationClasses = [
        'animate-tag',
        'she-animated-title',
        'animate-fade-up',
        'animate-stat',
        'animate-card',
        'animate-card-center',
        'animate-list-item'
    ];

    const selector = sections
        .map(section => 
            animationClasses.map(cls => `${section} .${cls}`).join(', ')
        )
        .join(', ');

    const targets = document.querySelectorAll(selector);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                    
                    if (entry.target.classList.contains('she-animated-title')) {
                        const chars = entry.target.querySelectorAll('.char');
                        chars.forEach((char, index) => {
                            char.style.animationDelay = `${0.03 * index}s`;
                        });
                    }
                }, 400);
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    targets.forEach(el => observer.observe(el));

    setTimeout(() => {
        targets.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
                el.classList.add('is-visible');
                
                if (el.classList.contains('she-animated-title')) {
                    const chars = el.querySelectorAll('.char');
                    chars.forEach((char, index) => {
                        char.style.animationDelay = `${0.03 * index}s`;
                    });
                }
            }
        });
    }, 200);

    // ===== REGISTRATION FORM LOGIC =====
    const form = document.getElementById("shePitchRegistration");
    if (form) {
        const memberCountSelect = document.getElementById("memberCount");
        const membersContainer = document.getElementById("additionalMembersContainer");
        const totalFeeDisplay = document.getElementById("totalFeeDisplay");
        const couponInput = document.getElementById("couponCode");
        const applyCouponBtn = document.getElementById("applyCouponBtn");
        const couponMessage = document.getElementById("couponMessage");
        const discountNotice = document.getElementById("discountNotice");
        
        let isCouponApplied = false;
        const baseFeePerMember = 299;
        const discountPerMember = 100;

        const validCoupons = ["SHEPITCH100"];

        // --- Toast Notification Functions ---
        function showValidationToast(message) {
            const toast = document.getElementById('validationToast');
            const toastMessage = document.getElementById('toastMessage');
            
            if (!toast) return;
            
            if (Array.isArray(message)) {
                let html = '<ul class="mb-0">';
                message.forEach(msg => {
                    html += `<li>${msg}</li>`;
                });
                html += '</ul>';
                toastMessage.innerHTML = html;
            } else {
                toastMessage.textContent = message;
            }
            
            toast.style.display = 'block';
            
            clearTimeout(toast._timeout);
            toast._timeout = setTimeout(() => {
                dismissToast();
            }, 5000);
        }

        window.dismissToast = function() {
            const toast = document.getElementById('validationToast');
            if (toast) {
                toast.style.display = 'none';
            }
        };

        // --- 1. Dynamic Team Member Inputs Renderer ---
        function renderMemberInputs() {
            const totalMembers = parseInt(memberCountSelect.value, 10);
            const additionalCount = totalMembers - 1;
            membersContainer.innerHTML = "";

            membersContainer.style.opacity = '0';
            membersContainer.style.transform = 'translateY(10px)';
            
            for (let i = 1; i <= additionalCount; i++) {
                const memberHTML = `
                    <div class="col-12 mt-3 member-section">
                        <h6 class="fw-bold text-muted">Member ${i + 1} Details</h6>
                    </div>
                    <div class="col-md-6 member-section">
                        <label class="she-form-label required">Member ${i + 1} Name</label>
                        <input type="text" class="form-control she-input member-name" name="member_${i}_name" required>
                        <div class="invalid-feedback">Member name is required.</div>
                    </div>
                    <div class="col-md-3 member-section">
                        <label class="she-form-label required">Phone</label>
                        <input type="tel" class="form-control she-input member-phone" name="member_${i}_phone" pattern="[0-9]{10}" maxlength="10" required>
                        <div class="invalid-feedback">Valid 10-digit phone required.</div>
                    </div>
                    <div class="col-md-3 member-section">
                        <label class="she-form-label required">Email</label>
                        <input type="email" class="form-control she-input member-email" name="member_${i}_email" required>
                        <div class="invalid-feedback">Valid email required.</div>
                    </div>
                `;
                membersContainer.insertAdjacentHTML("beforeend", memberHTML);
            }
            
            setTimeout(() => {
                membersContainer.style.opacity = '1';
                membersContainer.style.transform = 'translateY(0)';
                membersContainer.style.transition = 'all 0.3s ease';
                
                const sections = membersContainer.querySelectorAll('.member-section');
                sections.forEach((section, index) => {
                    section.style.opacity = '0';
                    section.style.transform = 'translateX(20px)';
                    section.style.transition = 'all 0.3s ease';
                    setTimeout(() => {
                        section.style.opacity = '1';
                        section.style.transform = 'translateX(0)';
                    }, 50 * (index + 1));
                });
            }, 50);
            
            calculateTotalFee();
        }

        // --- 2. Dynamic Fee Calculation ---
        function calculateTotalFee() {
            const count = parseInt(memberCountSelect.value, 10);
            const rate = isCouponApplied ? (baseFeePerMember - discountPerMember) : baseFeePerMember;
            const total = count * rate;
            
            const currentTotal = parseInt(totalFeeDisplay.textContent);
            if (currentTotal !== total) {
                totalFeeDisplay.style.transition = 'all 0.3s ease';
                totalFeeDisplay.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    totalFeeDisplay.textContent = total;
                    setTimeout(() => {
                        totalFeeDisplay.style.transform = 'scale(1)';
                    }, 200);
                }, 150);
            } else {
                totalFeeDisplay.textContent = total;
            }
            
            return total;
        }

        memberCountSelect.addEventListener("change", renderMemberInputs);

        // --- 3. Coupon Logic ---
        function validateCoupon() {
            const code = couponInput.value.trim().toUpperCase();
            
            if (validCoupons.includes(code)) {
                isCouponApplied = true;
                couponMessage.className = "text-success d-block mt-1 small";
                couponMessage.textContent = "✅ Coupon code applied successfully!";
                discountNotice.classList.remove("d-none");
                couponInput.style.borderColor = "#28a745";
                couponInput.style.backgroundColor = "#f8fff8";
                couponInput.style.color = "#000000";
                
                discountNotice.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    discountNotice.style.transform = 'scale(1)';
                    discountNotice.style.transition = 'transform 0.3s ease';
                }, 50);
            } else if (code.length > 0) {
                isCouponApplied = false;
                couponMessage.className = "text-danger d-block mt-1 small";
                couponMessage.textContent = "❌ Invalid coupon code.";
                discountNotice.classList.add("d-none");
                couponInput.style.borderColor = "#dc3545";
                couponInput.style.backgroundColor = "#fffafa";
                couponInput.style.color = "#000000";
            } else {
                isCouponApplied = false;
                couponMessage.textContent = "";
                couponInput.style.borderColor = "";
                couponInput.style.backgroundColor = "";
                couponInput.style.color = "#000000";
                discountNotice.classList.add("d-none");
            }
            calculateTotalFee();
        }

        couponInput.addEventListener("input", function() {
            if (this.value.length >= 3) {
                validateCoupon();
            } else {
                isCouponApplied = false;
                couponMessage.textContent = "";
                couponInput.style.borderColor = "";
                couponInput.style.backgroundColor = "";
                couponInput.style.color = "#000000";
                discountNotice.classList.add("d-none");
                calculateTotalFee();
            }
        });

        applyCouponBtn.addEventListener("click", function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                this.style.transition = 'transform 0.2s ease';
            }, 150);
            validateCoupon();
        });

        // --- 4. Form Validation ---
        const formInputs = document.querySelectorAll('.she-input');
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.style.color = '#000000';
                
                if (this.value.length > 0) {
                    let isValid = true;
                    
                    if (this.type === 'email') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        isValid = emailRegex.test(this.value);
                    } else if (this.type === 'tel') {
                        const phoneRegex = /^[0-9]{10}$/;
                        isValid = phoneRegex.test(this.value);
                    } else if (this.hasAttribute('pattern')) {
                        const pattern = new RegExp(this.getAttribute('pattern'));
                        isValid = pattern.test(this.value);
                    }
                    
                    if (isValid) {
                        this.classList.add('is-valid');
                        this.classList.remove('is-invalid');
                    } else {
                        this.classList.remove('is-valid');
                        this.classList.add('is-invalid');
                    }
                } else {
                    this.classList.remove('is-valid');
                    this.classList.remove('is-invalid');
                }
            });
            
            input.addEventListener('blur', function() {
                this.style.color = '#000000';
                
                if (this.hasAttribute('required') && this.value.length === 0) {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                } else if (this.value.length > 0) {
                    let isValid = true;
                    
                    if (this.type === 'email') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        isValid = emailRegex.test(this.value);
                    } else if (this.type === 'tel') {
                        const phoneRegex = /^[0-9]{10}$/;
                        isValid = phoneRegex.test(this.value);
                    } else if (this.hasAttribute('pattern')) {
                        const pattern = new RegExp(this.getAttribute('pattern'));
                        isValid = pattern.test(this.value);
                    }
                    
                    if (isValid) {
                        this.classList.add('is-valid');
                        this.classList.remove('is-invalid');
                    } else {
                        this.classList.remove('is-valid');
                        this.classList.add('is-invalid');
                    }
                }
            });
            
            input.addEventListener('focus', function() {
                this.style.color = '#000000';
            });
        });

        // --- Initial Render ---
        renderMemberInputs();

        // ============================================================
        // 5. FORM SUBMISSION - OPENS RAZORPAY DIRECTLY
        // ============================================================

        form.addEventListener("submit", async function(e) {
            e.preventDefault();

            // ==========================================
            // 1. PREVENT DOUBLE CLICK
            // ==========================================
            const submitBtn = document.getElementById("submitBtn");
            if (submitBtn.disabled) {
                return;
            }

            // ==========================================
            // 2. FORM VALIDATION
            // ==========================================
            form.classList.add("was-validated");
            if (!form.checkValidity()) {
                e.stopPropagation();
                const errors = [];
                const invalidInputs = form.querySelectorAll(":invalid");
                invalidInputs.forEach(input => {
                    const container = input.closest(".col-md-6, .col-md-4, .col-md-3, .col-12");
                    const label = container?.querySelector(".she-form-label");
                    const labelText = label ? label.textContent.replace("*", "").trim() : "Field";
                    const feedback = container?.querySelector(".invalid-feedback");
                    const message = feedback ? feedback.textContent.trim() : `${labelText} is required`;
                    errors.push(message);
                });
                showValidationToast(errors);
                const firstInvalid = form.querySelector(":invalid");
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
                }
                return;
            }

            // ==========================================
            // 3. COLLECT FORM DATA
            // ==========================================
            const formData = new FormData(form);
            const formDataObj = {};
            formData.forEach((value, key) => {
                formDataObj[key] = value;
            });

            const memberCount = parseInt(document.getElementById("memberCount").value, 10);
            for (let i = 1; i < memberCount; i++) {
                const nameInput = document.querySelector(`input[name="member_${i}_name"]`);
                const phoneInput = document.querySelector(`input[name="member_${i}_phone"]`);
                const emailInput = document.querySelector(`input[name="member_${i}_email"]`);
                if (nameInput) formDataObj[`member_${i}_name`] = nameInput.value.trim();
                if (phoneInput) formDataObj[`member_${i}_phone`] = phoneInput.value.trim();
                if (emailInput) formDataObj[`member_${i}_email`] = emailInput.value.trim();
            }

            const totalFee = calculateTotalFee();
            formDataObj.totalFee = String(totalFee);
            formDataObj.isCouponApplied = isCouponApplied ? "true" : "false";
            formDataObj.couponCode = couponInput.value.trim().toUpperCase();

            const selectedCategory = document.querySelector('input[name="category"]:checked');
            if (!selectedCategory) {
                showValidationToast("Please select a participation category.");
                resetSubmitButton();
                return;
            }
            formDataObj.category = selectedCategory.value;

            if (!totalFee || totalFee <= 0) {
                showValidationToast("Invalid registration amount.");
                resetSubmitButton();
                return;
            }

            console.log("Registration data:", formDataObj);

            // ==========================================
            // 4. BUTTON LOADING
            // ==========================================
            const btnText = submitBtn.querySelector(".btn-text");
            const spinner = submitBtn.querySelector(".spinner-border");
            submitBtn.disabled = true;
            btnText.textContent = "Opening Payment...";
            spinner.classList.remove("d-none");

            try {
                // ============================================================
                // 5. OPEN RAZORPAY CHECKOUT DIRECTLY (NO APPS SCRIPT CALL)
                // ============================================================

                const options = {
                    key: RAZORPAY_KEY,
                    amount: totalFee * 100, 
                    currency: "INR",
                    name: "ShePitch",
                    description: "ShePitch Registration Fee",
                    prefill: {
                        name: formDataObj.leaderName || "",
                        email: formDataObj.leaderEmail || "",
                        contact: formDataObj.leaderPhone || ""
                    },
                    notes: {
                        teamName: formDataObj.teamName || "",
                        projectTitle: formDataObj.projectTitle || ""
                    },
                    handler: function(response) {
                        // Payment success - send data to Apps Script
                        handlePaymentSuccess(formDataObj, response, totalFee);
                    },
                    modal: {
                        ondismiss: function() {
                            showPaymentFailure("Payment Cancelled");
                        }
                    },
                    theme: {
                        color: "#000000"
                    }
                };

                const razorpay = new Razorpay(options);

                razorpay.on("payment.failed", function(response) {
                    console.error("Payment failed:", response);
                    showPaymentFailure(response?.error?.description || "Payment failed. Please try again.");
                });

                razorpay.open();

            } catch (error) {
                console.error("Error:", error);
                showPaymentFailure(error.message || "Something went wrong. Please try again.");
            }
        });

        // ============================================================
        // HANDLE PAYMENT SUCCESS - Send data to Apps Script to save
        // ============================================================
        async function handlePaymentSuccess(formDataObj, paymentResponse, totalFee) {

            console.log("Payment successful:", paymentResponse);

            // ============================================================
            // ADD PAYMENT DETAILS
            // ============================================================

            formDataObj.razorpayPaymentId =
                paymentResponse.razorpay_payment_id || "";

            formDataObj.razorpayOrderId =
                paymentResponse.razorpay_order_id || "";

            formDataObj.razorpaySignature =
                paymentResponse.razorpay_signature || "";

            formDataObj.paymentStatus = "Captured";

            formDataObj.paymentVerifiedAt =
                new Date().toISOString();


            // ============================================================
            // UPDATE BUTTON
            // ============================================================

            const submitBtn = document.getElementById("submitBtn");

            if (submitBtn) {

                const btnText = submitBtn.querySelector(".btn-text");

                if (btnText) {
                    btnText.textContent = "Saving Registration...";
                }
            }


            // ============================================================
            // SAVE TO GOOGLE APPS SCRIPT
            // ============================================================

            try {


                const response = await fetch(WEB_APP_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8"
                    },
                    body: JSON.stringify(formDataObj)
                });



                // Try reading JSON response
                let result = null;

                try {

                    const responseText = await response.text();

                    

                    if (responseText) {
                        result = JSON.parse(responseText);
                    }

                } catch (parseError) {

                    console.warn(
                        "Could not parse Apps Script response:",
                        parseError
                    );

                }


                // ============================================================
                // SUCCESS
                // ============================================================

                if (result && result.success) {

                    const teamName =
                        formDataObj.teamName || "Your Team";

                    const registrationId =
                        result.registrationId ||
                        "SP-" +
                        Math.floor(
                            100000 +
                            Math.random() * 900000
                        );


                    showSuccessModal(
                        teamName,
                        totalFee,
                        registrationId
                    );


                    // Reset form AFTER modal is displayed

                    form.reset();

                    form.classList.remove("was-validated");

                    document
                        .querySelectorAll(".is-valid, .is-invalid")
                        .forEach(function(el) {

                            el.classList.remove(
                                "is-valid",
                                "is-invalid"
                            );

                        });


                    isCouponApplied = false;

                    couponMessage.textContent = "";

                    couponInput.style.borderColor = "";

                    couponInput.style.backgroundColor = "";

                    couponInput.style.color = "#000000";

                    discountNotice.classList.add("d-none");


                    return;
                }


                // ============================================================
                // APPS SCRIPT ERROR
                // ============================================================

                if (result && result.success === false) {

                    showPaymentFailure(
                        result.error ||
                        "Payment succeeded, but registration could not be saved."
                    );

                    return;
                }


                // ============================================================
                // UNKNOWN RESPONSE
                // ============================================================

                showPaymentFailure(
                    "Payment was successful, but the registration server returned an unexpected response."
                );


            } catch (error) {

                console.error(
                    "Registration save error:",
                    error
                );

                showPaymentFailure(
                    "Payment was successful, but registration could not be confirmed. Please contact the organizer."
                );

            } finally {

                resetSubmitButton();

            }
        }



        // ============================================================
        // HELPER FUNCTIONS
        // ============================================================

        function showPaymentFailure(message) {
            console.error("Payment Failure:", message);
            showValidationToast([message]);
            resetSubmitButton();
        }

        function resetSubmitButton() {
            const submitBtn = document.getElementById("submitBtn");
            if (!submitBtn) return;
            const btnText = submitBtn.querySelector(".btn-text");
            const spinner = submitBtn.querySelector(".spinner-border");
            submitBtn.disabled = false;
            if (btnText) btnText.textContent = "Proceed to Complete Registration";
            if (spinner) spinner.classList.add("d-none");
            submitBtn.style.transform = "scale(1)";
        }

function showSuccessModal(teamName, totalPaid, refId) {

    const modal = document.getElementById("successModal");

    if (!modal) {
        console.error("❌ successModal element not found!");
        return;
    }

    console.log("🔵 Opening success modal...");

    // ============================================================
    // CLOSE / REMOVE ANY LEFTOVER RAZORPAY OVERLAY
    // ============================================================

    document
        .querySelectorAll(
            ".razorpay-container, .razorpay-backdrop, .modal-backdrop"
        )
        .forEach(function (element) {

            element.style.display = "none";
            element.remove();

        });


    // ============================================================
    // MAKE SURE MODAL IS DIRECT CHILD OF BODY
    // ============================================================

    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }


    // ============================================================
    // SET MODAL DATA
    // ============================================================

    const teamElement =
        document.getElementById("modalTeamName");

    const paidElement =
        document.getElementById("modalTotalPaid");

    const refElement =
        document.getElementById("modalRefId");


    if (teamElement) {
        teamElement.textContent =
            teamName || "Your Team";
    }

    if (paidElement) {
        paidElement.textContent =
            totalPaid || "0";
    }

    if (refElement) {
        refElement.textContent =
            refId || "SP-" +
            Math.floor(
                100000 + Math.random() * 900000
            );
    }


    // ============================================================
    // SHOW MODAL
    // ============================================================

    modal.classList.add("active");

    modal.style.setProperty(
        "display",
        "flex",
        "important"
    );

    modal.style.setProperty(
        "position",
        "fixed",
        "important"
    );

    modal.style.setProperty(
        "inset",
        "0",
        "important"
    );

    modal.style.setProperty(
        "width",
        "100vw",
        "important"
    );

    modal.style.setProperty(
        "height",
        "100vh",
        "important"
    );

    modal.style.setProperty(
        "z-index",
        "2147483647",
        "important"
    );

    modal.style.setProperty(
        "opacity",
        "1",
        "important"
    );

    modal.style.setProperty(
        "visibility",
        "visible",
        "important"
    );


    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    document.documentElement.style.overflow = "hidden";


    console.log("✅ Success modal displayed");
}

        window.closeSuccessModal = function() {
            const modal = document.getElementById("successModal");
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        };

        const successModal = document.getElementById("successModal");

        if (successModal) {

            successModal.addEventListener("click", function(e) {

                if (e.target === successModal) {
                    window.closeSuccessModal();
                }

            });

        }


        document.addEventListener("keydown", function(e) {

            if (e.key === "Escape") {
                window.closeSuccessModal();
            }

        });

    }

    // ===== COLLEGE COLLABORATION SECTION ADDITIONAL EFFECTS =====
    const collabSection = document.querySelector('.she-collaboration-section');
    if (collabSection) {
        const circles = collabSection.querySelectorAll('.she-float-circle');
        window.addEventListener('scroll', function() {
            const rect = collabSection.getBoundingClientRect();
            const scrollPosition = window.scrollY;
            const sectionTop = rect.top + scrollPosition;
            const scrollOffset = scrollPosition - sectionTop;
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                circles.forEach((circle, index) => {
                    const speed = 0.02 + (index * 0.01);
                    const yOffset = scrollOffset * speed;
                    const xOffset = (scrollOffset * speed * 0.5) * (index % 2 === 0 ? 1 : -1);
                    circle.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
                });
            }
        });

        const benefitItems = collabSection.querySelectorAll('.she-benefit-item');
        benefitItems.forEach((item, index) => {
            item.addEventListener('mouseenter', function() {
                this.style.transitionDelay = '0s';
            });
        });

        const statNumbers = collabSection.querySelectorAll('.she-stat-number-mini');
        let statsAnimated = false;
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !statsAnimated) {
                    statNumbers.forEach((stat) => {
                        const text = stat.textContent;
                        const number = parseInt(text.replace(/[^0-9]/g, ''));
                        if (!isNaN(number)) {
                            animateCounter(stat, number);
                        }
                    });
                    statsAnimated = true;
                }
            });
        }, { threshold: 0.5 });

        const statsContainer = collabSection.querySelector('.she-stats-mini');
        if (statsContainer) {
            statsObserver.observe(statsContainer);
        }

        function animateCounter(element, target) {
            const duration = 1500;
            const startTime = performance.now();
            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(easeOutQuart * target);
                const suffix = element.textContent.replace(/[0-9]/g, '');
                element.textContent = current + suffix;
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target + suffix;
                }
            }
            requestAnimationFrame(updateCounter);
        }
    }

    // Hero title animation fix for two-line layout
    const heroTitle = document.querySelector('.she-hero-title');
    if (heroTitle) {
        const chars = heroTitle.querySelectorAll('.char');
        chars.forEach((char, index) => {
            char.style.display = 'inline-block';
        });
    }

    console.log(`ShePitch: ${targets.length} animation elements initialized`);
    console.log("All sections initialized with appearance effects");
});

// Force submit button visibility after page load
setTimeout(function() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.style.opacity = '1';
        submitBtn.style.visibility = 'visible';
        submitBtn.style.display = 'block';
        submitBtn.style.transform = 'none';
        submitBtn.style.pointerEvents = 'auto';
        console.log('Submit button forced visible');
    }
}, 100);

// ===== GRAND FINALE SECTION COUNTER ANIMATION =====
const finaleSection = document.querySelector('#grand-finale');
if (finaleSection) {
    const finaleCards = finaleSection.querySelectorAll('.she-finale-card');
    const finaleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    finaleCards.forEach(card => finaleObserver.observe(card));
    const headerElements = finaleSection.querySelectorAll('.animate-tag, .she-animated-title, .animate-fade-up');
    headerElements.forEach(el => finaleObserver.observe(el));
}

// Also ensure it's visible when the form card becomes visible
const formCard = document.querySelector('.she-register-section .animate-card');
if (formCard) {
    const observer2 = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.classList.contains('is-visible')) {
                const submitBtn = document.getElementById('submitBtn');
                if (submitBtn) {
                    submitBtn.style.opacity = '1';
                    submitBtn.style.visibility = 'visible';
                    submitBtn.style.transform = 'none';
                }
            }
        });
    });
    observer2.observe(formCard, { attributes: true, attributeFilter: ['class'] });
}

document.addEventListener("DOMContentLoaded", function () {
    const timelineSection = document.querySelector("#timeline");
    if (!timelineSection) return;
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.25
    };
    const timelineObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const tag = entry.target.querySelector(".animate-tag");
                const title = entry.target.querySelector(".she-animated-title");
                const description = entry.target.querySelector(".animate-fade-up");
                const cards = entry.target.querySelectorAll(".animate-card-center");
                if (tag) tag.classList.add("is-visible");
                if (title) title.classList.add("is-visible");
                if (description) description.classList.add("is-visible");
                cards.forEach((card) => {
                    card.classList.add("is-visible");
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    timelineObserver.observe(timelineSection);
});

document.addEventListener("DOMContentLoaded", function () {
    const statsSection = document.getElementById("stats");
    const counters = document.querySelectorAll("#stats .counter");
    let animated = false;

    function startCounting() {
        const duration = 1200;
        const frameDuration = 1000 / 60;
        const totalFrames = Math.round(duration / frameDuration);
        counters.forEach((counter) => {
            const target = +counter.getAttribute("data-target");
            let frame = 0;
            const countInterval = setInterval(() => {
                frame++;
                const progress = frame / totalFrames;
                const easeOutQuad = progress * (2 - progress);
                const currentCount = Math.floor(easeOutQuad * target);
                counter.innerText = currentCount;
                if (frame >= totalFrames) {
                    counter.innerText = target;
                    clearInterval(countInterval);
                }
            }, frameDuration);
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                if (!animated && entry.target.id === "stats") {
                    startCounting();
                    animated = true;
                }
            } else {
                entry.target.classList.remove("is-visible");
                if (entry.target.id === "stats") {
                    animated = false;
                    counters.forEach(c => c.innerText = "0");
                }
            }
        });
    }, { threshold: 0.2 });

    observer.observe(statsSection);
    document.querySelectorAll("#stats .animate-tag, #stats .she-animated-title, #stats .animate-fade-up, #stats .animate-card").forEach((el) => observer.observe(el));
});

// ===== OPEN FOR COLLABORATION SECTION - APPEARANCE EFFECTS =====
document.addEventListener("DOMContentLoaded", function () {
    const collabSection = document.getElementById("collaboration");
    if (!collabSection) return;

    const headerElements = collabSection.querySelectorAll('.animate-tag, .she-animated-title, .animate-fade-up');
    const cards = collabSection.querySelectorAll('.animate-card');

    const observerOptions = {
        root: null,
        rootMargin: "0px 0px -50px 0px",
        threshold: 0.15
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                headerElements.forEach(el => {
                    el.classList.add('is-visible');
                });
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('is-visible');
                    }, index * 80);
                });
                sectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sectionObserver.observe(collabSection);

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    cards.forEach(card => cardObserver.observe(card));
});