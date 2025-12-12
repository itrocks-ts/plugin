
export class HasPlugins<O extends object>
{
	readonly options = new Options<O>
	readonly plugins:  Plugins<O> = {}

	constructor(options: Partial<Options<O>> = {})
	{
		Object.assign(this.options, options)
	}

	protected constructPlugins()
	{
		for (let plugin of this.options.plugins) {
			if (typeof plugin === 'function') {
				this.plugins[plugin.name] = plugin = new plugin()
			}
			else {
				this.plugins[Object.getPrototypeOf(plugin).constructor.name] = plugin
			}
			plugin.of = this as any as HasPlugins<O> & O
		}
	}

	protected initPlugins()
	{
		for (const plugin of Object.values(this.plugins)) {
			if (plugin.init !== Plugin.prototype.init) plugin.init()
		}
	}

}

export class Options<O extends object>
{
	[index: string]: any
	plugins: (Plugin<O> | typeof Plugin<O>)[] = []
}

export class Plugin<O extends object, PO extends PluginOptions = PluginOptions>
{
	public of!:     HasPlugins<O> & O
	public options: PO

	constructor(options: Partial<PO> = {})
	{
		this.options = Object.assign(this.defaultOptions(), options)
	}

	defaultOptions(): PO
	{
		return new PluginOptions() as PO
	}

	init()
	{}

}

export class PluginOptions
{
	[index: string]: any
}

type Plugins<O extends object> = { [index: string]: Plugin<O> }
