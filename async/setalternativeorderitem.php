<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


    class Cart2_SetAlternativeOrderItem_AsyncAction extends Basic_Abstract_AsyncAction
    {

        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');

            $id = $this->_getPositiveInteger('id', $_params, true);
            $code = $this->_getString('code', $_params, true);

            // Get product for alternative
            $product = $mySql->select('*', 'products', array('code' => $code, 'active' => 1))->fetchAssoc();
            if ($product === false)
                throw new AsyncActionException('Продукт с кодом \''.$code.'\' не найден.');

            // Get orderItem
            if (!$orderItem = $mySql->select('*', 'orderItems', array('id' => $id))->fetchAssoc())
                throw new AsyncActionException('Позиция не найдена.');

            // Get order
            if (!$order = $mySql->select('*', 'orders', array('id' => $orderItem['orderId']))->fetchAssoc())
                throw new AsyncActionException('Заказ не найден.');

            $orderItem['alternative_for_id'] = is_null($orderItem['alternative_for_id']) ? $orderItem['id'] : $orderItem['alternative_for_id'];
            unset($orderItem['id']);
            $orderItem['comment'] = 'вместо ' . $orderItem['code'];
            $orderItem['code'] = $code;
            $orderItem['price'] = $this->getClientPrice($product['id'], $orderItem['availableQuantity'], $order['client_id']);
            $orderItem['name'] = $product['description'];
            $orderItem['requiredQuantity'] = 0;

            $mySql->insert('orderItems',  $orderItem);
            $mySql->update('orderItems',  array('availableQuantity' => 0, 'comment' => "предложено {$code}" ), array('id' => $id));
        }

        public function getClientPrice($_product_id, $_quantity, $_client_id)
        {
            $mySql = Application::getService('basic.mysqlmanager');
            $priceFields = array('price_usd', 'price_usd_1', 'price_usd_2');

            if (!$prices = $mySql->select($priceFields, 'client_prices', array('product_id' => $_product_id, 'client_id' => $_client_id))->fetchAssoc())
                $prices = $mySql->select($priceFields, 'products', array('id' => $_product_id))->fetchAssoc();

            if (($_quantity >= 100) and ($prices['price_usd_2'] > 0)) $price = $prices['price_usd_2'];
            else if ($_quantity >= 10 and ($prices['price_usd_1'] > 0)) $price = $prices['price_usd_1'];
            else $price = $prices['price_usd'];

            return $price;
        }

    }

?>