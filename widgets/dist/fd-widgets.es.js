const h = window.Vue.toDisplayString, d = window.Vue.createElementVNode, m = window.Vue.openBlock, y = window.Vue.createElementBlock, p = { class: "d-flex align-center justify-center w-100" }, u = { Int8: 128, Int16: 32768, Int32: 2147483648, Float32: 1 }, b = { Int8: Int8Array, Int16: Int16Array, Int32: Int32Array, Float32: Float32Array }, g = {
  name: "PcmPlayer",
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

Whenever the audio player starts playing a buffer or finishes playing the last buffer it
outputs a message with:

- \`buffers\`: the number of buffers queued including the currently playing one
- \`millis\`: the number of milliseconds left to be played in all buffers (incl current one)
`,
  props: {
    stream: { type: Array, default: null, tip: "PCM audio stream buffers" },
    source: { type: String, default: null, tip: "description of audio source" }
  },
  output: { tip: "buffer end signal with fields: buffers, millis" },
  watch: {
    stream() {
      for (; Array.isArray(this.stream) && this.stream.length > 0; ) {
        const e = this.stream.shift();
        this.feed(e);
      }
    }
  },
  computed: {
    src() {
      return this.source || "--";
    }
  },
  methods: {
    initAudioContext() {
      this.audioCtx || (this.audioCtx = f(new (window.AudioContext || window.webkitAudioContext)()), this.gainNode = f(this.audioCtx.createGain()), this.gainNode.gain.value = 1, this.gainNode.connect(this.audioCtx.destination), this.endTime = null, this.bufCnt = 0);
    },
    feed(e) {
      if (typeof e != "object" || !e.data || !e.rate || !e.channels || !e.format) {
        console.error("PcmPlayer: invalid buffer descriptor", e);
        return;
      }
      if (typeof e.data != "object" || e.data.constructor != ArrayBuffer) {
        console.error("PcmPlayer: data must be typed array, e.g. Int16Array, got:", e.data?.constructor?.name);
        return;
      }
      this.initAudioContext();
      const t = this.convertBuffer(e);
      if (!t)
        return;
      const n = this.audioCtx.createBufferSource();
      n.buffer = t, n.connect(this.gainNode), n.onended = this.handleBufferEnd;
      const a = this.endTime || this.audioCtx.currentTime;
      n.start(a), this.bufCnt++, this.endTime = a + t.duration, console.log(`PcmPlayer: queued ${t.duration.toFixed(3)}s of audio, start @${a}s`);
    },
    convertBuffer(e) {
      const t = u[e.format], n = b[e.format];
      if (!t || !n) {
        console.error(`PcmPlayer: invalid format ${e.format}, supported: ${Object.keys(u).join(",")}`);
        return;
      }
      const a = new n(e.data), r = a.length / e.channels;
      if (console.log(`PcmPlayer: converting ${r} samples from`, a), r <= 0) {
        console.error("PcmPlayer: invalid buffer length", a.length);
        return;
      }
      const s = this.audioCtx.createBuffer(e.channels, r, e.rate);
      for (let o = 0; o < e.channels; o++) {
        const c = s.getChannelData(o);
        for (let i = 0, l = o; i < r; i++, l += e.channels)
          c[i] = a[l] / t;
      }
      return s;
    },
    handleBufferEnd() {
      const e = this.endTime - this.audioCtx.currentTime;
      this.bufCnt--, e > 0 ? (console.log("PcmPlayer: buffer finished, time left:", e.toFixed(3)), this.$emit("send", { buffers: this.bufCnt, millis: Math.floor(e * 1e3) })) : (console.log("PcmPlayer: all buffers finished"), this.endTime = null, this.bufCnt = 0, this.audioCtx.close(), this.audioCtx = null, this.gainNode = null, this.$emit("send", { buffers: 0, millis: 0 }));
    }
  }
}, f = window.Vue.markRaw, w = /* @__PURE__ */ Object.assign(g, {
  setup(e) {
    return (t, n) => (m(), y("div", p, [
      d("span", null, h(t.src), 1)
    ]));
  }
}), C = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: w
}, Symbol.toStringTag, { value: "Module" })), _ = /* @__PURE__ */ Object.assign({ "./pcm-player.vue": C });
export {
  _ as default
};
