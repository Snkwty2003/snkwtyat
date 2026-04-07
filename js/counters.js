// Animated Counter with enhanced effects
function animateCounters(container = null) {
    try {
        const counters = container 
            ? container.querySelectorAll(".stat-number")
            : document.querySelectorAll(".stat-number");

        if (counters.length === 0) {
            console.warn("No counter elements found");
            return;
        }

        const speed = 200;

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
                    console.error("Error updating counter:", error);
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
        console.error("Error initializing counters:", error);
    }
}

// Confetti effect function
function triggerConfetti() {
    const colors = ['#E33E10', '#FF6B35', '#FFD700', '#FF4500', '#FF6347'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
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

        setTimeout(() => confetti.remove(), 5000);
    }
}

// Fireworks sound effect
function playFireworksSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.error("Error playing sound:", error);
    }
}

// Add CSS animations for confetti and bounce
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

// Initialize counters when DOM is loaded
document.addEventListener("DOMContentLoaded", animateCounters);
