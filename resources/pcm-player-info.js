export default {
  "vue_file": "widgets/pcm-player.vue",
  "base_filename": "pcm-player",
  "module_dir": ".",
  "module_name": "@flexdash/node-red-fd-pcm-player",
  "resources_dir": "resources",
  "resources_path": "resources/@flexdash/node-red-fd-pcm-player",
  "name": "PcmPlayer",
  "name_text": "Pcm Player",
  "type_kebab": "fd-pcm-player",
  "help": "PCM audio player.\nThe PCM audio player receives audio buffers in PCM format and plays them in real-time.\n\nThe `stream` property consists of an array of audio buffers that are to be played consecutively.\nWhen the player is inactive and `stream` is set to have at least one buffer then the player\nactivates and plays the first buffer.\nWhen reaching the end of a buffer it seamlessly plays the next buffer and so forth until no buffer\nis found at which point it deactivates.\n\nThe `stream` property must be an array of objects describing audio buffers, each object must\nhave the following fields:\n\n- `data`: the audio data as a typed array, e.g. Int8Array, Int16Array, Int32Array, or Float32Array.\n- `rate`: the sample rate of the audio data, e.g. 44100.\n- `channels`: the number of channels of the audio data, e.g. 1 for mono, 2 for stereo.\n\nWhenever the audio player starts playing a buffer or finishes playing the last buffer it\noutputs a message with:\n\n- `buffers`: the number of buffers queued including the currently playing one\n- `millis`: the number of milliseconds left to be played in all buffers (incl current one)\n",
  "help_title": "PCM audio player",
  "help_body": "The PCM audio player receives audio buffers in PCM format and plays them in real-time.\n\nThe `stream` property consists of an array of audio buffers that are to be played consecutively.\nWhen the player is inactive and `stream` is set to have at least one buffer then the player\nactivates and plays the first buffer.\nWhen reaching the end of a buffer it seamlessly plays the next buffer and so forth until no buffer\nis found at which point it deactivates.\n\nThe `stream` property must be an array of objects describing audio buffers, each object must\nhave the following fields:\n\n- `data`: the audio data as a typed array, e.g. Int8Array, Int16Array, Int32Array, or Float32Array.\n- `rate`: the sample rate of the audio data, e.g. 44100.\n- `channels`: the number of channels of the audio data, e.g. 1 for mono, 2 for stereo.\n\nWhenever the audio player starts playing a buffer or finishes playing the last buffer it\noutputs a message with:\n\n- `buffers`: the number of buffers queued including the currently playing one\n- `millis`: the number of milliseconds left to be played in all buffers (incl current one)",
  "output": true,
  "props": {
    "title": {
      "name": "title",
      "name_text": "Title",
      "name_kebab": "title",
      "type": "string",
      "input_type": "str",
      "tip": "Text to display in the widget header. ",
      "default": "Pcm Player",
      "default_html": "'Pcm Player'"
    },
    "popup_info": {
      "name": "popup_info",
      "name_text": "Popup Info",
      "name_kebab": "popup-info",
      "type": "string",
      "input_type": "str",
      "tip": "Info text to display in (i) pop-up. ",
      "default": null,
      "default_html": null
    },
    "stream": {
      "name": "stream",
      "name_text": "Stream",
      "name_kebab": "stream",
      "tip": "PCM audio stream buffers. ",
      "default": null,
      "default_html": null,
      "type": "array",
      "input_type": "json"
    },
    "source": {
      "name": "source",
      "name_text": "Source",
      "name_kebab": "source",
      "tip": "Description of audio source. ",
      "default": null,
      "default_html": null,
      "type": "string",
      "input_type": "str"
    }
  },
  "payload_prop": ""
}