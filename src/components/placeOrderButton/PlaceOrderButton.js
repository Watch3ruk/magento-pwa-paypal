import React from 'react';
import { FormattedMessage } from 'react-intl';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';

import { usePlaceOrderButton } from '../talons/usePlaceOrderButton';
import placeOrderButtonCollection from './placeOrderButtonCollection'; // *

const PlaceOrderButton = props => {
    const { paymentMethod, loading } = usePlaceOrderButton();
    const { originalPlaceOrderButton, handlePlaceOrder } = props;

    if (loading) {
        return (
            <LoadingIndicator>
                <FormattedMessage
                    id={'checkout.placeLoading'}
                    defaultMessage={'Collect Order Totals...'}
                />
            </LoadingIndicator>
        );
    }

    const PlaceOrderButton = placeOrderButtonCollection[paymentMethod] || null;

    if (PlaceOrderButton) {
        return <PlaceOrderButton handlePlaceOrder={handlePlaceOrder} />;
    }

    return originalPlaceOrderButton;
};

export default PlaceOrderButton;
