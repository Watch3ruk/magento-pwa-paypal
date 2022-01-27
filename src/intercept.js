const moduleOverrideWebpackPlugin = require('./moduleOverrideWebpackPlugin');
const componentOverrideMapping = require('./componentOverrideMapping')

module.exports = targets => {
    const peregrineTargets = targets.of('@magento/peregrine');
    const veniaTargets = targets.of('@magento/venia-ui');
    const buildpackTargets = targets.of('@magento/pwa-buildpack');
    const talonsTarget = peregrineTargets.talons;
    const paymentMethods = [
        'paypal_express'   
    ];

    targets.of('@magento/pwa-buildpack').specialFeatures.tap(flags => {
        flags[targets.name] = {esModules: true, cssModules: true, graphqlQueries: true, i18n: true};
    });

    veniaTargets.routes.tap(
        routesArray => {
            routesArray.push({
                name: 'Checkout Success Page',
                path: '@watch3r/magento-pwa-paypal/src/components/successPage'
            });

            return routesArray;
        });

    talonsTarget.tap(talonWrapperConfig => {
        talonWrapperConfig.CheckoutPage.useCheckoutPage.wrapWith(
            '@watch3r/magento-pwa-paypal/src/plugins/checkoutPageTalonPlugin'
        );
    });

    talonsTarget.tap(talonWrapperConfig => {
        talonWrapperConfig.CartPage.useCartPage.wrapWith(
            '@watch3r/magento-pwa-paypal/src/plugins/cartPageTalonPlugin'
        );
    });

    const gatewaysPath = '@watch3r/magento-pwa-paypal/src/components/gateways/'
    
    // can add more then one payment method 

    paymentMethods.map((method) =>
        veniaTargets.checkoutPagePaymentTypes.tap(
            checkoutPagePaymentTypes => checkoutPagePaymentTypes.add({
                paymentCode: method,
                importPath: gatewaysPath + method
            }),
        )
    );

    buildpackTargets.webpackCompiler.tap(compiler => {
        new moduleOverrideWebpackPlugin(componentOverrideMapping).apply(compiler);
    }); 
};
