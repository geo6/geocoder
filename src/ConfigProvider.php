<?php

declare(strict_types=1);

namespace App;

/**
 * The configuration provider for the App module.
 *
 * @see https://docs.zendframework.com/zend-component-installer/
 */
class ConfigProvider
{
    /**
     * Returns the configuration array.
     */
    public function __invoke() : array
    {
        return [
            'dependencies' => $this->getDependencies(),
            'templates'    => $this->getTemplates(),
            'plates'       => [
                'extensions' => $this->getPlatesExentions(),
            ],
        ];
    }

    /**
     * Returns the container dependencies.
     */
    public function getDependencies() : array
    {
        return [
            'invokables' => [
                Handler\GeocodeHandler::class => Handler\GeocodeHandler::class,
                Handler\ReverseHandler::class => Handler\ReverseHandler::class,
            ],
            'factories'  => [
                Extension\TranslateExtension::class => Extension\Factory\TranslateExtensionFactory::class,

                Handler\HomeHandler::class  => Handler\Factory\HomeHandlerFactory::class,
            ],
        ];
    }

    /**
     * Returns the templates configuration.
     */
    public function getTemplates() : array
    {
        return [
            'paths' => [
                'app'     => ['templates/app'],
                'error'   => ['templates/error'],
                'layout'  => ['templates/layout'],
                'partial' => ['templates/partial'],
            ],
        ];
    }

    /**
     * Returns the Plates extentsions configuration.
     */
    public function getPlatesExentions() : array
    {
        return [
            Extension\TranslateExtension::class,
        ];
    }
}
