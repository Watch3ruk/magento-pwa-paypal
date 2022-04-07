// copied from @magento/venia-ui/lib/components/CheckoutPage/PaymentInformation/creditCard.js
import React, { useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { bool, func, shape, string } from 'prop-types';
import { useCreditCard } from '../talons/useCreditCard';

import { isRequired } from '@magento/venia-ui/lib/util/formValidators';
import Country from '@magento/venia-ui/lib/components/Country';
import Region from '@magento/venia-ui/lib/components/Region';
import Postcode from '@magento/venia-ui/lib/components/Postcode';
import Checkbox from '@magento/venia-ui/lib/components/Checkbox';
import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import StripeDropin from './stripeDropin.js';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import { useStyle } from '@magento/venia-ui/lib/classify';

import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/PaymentInformation/creditCard.module.css';
import FormError from '@magento/venia-ui/lib/components/FormError';
import GoogleReCaptcha from '@magento/venia-ui/lib/components/GoogleReCaptcha';
import {
    PayPalScriptProvider,
    usePayPalScriptReducer
} from '@paypal/react-paypal-js';


const STEP_DESCRIPTIONS = [
    { defaultMessage: 'Loading Payment', id: 'checkoutPage.step0' },
    {
        defaultMessage: 'Checking Credit Card Information',
        id: 'checkoutPage.step1'
    },
    {
        defaultMessage: 'Checking Credit Card Information',
        id: 'checkoutPage.step2'
    },
    {
        defaultMessage: 'Checking Credit Card Information',
        id: 'checkoutPage.step3'
    },
    {
        defaultMessage: 'Saved Credit Card Information Successfully',
        id: 'checkoutPage.step4'
    }
];

/**
 * The initial view for the "Stripe Payments" payment method.
 */
const CreditCard = props => {
    const {
        classes: propClasses,
        onPaymentSuccess: onSuccess,
        onPaymentReady: onReady,
        onPaymentError: onError,
        resetShouldSubmit,
        shouldSubmit,
        paymentCode,
        history
    } = props;
    const { formatMessage } = useIntl();

    const classes = useStyle(defaultClasses, propClasses);

    const talonProps = useCreditCard({
        onSuccess,
        onReady,
        onError,
        shouldSubmit,
        resetShouldSubmit,
        paymentCode
    });

    const {
        errors,
        shouldRequestPayment,
        onPaymentError,
        onPaymentSuccess,
        onPaymentReady,
        isBillingAddressSame,
        isLoading,
        /**
         * `stepNumber` depicts the state of the process flow in credit card
         * payment flow.
         *
         * `0` No call made yet
         * `1` Billing address mutation intiated
         * `2` Paypal paymentIntent requsted
         * `3` Payment information mutation intiated
         * `4` All mutations done
         */
        stepNumber,
        initialValues,
        shippingAddressCountry,
        cartTotalData,
        setPayerData,
        token,
        paypalLoading
    } = talonProps;

    const creditCardComponentClassName = isLoading
        ? classes.credit_card_root_hidden
        : classes.credit_card_root;

    const billingAddressFieldsClassName = isBillingAddressSame
        ? classes.billing_address_fields_root_hidden
        : classes.billing_address_fields_root;

    /**
     * Instead of defining classes={root: classes.FIELD_NAME}
     * we are using useMemo to only do it once (hopefully).
     */
    const fieldClasses = useMemo(() => {
        return [
            'first_name',
            'last_name',
            'country',
            'street1',
            'street2',
            'city',
            'region',
            'postal_code',
            'phone_number'
        ].reduce((acc, fieldName) => {
            acc[fieldName] = { root: classes[fieldName] };

            return acc;
        }, {});
    }, [classes]);

    /**
     * These 2 functions are wrappers around the `isRequired` function
     * of `formValidators`. They perform validations only if the
     * billing address is different from shipping address.
     *
     * We write this function in `venia-ui` and not in the `peregrine` talon
     * because it references `isRequired` which is a `venia-ui` function.
     */
    const isFieldRequired = useCallback((value, { isBillingAddressSame }) => {
        if (isBillingAddressSame) {
            /**
             * Informed validator functions return `undefined` if
             * validation is `true`
             */
            return undefined;
        } else {
            return isRequired(value);
        }
    }, []);

    const stepTitle = STEP_DESCRIPTIONS[stepNumber].defaultMessage
        ? formatMessage({
              id: STEP_DESCRIPTIONS[stepNumber].id,
              defaultMessage: STEP_DESCRIPTIONS[stepNumber].defaultMessage
          })
        : formatMessage({
              id: 'checkoutPage.loadingPayment',
              defaultMessage: 'Loading Payment'
          });

    const loadingIndicator = isLoading ? (
        <LoadingIndicator>{stepTitle}</LoadingIndicator>
    ) : null;

    return (
        <div className={classes.root} data-cy="CreditCard-root">
            <div className={creditCardComponentClassName}>
                <FormError
                    allowErrorMessages
                    classes={{ root: classes.formErrorContainer }}
                    errors={Array.from(errors.values())}
                />
                <div className={classes.dropin_root}>
                    <StripeDropin
                        onError={onPaymentError}
                        onReady={onPaymentReady}
                        onSuccess={onPaymentSuccess}
                        shouldRequestPayment={shouldRequestPayment}
                        shouldTeardownDropin={shouldTeardownDropin}
                        resetShouldTeardownDropin={resetShouldTeardownDropin}
                    />
                </div>
                <div
                    data-cy="CreditCard-AddressCheck-root"
                    className={classes.address_check}
                >
                    <Checkbox
                        data-cy="PaymentInformation-billingAddressSame"
                        field="isBillingAddressSame"
                        label={formatMessage({
                            id: 'checkoutPage.billingAddressSame',
                            defaultMessage:
                                'Billing address same as shipping address'
                        })}
                        initialValue={initialValues.isBillingAddressSame}
                    />
                </div>
                <div
                    data-cy="CreditCard-billingAddressFields"
                    className={billingAddressFieldsClassName}
                >
                    <Field
                        id="firstName"
                        classes={fieldClasses.first_name}
                        label={formatMessage({
                            id: 'global.firstName',
                            defaultMessage: 'First Name'
                        })}
                    >
                        <TextInput
                            data-cy="CreditCard-billingAddress-firstname"
                            id="firstName"
                            field="firstName"
                            validate={isFieldRequired}
                            initialValue={initialValues.firstName}
                        />
                    </Field>
                    <Field
                        id="lastName"
                        classes={fieldClasses.last_name}
                        label={formatMessage({
                            id: 'global.lastName',
                            defaultMessage: 'Last Name'
                        })}
                    >
                        <TextInput
                            data-cy="CreditCard-billingAddress-lastname"
                            id="lastName"
                            field="lastName"
                            validate={isFieldRequired}
                            initialValue={initialValues.lastName}
                        />
                    </Field>
                    <Country
                        data-cy="CreditCard-billingAddress-country"
                        classes={fieldClasses.country}
                        validate={isFieldRequired}
                        initialValue={
                            /**
                             * If there is no initial value to start with
                             * use the country from shipping address.
                             */
                            initialValues.country || shippingAddressCountry
                        }
                    />
                    <Field
                        id="street1"
                        classes={fieldClasses.street1}
                        label={formatMessage({
                            id: 'global.streetAddress',
                            defaultMessage: 'Street Address'
                        })}
                    >
                        <TextInput
                            data-cy="CreditCard-billingAddress-street1"
                            id="street1"
                            field="street1"
                            validate={isFieldRequired}
                            initialValue={initialValues.street1}
                        />
                    </Field>
                    <Field
                        id="street2"
                        classes={fieldClasses.street2}
                        label={formatMessage({
                            id: 'global.streetAddress2',
                            defaultMessage: 'Street Address 2'
                        })}
                        optional={true}
                    >
                        <TextInput
                            data-cy="CreditCard-billingAddress-street2"
                            id="street2"
                            field="street2"
                            initialValue={initialValues.street2}
                        />
                    </Field>
                    <Field
                        id="city"
                        classes={fieldClasses.city}
                        label={formatMessage({
                            id: 'global.city',
                            defaultMessage: 'City'
                        })}
                    >
                        <TextInput
                            data-cy="CreditCard-billingAddress-city"
                            id="city"
                            field="city"
                            validate={isFieldRequired}
                            initialValue={initialValues.city}
                        />
                    </Field>
                    <Region
                        data-cy="CreditCard-billingAddress-region"
                        classes={fieldClasses.region}
                        initialValue={initialValues.region}
                        validate={isFieldRequired}
                        fieldInput={'region[label]'}
                        fieldSelect={'region[region_id]'}
                        optionValueKey={'id'}
                    />
                    <Postcode
                        data-cy="CreditCard-billingAddress-postcode"
                        classes={fieldClasses.postal_code}
                        validate={isFieldRequired}
                        initialValue={initialValues.postcode}
                    />
                    <Field
                        id="phoneNumber"
                        classes={fieldClasses.phone_number}
                        label={formatMessage({
                            id: 'global.phoneNumber',
                            defaultMessage: 'Phone Number'
                        })}
                    >
                        <TextInput
                            data-cy="CreditCard-billingAddress-phoneNumber"
                            id="phoneNumber"
                            field="phoneNumber"
                            validate={isFieldRequired}
                            initialValue={initialValues.phoneNumber}
                        />
                    </Field>
                </div>
                <GoogleReCaptcha {...recaptchaWidgetProps} />
            </div>
            {loadingIndicator}
        </div>
    );
};

export default CreditCard;

CreditCard.propTypes = {
    classes: shape({
        root: string,
        dropin_root: string,
        billing_address_fields_root: string,
        first_name: string,
        last_name: string,
        city: string,
        region: string,
        postal_code: string,
        phone_number: string,
        country: string,
        street1: string,
        street2: string,
        address_check: string,
        credit_card_root: string,
        credit_card_root_hidden: string
    }),
    shouldSubmit: bool.isRequired,
    onPaymentSuccess: func,
    onPaymentReady: func,
    onPaymentError: func,
    resetShouldSubmit: func.isRequired
};
