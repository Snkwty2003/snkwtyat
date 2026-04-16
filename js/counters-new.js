// Animated Counter with enhanced effects
function animateCounters(container = null) {
    try {
        const counters = (container && container.querySelectorAll)
    ? container.querySelectorAll(".stat-number")
            : document.querySelectorAll(".stat-number");

        if (counters.length === 0) {
            console.debug("No counter elements found");
            return;
        }


        counters.forEach(counter => {
            const target = +counter.getAttribute("data-counter") || +counter.getAttribute("data-target") || 0;
            const duration = +counter.getAttribute("data-duration") || 2000;
            const increment = target / (duration / 16);

            // Add glow effect
            counter.style.transition = "text-shadow 0.3s ease";

            // Add bounce animation
            counter.style.animation = "bounce 0.5s ease";

            const updateCount = () => {
                try {
                    const count = +counter.innerText;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + increment);
                        // Add glow effect during counting
                        counter.style.textShadow = "0 0 10px rgba(227, 62, 16, 0.5)";
                        requestAnimationFrame(updateCount);
                    } else {
                        counter.innerText = target;
                        // Trigger confetti and sound on completion
                        triggerConfetti();
                        playFireworksSound();
                        // Add final glow effect
                        counter.style.textShadow = "0 0 20px rgba(227, 62, 16, 0.8)";
                    }
                } catch (error) {
                    console.debug("Error updating counter:", error);
                }
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCount();
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.5
            });

            observer.observe(counter);
        });
    } catch (error) {
        console.debug("Error initializing counters:", error);
    }
}

// Confetti effect function
function triggerConfetti() {
    try {
        if (!document || !document.body) {
            console.debug("Document or body not available for confetti");
            return;
        }
        
        const colors = ['#E33E10', '#FF6B35', '#FFD700', '#FF4500', '#FF6347'];
        const confettiCount = 100;

        for (let i = 0; i < confettiCount; i++) {
            try {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: ${Math.random() * 10 + 5}px;
                    height: ${Math.random() * 10 + 5}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}vw;
                    top: -10px;
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                    pointer-events: none;
                    z-index: 9999;
                    animation: fall ${Math.random() * 3 + 2}s linear forwards;
                `;
                document.body.appendChild(confetti);

                setTimeout(() => {
                    try {
                        if (confetti && confetti.parentNode) {
                            confetti.remove();
                        }
                    } catch (error) {
                        console.debug("Error removing confetti:", error);
                    }
                }, 5000);
            } catch (error) {
                console.debug("Error creating confetti:", error);
            }
        }
    } catch (error) {
        console.debug("Error in triggerConfetti:", error);
    }
}

// Fireworks sound effect
let audioContext = null;
let audioInitialized = false;
let userInteracted = false;

function initAudioContext() {
    if (!audioInitialized && userInteracted) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioInitialized = true;
        } catch (error) {
            console.debug("Error initializing audio context:", error);
        }
    }
    return audioContext;
}

function playFireworksSound() {
    // Only play sound if user has interacted with the page
    if (!userInteracted) return;

    try {
        const ctx = initAudioContext();
        if (!ctx) return;

        // Resume audio context if suspended (required by some browsers)
        if (ctx.state === 'suspended') {
            ctx.resume().catch(err => {
                // Silently fail if resume is not allowed
                console.debug("Audio context resume failed:", err);
            });
        }

        // Only proceed if context is running
        if (ctx.state !== 'running') return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    } catch (error) {
        // Silently fail to avoid console errors
        console.debug("Sound playback failed:", error);
    }
}

// Mark user interaction and initialize audio
function handleUserInteraction() {
    userInteracted = true;
    initAudioContext();
}

// Initialize audio on first user interaction
document.addEventListener('click', handleUserInteraction, { once: true });
document.addEventListener('touchstart', handleUserInteraction, { once: true });
document.addEventListener('keydown', handleUserInteraction, { once: true });

// Add CSS animations for confetti and bounce
try {
    if (!document || !document.head) {
        console.debug("Document or head not available for styles");
    } else {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }

            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-20px);
                }
                60% {
                    transform: translateY(-10px);
                }
            }
        `;
        document.head.appendChild(style);
    }
} catch (error) {
    console.debug("Error adding CSS animations:", error);
}

// Initialize counters when DOM is loaded
try {
    document.addEventListener("DOMContentLoaded", () => {
        try {
            animateCounters();
        } catch (error) {
            console.debug("Error initializing counters on DOMContentLoaded:", error);
        }
    });
} catch (error) {
    console.debug("Error setting up DOMContentLoaded listener for counters:", error);
}
