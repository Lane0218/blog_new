<script setup lang="ts">
import { ref } from 'vue'
import { SpeedInsights } from '@vercel/speed-insights/vue';

const message = ref('Hello World!')
</script>

<template>
  <div class="my-custom-content">
    {{ message }}
  </div>
  <SpeedInsights />
</template>
