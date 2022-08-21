// Node-RED node implementation for FlexDash widget PcmPlayer

module.exports = function (RED) {

  const widgetProps = {
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
}
  const widgetDefaults = Object.fromEntries(Object.values(widgetProps).map(p => [p.name, p.default]))

  // Instantiate the Node-RED node, 'this' is the node being constructed
  // and config contains the values set by the user in the flow editor.
  function PcmPlayer(config) {
    RED.nodes.createNode(this, config)

    // Create missing node properties. This is to deal with the fact that if node properties are
    // added in an upgrade then nodes in existing flows don't have them. Besides not having the
    // expected defaults, this breaks the "widget-has-property" check when setting dynamic prop
    // values.
    for (const prop in widgetDefaults) {
      if (!config.hasOwnProperty(prop)) {
        config[prop] = widgetDefaults[prop]
        this.debug("Missing property: " + prop + " added with default: " + config[prop])
      }
    }
  
    // Initialize the widget by pushing the config to its props and get a handle
    // onto the FlexDash widget API.
    // The third arg is the kind of widget to create, if it doesn't exist
    const widget = RED.plugins.get('flexdash').initWidget(this, config, 'PcmPlayer')
    if (!widget) return // missing config node, thus no FlexDash to hook up to, nothing to do here

    // handle flow input messages, basically massage them a bit and update the FD widget
    this.on("input", msg => {
      // if message has a topic and a `_delete` property then delete array-widget topic
      if ('topic' in msg && msg._delete) {
        widget.deleteTopic(msg.topic)
        return
      }
      // prepare update of widget props
      const props = Object.assign({}, msg) // shallow clone
      // msg.payload is interpreted as setting the  prop
      if ('' && 'payload' in msg) props[''] = msg.payload
      // delete fields that we don't want to pass to the widget, setProps ignores ones with leading _
      for (const p of ['topic', 'payload']) delete props[p]
      widget.setProps(msg.topic, props)
    })

    // handle widget input messages, we receive the payload sent by the widget
    if (true) {
      widget.onInput((topic, payload, socket) => {
        // propagate the payload into the flow and attach the FD socket ID
        let msg = { payload: payload, _flexdash_socket: socket }
        if (topic != undefined) msg.topic = topic
        this.send(msg)
      })
    }
  }

  RED.nodes.registerType("fd-pcm-player", PcmPlayer)
}
