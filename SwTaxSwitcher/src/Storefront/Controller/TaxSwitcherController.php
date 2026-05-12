<?php

declare(strict_types=1);

namespace TaxSwitcher\Storefront\Controller;

use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['storefront']])]
class TaxSwitcherController extends StorefrontController
{
    #[Route(
        path: '/tax/switch',
        name: 'taxswitcher.tax.switch',
        methods: ['POST', 'GET']
    )]
    public function switch(Request $request): RedirectResponse
    {
        $net = $request->request->get('net');
        $returnUrl = $request->request->get('return', '/');

        $response = new RedirectResponse($returnUrl);
        $response->headers->setCookie(
            new Cookie('taxMode', $net ? 'net' : 'gross', time() + 60 * 60 * 24 * 365)
        );

        return $response;
    }

    #[Route(
        path: '/tax/switch/modal',
        name: 'taxswitcher.tax.switch.modal',
        methods: ['GET']
    )]
    public function switchModal(Request $request): Response
    {
        if ($request->cookies->has('taxPromptShown')) {
            return $this->redirect($request->headers->get('referer') ?? '/');
        }

        $response = $this->renderStorefront('@SwTaxSwitcher/storefront/page/tax-switcher-first-modal.html.twig');

        $response->headers->setCookie(
            new Cookie('taxPromptShown', '1', time() + 60 * 60 * 24 * 365)
        );

        return $response;
    }
}
