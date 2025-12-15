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
  call [initPlugins('initPhase')](#initPlugins),
  replacing `initPhase` by each of your initialisation phase method.

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
class FeaturePlugin extends Plugin<Feature>
{

	constructor()
	{
		super()
		console.log('Your feature has been extended')
    // You can initialise the independent parts of your plugin object here.
    // Be careful: this.of is not initialised at this stage! 
	}

	init()
	{
		console.log('FeatureExtension.init()')
    // Its the best place to initialise things: this.of has been initisalised with the main feature object.
	}

}
```

### Overloading functions

A common way to add new features to your original feature is by overriding some of its functions
during the [init()](#Plugin-init) phase.

This common [AOP](https://en.wikipedia.org/wiki/Aspect-oriented_programming)
design pattern can be implemented very simply:

#### Example

```ts
import { Plugin }  from '@itrocks/plugin'
import { Feature } from './feature.js'

class FeaturePlugin extends Plugin<Feature>
{

	init()
	{
		console.log('Your feature has been extended')

		const superDo = this.of.do
		this.of.do    = function() {
			console.log('Your plugin does something before your feature does')
			return superDo.call(this)
		}
	}

}
```

Note: Be sure to follow the [SOLID](https://en.wikipedia.org/wiki/SOLID) principles:
your override can add features but should not alter the main feature's original behavior.

### Creating a plugin with options

If you need configurable things into your plugin, you can instantiate your own options object.

#### Example

```ts
import { Plugin }        from '@itrocks/plugin'
import { PluginOptions } from '@itrocks/plugin'
import { Feature }       from './feature.js'

class Options extends PluginOptions
{
	item: 'defaultValue' | 'value1' | 'value2' | 'value3' = 'defaultValue'
}

class FeaturePluginWithOptions extends Plugin<Feature, Options>
{

	init()
	{
		console.log('Your feature has been extended')

		const superDo = this.of.do
		this.of.do    = function() {
			console.log('Your plugin does something before your feature does, using option ' + this.options.item)
			return superDo.call(this)
		}
	}

}
```

### Instantiating your feature

Choose the options and plugins for each of your feature class instances.

#### Example

**Without plugin option, or using default plugin option values**
```ts
new Feature({ plugins: [FeaturePlugin] }).do()
```

**With custom option values**
```ts
const featurePlugin = new FeaturePlugin({
  item: 'value1'
})
new Feature({ plugins: [featurePlugin] }).do()
```

## HasPlugins API

The class your feature class should inherit from.
You need to remind HasPlugins the feature class name into a generic.

```ts
import { HasPlugins } from '@itrocks/plugin'
class Feature extends HasPlugins<Feature> {}
```

### Properties

// TODO Complete this sub-section... options, plugins. including access to this.plugins.PluginClassName example
// difference between this.options.plugins and this.plugins :
// - this.options.plugins is an array containing plugin types or plugin instances
// - this.plugins associates the plugin type name and the plugin instance associated to your feature instance

#### options
  
The `options` property receives the instance options, including the plugin list.

#### plugins

The `plugins` property is an object where each property name corresponds to a plugin type name,
and the value is the plugin instance associated with your feature.

### Methods

// TODO Complete this sub-sections: ... constructor, constructPlugins(), initPlugins()
// - constructor(): can receive main feature options (including a list of plugins) to initialise this.options.
// - constructPlugins() implements each of this.options.plugins, store their instance into this.plugins,
// initialises their plugin.of property, and must be called from your feature constructor. 
// - initPlugins() calls each plugin's init() function (or other initFunction). Called from your feature constuctor too,
// after constructPlugins() call. If plugin has no init function, don't worry: it won't called.

#### constructPlugins()

Instantiates each plugin listed in `options.plugins`. The instances are stored in the [plugins](#plugins) property.
// TODO if options.plugins contains already instantiated options (eg with options),
// these instances are used instead of being instantiated again.

#### initPlugins()

Calls [init()](#init) for each plugin instance stored in the [plugins](#plugins) property
if it is instantiated.

```ts
initPlugins(initFunction = 'init')
```

Your [feature class constructor](#creating-your-feature-class)
can call this method with different values for `initFunction`.
The matching functions in your plugins will be called, if they are instantiated.

#### constructor

#### constructPlugins

#### initPlugins

## Options API

The options for your feature link an option name to its value.

// TODO explain that if your feature extends HasPlugins, its options should extend Options

One specific option is the `plugins` applied to your feature:

// TODO Example

### plugins

The `plugins` property consists of an array of [Plugin](#plugin) types you want to apply to your feature.

These plugins will be instantiated during the [constructPlugins()](#constructPlugins) phase,
and their instances will be stored in the feature's [plugins](#plugins) property.

## Plugin API

```ts
class Plugin<O extends object, PO extends PluginOptions = PluginOptions>
```

The class your plugin classes must extend.

// TODO Presentation
// TODO class generics: feature class O is mandatory, PO options are optional (only if your plugin need them)
// TODO extend example.

### Properties

#### of

// TODO document this: beware it is initialised by the HasPlugins feature's constructPlugins() method only after
// the constructor is called. So it will be undefined during constructor call, and will contain the main feature
// instance after that (eg during initPlugins and any other methods when not called by constructor).

The `of` property stores the main feature object, which extends [HasPlugins](#HasPlugins).

You can access other plugins you depend on through `of.plugins`
once the [constructorPlugins()](#constructPlugins) phase is complete,
for example, during the [init()](#init) phase or when executing [overloaded functions](#Overloading-functions).

#### options

// TODO document this : will contain the plugin options (if there are)

### Methods

// TODO complete theses sections if needed.

#### constructor

```ts
constructor(options: Partial<PO> = {})
```

Your plugin can execute code during its `constructor` phase.

At this stage, not all feature plugins are instantiated, so avoid accessing plugins you may depend on.

// Stores the options in the [options](#options) property.
// TODO this.of is not available here!

#### defaultOptions

// TODO if the plugin accepts options, you should return a new Options() as PO here, with defaults.
// The instantiation is always the same (replace `Options` with your own options class that inherits from PluginOptions):
// This is mandatory so that the this.options contains default option object if constructor is called with partial or no options.

```ts
  defaultOptions()
  {
    return new Options()
  }
```

#### init()

Your plugin can execute code during its `init` phase.

At this stage, this.of and all feature plugins and are instantiated.
You can access your feature from this.of, so you can extend its behaviour.
You can access them from this.of.plugins, so you can access dependencies when your plugins depends on other ones.
