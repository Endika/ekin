<script lang="ts">
  // Placeholder router state; wired up by a later task.
  let _view: 'home' | 'builder' | 'session' | 'history' = $state('home')
</script>

<main class="app">
  <h1>Ekin</h1>
  <p>Bodyweight home workouts</p>
</main>

<style>
  .app {
    padding: max(1rem, env(safe-area-inset-top)) 1rem 1rem;
  }
</style>
