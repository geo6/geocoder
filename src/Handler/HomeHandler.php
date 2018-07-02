<?php

declare(strict_types=1);

namespace App\Handler;

use App\Middleware\LocalizationMiddleware;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Zend\Diactoros\Response\HtmlResponse;
use Zend\Expressive\Router\RouterInterface;
use Zend\Expressive\Template\TemplateRendererInterface;

class HomeHandler implements RequestHandlerInterface
{
    private $containerName;
    private $router;
    private $template;

    public function __construct(RouterInterface $router, TemplateRendererInterface $template, string $containerName)
    {
        $this->containerName = $containerName;
        $this->router = $router;
        $this->template = $template;
    }

    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        $locale = $request->getAttribute(LocalizationMiddleware::LOCALIZATION_ATTRIBUTE);

        return new HtmlResponse($this->template->render('app::home', [
            'locale' => $locale
        ]));
    }
}
