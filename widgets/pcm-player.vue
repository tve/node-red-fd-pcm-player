<!-- PCM audio player widget -->
<template>
  <div class="d-flex align-center justify-center w-100">
    <span>{{src}}</span>
  </div>
</template>
  
<style scoped>
</style>

<script scoped>

import PCMPlayer from 'pcm-player'

export default {
  name: 'PcmPlayer',
  
  help: `PCM audio player.
The PCM audio player ... (write long help text)...
`,
 
  props: {
    data: { default: null, tip: "PCM audio data" },
    source: { type: String, default: null, tip: "description of audio source" },
  },

  data() { return {
    player: null,
  }},

  watch: {
    data(newVal, oldVal) {
      if (!this.player) {
        this.player = new PCMPlayer({
          inputCodec: 'Int16',
          channels: 2,
          sampleRate: 8000,
          flushTime: 2000,
        })
      }
      console.log(`PcmPlayer: feeding ${typeof newVal} ${newVal?.length||newVal?.byteLength} bytes`)
      this.player.feed(newVal)
    }
  },

  computed: {
    src() {
      return this.source || "--"
    }
  },

}
</script>
