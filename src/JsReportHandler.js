const fs = require('node:fs');
const path = require('node:path');

class JsReportHandler
{
    _jsReport;
    jsReportPath = path.resolve(process.cwd(), 'jsreport')

    _recipe = 'phantom-pdf';
    _engine = 'handlebars';

    get recipe() {
        return this._recipe;
    }

    set recipe(value) {
        this._recipe = value;
    }

    get engine() {
        return this._engine;
    }

    set engine(value) {
        this._engine = value;
    }

    /**
     * Constructor to manage JsReport instance.
     * This will construct JsReport instance with the necessary configurations and extensions.
     */
    constructor(extensions)
    {
        // Initialize JsReport instance.
        this._jsReport = require('@jsreport/jsreport-core')(this.config());
        // Import chrome-pdf recipe.
        this._jsReport.use(require('@jsreport/jsreport-phantom-pdf')({
            // waitForNetworkIdle: true, Does not work with phantom-pdf
            waitForJS: true,
        }))
        // Import handlebars engine.
        this._jsReport.use(require('@jsreport/jsreport-handlebars')())
        // Import fs-store, which is used to store templates.
        this._jsReport.use(require('@jsreport/jsreport-fs-store')())
        // Import assets, which are used to store images, fonts, etc.
        this._jsReport.use(require('@jsreport/jsreport-assets')())
    }

    /**
     * Initialize JsReport instance and adds assets.
     * @param assets
     * @returns {Promise<void>}
     */
    async init(assets)
    {
        await this._jsReport.init();
        for (const asset of assets)
        {
            try {
                if (asset.isAsset === true) await this.insertAsset(asset.absolutePath, asset.name);
                else await this.insertTemplate(asset.absolutePath, asset.name);
            } catch (error) {
                console.log(error.message);
            }
        }
    }

    /**
     * Configuration for JsReport instance.
     */
    config()
    {
        return {
            rootDirectory: process.cwd(),
            tempDirectory: this.jsReportPath,
            logger: {
                console: {
                    transport: "console",
                    level: "debug"
                },
                file: {
                    transport: "file",
                    level: "info",
                    filename: "logs/reporter.log"
                },
                error: {
                    transport: "file",
                    level: "error",
                    filename: "logs/error.log"
                }
            },
            store: {
                provider: "fs"
            },
            extensions: {
                assets: {
                    publicAccessEnabled: true,
                    allowLocalFilesAccess: true
                },
                fsStore: {
                    dataDirectory: this.jsReportPath
                }
            },
            autoTempCleanup: true,
            useExtensionsLocationCache: false
        };
    }

    /**
     * Store asset to use it on templates.
     * @param absolutePath
     * @param name
     * @returns {Promise<void>}
     */
    async insertAsset(absolutePath, name)
    {
        const assets = this._jsReport.documentStore.collection('assets');
        await assets.insert({
            name: name,
            content: fs.readFileSync(absolutePath),
        });
    }

    /**
     * Store template in JsReport instance.
     * @param absolutePath
     * @param name
     * @returns {Promise<void>}
     */
    async insertTemplate(absolutePath, name)
    {
        const template = fs.readFileSync(absolutePath, 'utf8');
        await this._jsReport.documentStore.collection('templates').insert({
            name: name,
            content: template,
            engine: this._engine,
            recipe: this._recipe
        });
    }

    /**
     * Render template with data.
     * @param templateName
     * @param data
     * @returns {Promise<*>}
     */
    async render(templateName, data)
    {
        return await this._jsReport.render({
            template: {
                name: templateName,
                engine: this._engine,
                recipe: this._recipe
            },
            data: data
        });
    }
}

module.exports = JsReportHandler;
