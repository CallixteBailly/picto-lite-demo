<template>
  <div id="layoutContainer">
    <header id="header-container">
      <Header />
    </header>
    <main id="page-container">
      <div class="page-content">
        <slot />
      </div>
    </main>
    <footer id="footer-container">
      <Footer />
    </footer>
  </div>
</template>

<script setup lang="ts">
function setVh() {
  document.documentElement.style.setProperty(
    '--vh',
    `${window.innerHeight * 0.01}px`
  )
}

onMounted(() => {
  setVh()
  window.addEventListener('resize', setVh, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setVh)
})
</script>

<style lang="scss">
@use '~/styles/default.scss' as *;

* {
  box-sizing: border-box;
}

html {
  font-family:
    'Nunito', 'Inter', 'Manrope', 'Poppins', 'Sora', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  color: var(--text-color);
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  background-color: var(--bg-color);
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-color);

  #__nuxt,
  #__layout {
    background-color: var(--bg-color);
  }
}

::-webkit-scrollbar {
  width: 7px;
  height: 7px;
  border-radius: 10px;
}

::-webkit-scrollbar-track {
  border-radius: 10px;
  border: 1px solid var(--scrollbar-border);
  background-color: var(--scrollbar-track);
  box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.3);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(
    45deg,
    var(--grey-blue-color),
    var(--dark-red-color)
  );
  border-radius: 10px;
}

#layoutContainer {
  background-color: var(--bg-color);

  #header-container {
    max-height: $header-height;
    position: sticky;
    padding: 20px 20px 0px 20px;
    top: 0;
    z-index: $header-z-index;
    background-color: var(--bg-color);
  }

  #page-container {
    min-height: calc(
      var(--vh, 1vh) * 100 - #{$header-height} - #{$footer-height}
    );
    height: 100%;
    background-color: var(--bg-color);

    .page-content {
      height: 100%;
      min-height: calc(
        var(--vh, 1vh) * 100 - #{$header-height} - #{$footer-height}
      );
      padding: 20px;
      padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
    }
  }

  #footer-container {
    width: 100%;
    height: $footer-height;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: $footer-z-index;
    background-color: var(--bg-color);
    border-top: 1px solid var(--border-shadow-color);
    box-shadow: 0 -2px 8px var(--footer-shadow-color);
  }
}

@supports (padding: max(0px)) {
  #layoutContainer {
    #footer-container {
      height: calc(#{$footer-height} + max(env(safe-area-inset-bottom), 0px));
      padding-bottom: max(env(safe-area-inset-bottom), 0px);
    }

    #page-container .page-content {
      padding-bottom: calc(20px + max(env(safe-area-inset-bottom), 0px));
    }
  }
}

@media screen and (max-width: $sm) {
  html {
    -webkit-text-size-adjust: 100%;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
