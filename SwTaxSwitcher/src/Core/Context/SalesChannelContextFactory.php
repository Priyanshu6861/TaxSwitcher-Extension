<?php

declare(strict_types=1);

namespace TaxSwitcher\Core\Context;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\HttpFoundation\RequestStack;
use Shopware\Core\System\SalesChannel\Context\SalesChannelContextFactory as ShopwareSalesChannelContextFactory;
use Shopware\Core\Checkout\Cart\Tax\TaxDetector;
use Shopware\Core\System\SystemConfig\SystemConfigService;

class SalesChannelContextFactory extends ShopwareSalesChannelContextFactory
{
    public function __construct(
        private ShopwareSalesChannelContextFactory $inner,
        private TaxDetector $taxDetector,
        private RequestStack $requestStack,
        private SystemConfigService $systemConfigService
    ) {}

    public function create(string $token, string $salesChannelId, array $options = []): SalesChannelContext
    {
        $context = $this->inner->create($token, $salesChannelId, $options);

        if ($this->systemConfigService->get('SwTaxSwitcher.config.taxSwitcherEnable', $salesChannelId)) {
            $request = $this->requestStack->getMainRequest();

            if (!$request) {
                return $context;
            }
            $taxMode = $request->cookies->get('taxMode');

            if ($taxMode === 'net') {
                $context->getCurrentCustomerGroup()->setDisplayGross(false);
            } elseif ($taxMode === 'gross') {
                $context->getCurrentCustomerGroup()->setDisplayGross(true);
            }
            $context->setTaxState($this->taxDetector->getTaxState($context));
        }

        return $context;
    }
}
