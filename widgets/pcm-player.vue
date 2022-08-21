<!-- PCM audio player widget -->
<template>
  <div class="d-flex align-center justify-center w-100">
    <span>{{ src }}</span>
  </div>
</template>
  
<style scoped>
</style>

<script setup>
import { markRaw } from 'vue'
</script>

<script scoped>

// divisor to convert audio samples to float range -1..+1
const convertDiv = { 'Int8': 128, 'Int16': 32768, 'Int32': 2147483648, 'Float32': 1 }
// type of array to use to read audio samples
const convertArray = { 'Int8': Int8Array, 'Int16': Int16Array, 'Int32': Int32Array, 'Float32': Float32Array }

export default {
  name: 'PcmPlayer',

  help: `PCM audio player.
The PCM audio player receives audio buffers in PCM format and plays them in real-time.

The \`stream\` property consists of an array of audio buffers that are to be played consecutively.
When the player is inactive and \`stream\` is set to have at least one buffer then the player
activates and plays the first buffer.
When reaching the end of a buffer it seamlessly plays the next buffer and so forth until no buffer
is found at which point it deactivates.

The \`stream\` property must be an array of objects describing audio buffers, each object must
have the following fields:

- \`data\`: the audio data as a typed array, e.g. Int8Array, Int16Array, Int32Array, or Float32Array.
- \`rate\`: the sample rate of the audio data, e.g. 44100.
- \`channels\`: the number of channels of the audio data, e.g. 1 for mono, 2 for stereo.
- \`format\`: audio sample format: 'Int8', 'Int16', 'Int32', or 'Float32'.

Whenever the audio player starts playing a buffer or finishes playing the last buffer it
outputs a message with:

- \`buffers\`: the number of buffers queued including the currently playing one
- \`millis\`: the number of milliseconds left to be played in all buffers (incl current one)
`,

  props: {
    stream: { type: Array, default: null, tip: "PCM audio stream buffers" },
    source: { type: String, default: null, tip: "description of audio source" },
  },

  output: { tip: "buffer end signal with fields: buffers, millis" },

  watch: {
    stream() {
      // pluck off one buffer descriptor at a time and feed it into the audio context
      while (Array.isArray(this.stream) && this.stream.length > 0) {
        const descr = this.stream.shift()
        this.feed(descr)
      }
    },
  },

  computed: {
    src() {
      return this.source || "--"
    }
  },

  methods: {
    initAudioContext() {
      if (this.audioCtx) return
      // we use markRaw to opt all the audio API objects out of the Vue reactivity system
      this.audioCtx = markRaw( new (window.AudioContext || window.webkitAudioContext)() )
      // add a gain node to control the volume
      this.gainNode = markRaw( this.audioCtx.createGain() )
      this.gainNode.gain.value = 1.0 // factor, e.g. 0.5=half volume, 2=double volume
      this.gainNode.connect(this.audioCtx.destination)
      this.endTime = null
      this.bufCnt = 0
    },

    // feed a descriptor into the audio context
    feed(descr) {
      // ensure we have a valid descriptor
      if (typeof descr !== 'object' || !descr.data || !descr.rate || !descr.channels || !descr.format) {
        console.error('PcmPlayer: invalid buffer descriptor', descr)
        return
      }
      if (typeof descr.data != 'object' || descr.data.constructor != ArrayBuffer) {
        console.error('PcmPlayer: data must be typed array, e.g. Int16Array, got:', descr.data?.constructor?.name)
        return
      }
      // ensure we have an audio context and convert the buffer to the internal format
      this.initAudioContext()
      const buffer = this.convertBuffer(descr)
      if (!buffer) return
      // create a source out of the buffer, hook it up, and start it at the end of the currently
      // queued buffers or right now if there are none
      const bufferSource = this.audioCtx.createBufferSource()
      bufferSource.buffer = buffer
      bufferSource.connect(this.gainNode)
      bufferSource.onended = this.handleBufferEnd
      const startTime = this.endTime || this.audioCtx.currentTime
      bufferSource.start(startTime)
      this.bufCnt++
      this.endTime = startTime + buffer.duration
      console.log(`PcmPlayer: queued ${buffer.duration.toFixed(3)}s of audio, start @${startTime}s`)
    },

    // convert the data in the descriptor to the internal format
    convertBuffer(descr) {
      // per-sample conversion factor to reach [-1.0..1.0] range
      const div = convertDiv[descr.format]
      const arrayTyp = convertArray[descr.format]
      if (!div || !arrayTyp) {
        console.error(`PcmPlayer: invalid format ${descr.format}, supported: ${Object.keys(convertDiv).join(',')}`)
        return
      }
      // allocate a buffer
      const source = new arrayTyp(descr.data)
      const length = source.length / descr.channels
      console.log(`PcmPlayer: converting ${length} samples from`, source)
      if (length <= 0) {
        console.error('PcmPlayer: invalid buffer length', source.length)
        return
      }
      const buffer = this.audioCtx.createBuffer(descr.channels, length, descr.rate)
      // in descr.data channels are interleaved, in buffer there's an array per channel
      for (let ch = 0; ch < descr.channels; ch++) {
        const channelData = buffer.getChannelData(ch)
        for (let dst=0,src=ch; dst < length; dst++,src+=descr.channels) {
          channelData[dst] = source[src] / div
        }
      }
      return buffer
    },

    // handle an event indicating that a buffer finished playing
    handleBufferEnd() {
      const timeLeft = this.endTime - this.audioCtx.currentTime
      this.bufCnt--
      if (timeLeft > 0) {
        console.log('PcmPlayer: buffer finished, time left:', timeLeft.toFixed(3))
        this.$emit('send', { buffers: this.bufCnt, millis: Math.floor(timeLeft*1000) })
      } else {
        console.log('PcmPlayer: all buffers finished')
        this.endTime = null
        this.bufCnt = 0
        this.audioCtx.close()
        this.audioCtx = null
        this.gainNode = null
        this.$emit('send', { buffers: 0, millis: 0 })
      }
    },

  },

}
</script>
