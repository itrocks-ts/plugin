[![npm version](https://img.shields.io/npm/v/@itrocks/plugin?logo=npm)](https://www.npmjs.org/package/@itrocks/plugin)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/plugin)](https://www.npmjs.org/package/@itrocks/plugin)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/plugin?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/plugin)
[![issues](https://img.shields.io/github/issues/itrocks-ts/plugin)](https://github.com/itrocks-ts/plugin/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# plugin

A structure that allows classes to be extended with new behaviours via plugin.

## Installation

```bash
npm i @itrocks/plugin
```

## Core idea

- Your **feature** extends `HasPlugins`
- Each **plugin** extends `Plugin`
- The feature owns the lifecycle
- Plugins may:
  - hook into lifecycle phases (`init`, or custom ones)
  - override feature methods (AOP‑style)
  - expose their own options
  - depend on other plugins

Everything is **runtime**, **typed**, and **opt‑in**.

## Creating a feature

Your feature must:
1. extend `HasPlugins<Feature>`
2. call `constructPlugins()`
3. call `initPlugins()` (and optionally other phases)

```ts
import { HasPlugins } from '@itrocks/plugin'

export class Feature extends HasPlugins<Feature>
{
	constructor(options = {})
	{
		super(options)
		this.constructPlugins()
		this.initPlugins()
	}

	do()
	{
		console.log('Feature logic')
	}
}
```

You are in charge. No hidden lifecycle.

## Creating a plugin

A plugin:
- extends `Plugin<Feature, Options?>`
- may run code in `constructor()` (no access to `this.of`)
- usually does its real work in `init()` (access to `this.of`)

```ts
import { Plugin }  from '@itrocks/plugin'
import { Feature } from './feature.js'

export class FeaturePlugin extends Plugin<Feature>
{
	constructor()
	{
		super()
		// independent setup only — this.of is NOT available yet
	}
	init()
	{
		// this.of is now the Feature instance
		console.log('Plugin attached to feature')
	}
}
```

Rule of thumb:
- **constructor** → plugin‑local setup
- **init** → interact with the feature or other plugins

## Overriding feature methods (AOP)

The intended pattern is **explicit method wrapping**.

```ts
export class FeaturePlugin extends Plugin<Feature>
{
	init()
	{
		const superDo = this.of.do
		this.of.do    = function ()
		{
			console.log('Before feature logic')
			return superDo.call(this)
		}
	}
}
```

Guideline:
- extend behaviour
- do not break existing contracts
- keep overrides small and readable

Yes, SOLID still applies.
Avoid stacking too many overrides on the same method.

## Plugins with options

Plugins can define their own strongly‑typed options.

```ts
import { Plugin, PluginOptions } from '@itrocks/plugin'

class Options extends PluginOptions
{
	mode: 'soft' | 'hard' = 'soft'
}

export class ConfigurablePlugin extends Plugin<Feature, Options>
{
	defaultOptions()
	{
		return new Options()
	}
	init()
	{
		console.log('Mode:', this.options.mode)
	}
}
```

Important:
- always implement `defaultOptions()` if you use options
- `this.options` is fully initialised before `init()`

## Using plugins

### Default options

```ts
new Feature({
	plugins: [ConfigurablePlugin]
}).do()
```

### Custom options

```ts
new Feature({
	plugins: [new ConfigurablePlugin({ mode: 'hard' })]
}).do()
```

You may freely mix:
- plugin classes
- plugin instances

## Lifecycle phases

By default, `initPlugins()` calls `plugin.init()`.

You can define **additional phases**:

### Feature side

```ts
this.initPlugins('afterRender')
```

### Plugin side

```ts
afterRender()
{
	// optional phase
}
```

If a plugin does not implement the phase → nothing happens.
No guards needed.

## HasPlugins API

```ts
class HasPlugins<O extends object>
```

**Usage**
```ts
import { HasPlugins } from '@itrocks/plugin'
class Feature extends HasPlugins<Feature> {}
```

### Properties

#### options

Merged feature options.
Includes the `plugins` list.

#### plugins

Object mapping plugin **class name → instance**

```ts
this.plugins.FeaturePlugin
this.plugins.ConfigurablePlugin
```

This is the canonical access point for inter‑plugin communication.

### Methods

#### constructor(options?)

Stores feature options only, including plugin types or instances.
Does **not** build plugins.

#### constructPlugins()

- instantiates plugins from `options.plugins`
- assigns `plugin.of`
- populates `this.plugins`

Must be called manually, eg from your feature constructor.

#### initPlugins(initFunction = 'init')

Calls `plugin[initFunction]()` **only if**:
- the method exists
- it is defined or overridden by the plugin

Safe by design.

## Plugin API

```ts
class Plugin<O, PO extends PluginOptions = PluginOptions>
```

**Usage**
```ts
import { Plugin }  from '@itrocks/plugin'
import { Feature } from './feature'
class FeaturePlugin extends Plugin<Feature>
```

### Properties

#### of

Reference to the feature instance.
Available **after** `constructPlugins()`.

Never rely on it inside the constructor.

#### options

Plugin options.

### Methods

#### constructor(options?)

Receives partial options, that will be merged with defaults and stored into the `options` property.

Beware when you override this: `this.of` is **undefined** here.

#### defaultOptions()

Returns a fresh options object, with default values.
Mandatory if your plugin supports options.

**Example**
```ts
import { PluginOptions } from '@itrocks/plugin'
import { Plugin }        from '@itrocks/plugin'
import { Feature }       from './feature'
class Options extends PluginOptions
{
  mode: 'soft' | 'hard' = 'soft'
}
export class ConfigurablePlugin extends Plugin<Feature, Options>
{
  defaultOptions()
  {
    return new Options()
  }
}
```

#### init()

Main initialisation hook.

All plugins are ready.

`this.of` and `this.of.plugins` are safe to use.

## Design goals

- explicit over implicit
- no decorators
- no reflection
- predictable runtime behaviour
- TypeScript‑first, but JavaScript‑friendly

## Real‑world usage

This system is used in production for:
- [@itrocks/table](https://github.com/itrocks-ts/table) behaviours (`TableLink`, `HeadersSize`, etc.)
- [@itrocks/xtarget](https://github.com/itrocks-ts/xtarget) behaviours
- UI locking / feeds
- cross‑plugin coordination
- progressive feature composition

Patterns scale from small widgets to full applications.
