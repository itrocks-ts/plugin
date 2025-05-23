[![npm version](https://img.shields.io/npm/v/@itrocks/plugin?logo=npm)](https://www.npmjs.org/package/@itrocks/plugin)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/plugin)](https://www.npmjs.org/package/@itrocks/plugin)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/plugin?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/plugin)
[![issues](https://img.shields.io/github/issues/itrocks-ts/plugin)](https://github.com/itrocks-ts/plugin/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# plugin

A structure that allows classes to be extended with new behaviors via plugin.

## Installation

```bash
npm i @itrocks/plugin
```

## Usage

### Creating your Feature Class

- Extend your feature class from [HasPlugins](#HasPlugins).
- Call [super()](#HasPlugins-constructor), [constructPlugins()](#constructPlugins) and [initPlugins()](#initPlugins)
  in its constructor.
- If additional initialization phases are needed in your plugins,
  call [initPlugins('initPhase')](#initPlugins) for each phase.

#### Example

```ts
class Feature extends HasPlugins<Feature>
{
	
	constructor(options: Partial<Options<Feature>> = {})
	{
		super(options)
		this.constructPlugins()
		this.initPlugins()
	}

	do()
	{
		console.log('your feature does something')
	}

}
```

### Creating a plugin

- Extend your plugin class from [Plugin](#Plugin).
- implement the [constructor()](#Plugin-constructor) of your plugin.
- implement the [init()](#init) phase of your plugin.

#### Example

```ts
class FeatureExtension extends Plugin<Feature>
{

	constructor(of: Feature)
	{
		super(of)
		console.log('Your feature has been extended')
	}

	init()
	{
		console.log('FeatureExtension.init()')
	}

}
```

### Overloading functions

A common way to add new features to your orignal feature is by overriding some of its functions
during the [constructor()](#Plugin-constructor) phase.

This common [AOP](https://en.wikipedia.org/wiki/Aspect-oriented_programming)
design pattern can be implemented very simply:

#### Example

```ts
class FeatureExtension extends Plugin<Feature>
{

	constructor(of: Feature)
	{
		super(of)
		console.log('Your feature has been extended')

		const superDo = this.of.do
		this.of.do    = function() {
			console.log('Your plugin does something before your feature does')
			return superDo.call(this)
		}
	}

}
```

Be sure to follow the [SOLID](https://en.wikipedia.org/wiki/SOLID) principles:
your override can add features but should not alter the main feature's original behavior.

### Instantiating your feature

Choose the options and plugins for each of your feature class instances.

#### Example

```ts
new Feature({ plugins: [FeatureExtension] }).do()
```

## API

### HasPlugins

The class your feature class should inherit from.

#### options

The `options` property receives the instance options, including the plugin list.

#### plugins

The `plugins` property is an object where each property name corresponds to a plugin type name,
and the value is the plugin instance associated with your feature.

#### HasPlugins constructor()

Stores the options passed to your feature's constructor in the [options](#options) property. 

#### constructPlugins()

Instantiates each plugin listed in `options.plugins`. The instances are stored in the [plugins](#plugins) property.

#### initPlugins()

Calls [init()](#init) for each plugin instance stored in the [plugins](#plugins) property
if it is instantiated.

```ts
initPlugins(initFunction = 'init')
```

Your [feature class constructor](#creating-your-feature-class)
can call this method with different values for `initFunction`.
The matching functions in your plugins will be called, if they are instantiated.

### Options

The options for your feature link an option name to its value.

One specific option is the `plugins` applied to your feature:

#### plugins

The `plugins` property consists of an array of [Plugin](#plugin) types you want to apply to your feature.

These plugins will be instantiated during the [constructPlugins()](#constructPlugins) phase,
and their instances will be stored in the feature's [plugins](#plugins) property.

### Plugin

The class your plugin classes must extend.

#### of

The `of` property stores the main feature object, which extends [HasPlugins](#HasPlugins).

You can access other plugins you depend on through `of.plugins`
once the [constructorPlugins()](#constructPlugins) phase is complete,
for example, during the [init()](#init) phase or when executing [overloaded functions](#Overloading-functions).

#### Plugin constructor()

Your plugin can execute code during its `constructor` phase.

At this stage, not all feature plugins are instantiated, so avoid accessing plugins you may depend on.

#### init()

Your plugin can execute code during its `init` phase.

At this stage, all feature plugins are instantiated, so you can access dependencies.
