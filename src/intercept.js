module.exports = targets => {
    const targetables = Targetables.using(targets);

    const CheckoutPageComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/CheckoutPage/checkoutPage.js'
    );

    const CustomPlaceOrder = CheckoutPageComponent.addImport(
        "CustomPlaceOrder from '@watch3r/magento-pwa-paypal/src/components/placeOrderButton'"
    );

    /**
     * Replace the place order button to the checkout page
     */
    const placeOrderButton = '{placeOrderButton}';
    CheckoutPageComponent.insertBeforeSource(
        placeOrderButton,
        '{customPlaceOrderButton}',
        {
            remove: placeOrderButton.length
        }
    );

    /**
     * Define the custom place order button
     */
    CheckoutPageComponent.insertBeforeSource(
        'const orderSummary',
        `const customPlaceOrderButton = checkoutStep === CHECKOUT_STEP.REVIEW ? (<${CustomPlaceOrder} originalPlaceOrderButton={placeOrderButton} handlePlaceOrder={handlePlaceOrder}></${CustomPlaceOrder}>): null;\n`
    );
