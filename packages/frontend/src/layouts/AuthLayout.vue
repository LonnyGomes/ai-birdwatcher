<template>
  <v-app class="auth-layout">
    <v-main>
      <div class="auth-container">
        <!-- Decorative Side -->
        <div class="auth-decoration">
          <div class="decoration-content">
            <div class="brand">
              <div class="brand-icon">
                <v-icon size="40" color="white">mdi-bird</v-icon>
              </div>
              <h1 class="brand-name">AI Birdwatcher</h1>
              <p class="brand-tagline">Discover and track your feathered visitors with AI-powered identification</p>
            </div>

            <div class="features">
              <div class="feature-item">
                <div class="feature-icon">
                  <v-icon size="20" color="white">mdi-brain</v-icon>
                </div>
                <span>AI-Powered Recognition</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <v-icon size="20" color="white">mdi-chart-timeline-variant</v-icon>
                </div>
                <span>Activity Tracking</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <v-icon size="20" color="white">mdi-wikipedia</v-icon>
                </div>
                <span>Species Information</span>
              </div>
            </div>
          </div>

          <!-- Animated circles -->
          <div class="floating-circles">
            <div class="circle circle--1"></div>
            <div class="circle circle--2"></div>
            <div class="circle circle--3"></div>
            <div class="circle circle--4"></div>
          </div>
        </div>

        <!-- Form Side -->
        <div class="auth-form-container">
          <div class="form-wrapper">
            <router-view />
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
}

.auth-container {
  display: flex;
  min-height: 100vh;
}

/* Decorative Side */
.auth-decoration {
  display: none;
  width: 50%;
  position: relative;
  background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%);
  overflow: hidden;
}

@media (min-width: 960px) {
  .auth-decoration {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.decoration-content {
  position: relative;
  z-index: 1;
  padding: 48px;
  max-width: 480px;
}

.brand {
  margin-bottom: 48px;
}

.brand-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-icon {
    animation: none;
  }
}

.brand-name {
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: 2.5rem;
  color: white;
  margin-bottom: 12px;
  line-height: 1.1;
}

.brand-tagline {
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Floating circles */
.floating-circles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}

.circle--1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
  animation: pulse-slow 8s ease-in-out infinite;
}

.circle--2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation: pulse-slow 6s ease-in-out infinite reverse;
}

.circle--3 {
  width: 150px;
  height: 150px;
  top: 40%;
  right: 10%;
  animation: pulse-slow 7s ease-in-out infinite;
}

.circle--4 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 20%;
  animation: pulse-slow 5s ease-in-out infinite reverse;
}

@keyframes pulse-slow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@media (prefers-reduced-motion: reduce) {
  .circle {
    animation: none;
  }
}

/* Form Side */
.auth-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: rgb(var(--v-theme-background));
}

.form-wrapper {
  width: 100%;
  max-width: 420px;
}

/* Responsive */
@media (max-width: 959px) {
  .auth-form-container {
    min-height: 100vh;
    background: linear-gradient(
      to bottom,
      #1B4332 0%,
      #2D6A4F 30%,
      rgb(var(--v-theme-background)) 30%
    );
  }

  .v-theme--dark .auth-form-container {
    background: linear-gradient(
      to bottom,
      #0D1B14 0%,
      #1A2F23 30%,
      rgb(var(--v-theme-background)) 30%
    );
  }

  .form-wrapper {
    margin-top: 60px;
  }
}
</style>
