## Members

<dl>
<dt><a href="#address">address</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Get the address array of this command</p></dd>
<dt><a href="#childLength">childLength</a> : <code>number</code></dt>
<dd><p>Recursively get the sum length of all child commands in this command</p></dd>
<dt><a href="#isEnabled">isEnabled</a> : <code>boolean</code></dt>
<dd><p>Returns a value indicating whether or not this plugin is currently enabled</p></dd>
<dt><a href="#isInternal">isInternal</a> : <code>boolean</code></dt>
<dd><p>Check plugin is internal or not (Internal plugin will have field &quot;plugins&quot; which can access to all plugins)</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#constructor">constructor([options])</a></dt>
<dd><p>Create a Command</p></dd>
<dt><a href="#recursiveFind">recursiveFind([address], [index])</a> ⇒ <code>Array.&lt;Command&gt;</code></dt>
<dd><p>Recursively find all child commands</p></dd>
<dt><a href="#forEach">forEach(callbackFn)</a></dt>
<dd><p>Provide .forEach js built-in function like (with recursive)</p></dd>
<dt><a href="#add">add(...commands)</a> ⇒ <code>Promise</code></dt>
<dd><p>Add child commands to this command</p></dd>
<dt><a href="#load">load()</a> ⇒ <code>Promise</code></dt>
<dd><p>Called after this command is constructored, you would wrap your &quot;async this.add(command)&quot; in this function in order to load commands in synchronous</p></dd>
<dt><a href="#onCall">onCall(thread, message, reply, api)</a> ⇒ <code>string</code></dt>
<dd><p>Called when user hits command</p></dd>
<dt><a href="#load">load()</a> ⇒ <code>Promise</code></dt>
<dd><p>Called after this plugin is constructored (you would wrap your &quot;async this.commands.add(command)&quot; in this function in order to load commands in synchronous)</p></dd>
<dt><a href="#onDisable">onDisable()</a></dt>
<dd><p>Called when this plugin is disabled</p></dd>
<dt><a href="#onEnable">onEnable()</a></dt>
<dd><p>Called when this plugin is enabled</p></dd>
<dt><a href="#setEnable">setEnable()</a></dt>
<dd><p>Sets the enabled state of this plugin</p></dd>
<dt><a href="#constructor">constructor(configDir, userdataDir)</a></dt>
<dd><p>Constructor with init directories</p></dd>
<dt><a href="#getConfig">getConfig(plugin)</a> ⇒ <code>object</code></dt>
<dd><p>Get plugin's configuration search in this.configDir</p></dd>
<dt><a href="#getUserdata">getUserdata(plugin)</a> ⇒ <code>object</code></dt>
<dd><p>Get plugin's userdata search in this.userdataDir, userdata is more like datastore for plugin</p></dd>
<dt><a href="#add">add(plugins)</a> ⇒ <code>Promise</code></dt>
<dd><p>Add plugin(s) to this Manager</p></dd>
</dl>

<a name="address"></a>

## address : <code>Array.&lt;string&gt;</code>
<p>Get the address array of this command</p>

**Kind**: global variable
**Read only**: true
<a name="childLength"></a>

## childLength : <code>number</code>
<p>Recursively get the sum length of all child commands in this command</p>

**Kind**: global variable
**Read only**: true
<a name="isEnabled"></a>

## isEnabled : <code>boolean</code>
<p>Returns a value indicating whether or not this plugin is currently enabled</p>

**Kind**: global variable
**Read only**: true
<a name="isInternal"></a>

## isInternal : <code>boolean</code>
<p>Check plugin is internal or not (Internal plugin will have field &quot;plugins&quot; which can access to all plugins)</p>

**Kind**: global variable
**Read only**: true
<a name="constructor"></a>

## constructor([options])
<p>Create a Command</p>

**Kind**: global function

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>CommandOptions</code> | <code>{}</code> | <p>The options to create Command</p> |

<a name="recursiveFind"></a>

## recursiveFind([address], [index]) ⇒ <code>Array.&lt;Command&gt;</code>
<p>Recursively find all child commands</p>

**Kind**: global function
**Returns**: <code>Array.&lt;Command&gt;</code> - <p>Array of commands found</p>

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [address] | <code>Array</code> | <code>[]</code> | <p>The command address</p> |
| [index] | <code>number</code> | <code>0</code> | <p>Internal variable to use to do recursive stuff, don't need to understand</p> |

<a name="forEach"></a>

## forEach(callbackFn)
<p>Provide .forEach js built-in function like (with recursive)</p>

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| callbackFn | <code>function</code> | <p>Callback function with params(item, index, thisArray)</p> |

<a name="add"></a>

## add(...commands) ⇒ <code>Promise</code>
<p>Add child commands to this command</p>

**Kind**: global function
**Returns**: <code>Promise</code> - <p>Promise no return</p>

| Param | Type | Description |
| --- | --- | --- |
| ...commands | <code>Command</code> | <p>One or more commands</p> |

<a name="load"></a>

## load() ⇒ <code>Promise</code>
<p>Called after this command is constructored, you would wrap your &quot;async this.add(command)&quot; in this function in order to load commands in synchronous</p>

**Kind**: global function
<a name="onCall"></a>

## onCall(thread, message, reply, api) ⇒ <code>string</code>
<p>Called when user hits command</p>

**Kind**: global function
**Returns**: <code>string</code> - <p>Message you want to reply, you can use the &quot;reply&quot; function to reply but return will do it faster and support most of messenger-platforms</p>

| Param | Type | Description |
| --- | --- | --- |
| thread | <code>Thread</code> | <p>Instance of Thread class</p> |
| message | <code>Object</code> | <p>Message object, each messenger platform may be different</p> |
| reply | <code>function</code> | <p>Pass &quot;reply&quot; function from &quot;./deploy/facebook/hook.js&quot;</p> |
| api | <code>api</code> | <p>The API of messenger-platform you used</p> |

<a name="load"></a>

## load() ⇒ <code>Promise</code>
<p>Called after this plugin is constructored (you would wrap your &quot;async this.commands.add(command)&quot; in this function in order to load commands in synchronous)</p>

**Kind**: global function
**Returns**: <code>Promise</code> - <p>[description]</p>
<a name="onDisable"></a>

## onDisable()
<p>Called when this plugin is disabled</p>

**Kind**: global function
<a name="onEnable"></a>

## onEnable()
<p>Called when this plugin is enabled</p>

**Kind**: global function
<a name="setEnable"></a>

## setEnable()
<p>Sets the enabled state of this plugin</p>

**Kind**: global function
<a name="constructor"></a>

## constructor(configDir, userdataDir)
<p>Constructor with init directories</p>

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| configDir | <code>string</code> | <p>The config directory* (*: if use relative path, it won't use process.cwd() to join, it use your current __dirname or import.meta.url)</p> |
| userdataDir | <code>string</code> | <p>The userdata directory*</p> |

<a name="getConfig"></a>

## getConfig(plugin) ⇒ <code>object</code>
<p>Get plugin's configuration search in this.configDir</p>

**Kind**: global function
**Returns**: <code>object</code> - <p>The plugin's config</p>

| Param | Type | Description |
| --- | --- | --- |
| plugin | <code>Plugin</code> | <p>Instance of class Plugin</p> |

<a name="getUserdata"></a>

## getUserdata(plugin) ⇒ <code>object</code>
<p>Get plugin's userdata search in this.userdataDir, userdata is more like datastore for plugin</p>

**Kind**: global function
**Returns**: <code>object</code> - <p>Userdata</p>

| Param | Type | Description |
| --- | --- | --- |
| plugin | <code>Plugin</code> | <p>[description]</p> |

<a name="add"></a>

## add(plugins) ⇒ <code>Promise</code>
<p>Add plugin(s) to this Manager</p>

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| plugins | <code>Plugin</code> | <p>One or more plugins you want to add</p> |