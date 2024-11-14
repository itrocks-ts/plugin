import { HasPlugins, Options, Plugin } from '../plugin.js'

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

	init()
	{
		console.log('FeatureExtension.init()')
	}

}

new Feature({ plugins: [FeatureExtension] }).do()
