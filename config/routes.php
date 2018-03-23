<?php

declare(strict_types=1);

use Psr\Container\ContainerInterface;
use Zend\Expressive\Application;
use Zend\Expressive\MiddlewareFactory;

return function (Application $app, MiddlewareFactory $factory, ContainerInterface $container) : void {
    $app->get('/app/geocoder/', App\Handler\HomeHandler::class, 'home');
    $app->post('/app/geocoder/geocode', App\Handler\GeocodeHandler::class, 'geocode');
    $app->post('/app/geocoder/reverse', App\Handler\ReverseHandler::class, 'reverse');
};
