<?php

declare(strict_types=1);

namespace App\Handler;

use App\Middleware\ConfigMiddleware;
use Geocoder\Query\ReverseQuery;
use Geocoder\Exception\InvalidServerResponse;
use Geocoder\Exception\UnsupportedOperation;
use Locale;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Zend\Diactoros\Response\JsonResponse;
use Zend\Expressive\Router\RouterInterface;
use Zend\Expressive\Template\TemplateRendererInterface;

class ReverseHandler implements RequestHandlerInterface
{
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        $params = $request->getParsedBody();

        $httpClient = new \Http\Adapter\Guzzle6\Client();
        switch ($params['source']) {
            case 'bpost':
                $provider = new \Geocoder\Provider\bpost\bpost($httpClient);
                break;
            case 'geo6':
                $provider = new \Geocoder\Provider\Addok\Addok($httpClient, 'http://addok.geocode.be/');
                break;
            case 'geopunt':
                $provider = new \Geocoder\Provider\Geopunt\Geopunt($httpClient);
                break;
            case 'spw':
                $provider = new \Geocoder\Provider\SPW\SPW($httpClient);
                break;
            case 'urbis':
                $provider = new \Geocoder\Provider\UrbIS\UrbIS($httpClient);
                break;
            case 'nominatim':
            default:
                $provider = \Geocoder\Provider\Nominatim\Nominatim::withOpenStreetMapServer($httpClient);
                break;
        }
        $geocoder = new \Geocoder\StatefulGeocoder($provider, Locale::getDefault());

        $query = ReverseQuery::fromCoordinates($params['lat'], $params['lng']);
        $query = $query->withData('zoom', $params['zoom']);
        $query = $query->withLimit(1);

        try {
            $result = $geocoder->reverseQuery($query);
        } catch (InvalidServerResponse $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        } catch (UnsupportedOperation $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }

        $json = [
          'type' => 'FeatureCollection',
          'features' => []
        ];

        if (count($result) === 0) {
            header('Content-Type: application/json');
            echo json_encode($json);

            return true;
        } else {
            foreach ($result as $location) {
                $dumper = new \Geocoder\Dumper\GeoJson();
                $dump = json_decode($dumper->dump($location));

                switch ($params['source']) {
                    case 'geo6':
                    case 'geopunt':
                    case 'spw':
                    case 'urbis':
                        break;
                    case 'nominatim':
                    default:
                        $dump->properties->attribution = $location->getAttribution();
                        $dump->properties->formattedAddress = $location->getDisplayName();
                        break;
                }

                if (!isset($dump->properties->formattedAddress)) {
                    $formatter = new \Geocoder\Formatter\StringFormatter();
                    $dump->properties->formattedAddress = $formatter->format($location, '%n %S, %z %L');
                }

                $json['features'][] = $dump;
            }

            return new JsonResponse($json);
        }
    }
}
