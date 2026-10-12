<script setup>
import { ref } from 'vue';
import 'tlp-icons/element';

const done = ref(false);
</script>

<template>
  <button type="button" @click="done = !done">
    <tlp-icon :name="done ? 'circle-check' : 'circle'" duotone></tlp-icon>
    {{ done ? 'Done' : 'Mark done' }}
  </button>
</template>
